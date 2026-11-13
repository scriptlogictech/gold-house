
const mongoose = require("mongoose");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");
const InvoiceReturn = require("../models/InvoiceReturn");

const METHODS = ["cash", "upi", "card", "bank_transfer", "other"];

const actorId = (user) => user?._id || user?.id || null;
const isAdmin = (req) => req.user?.role === "admin";
const validId = (id) => mongoose.isValidObjectId(id);

const toPaise = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) return null;

  const paise = Math.round(amount * 100);

  return Math.abs(paise / 100 - amount) < 0.000001
    ? paise
    : null;
};

const fail = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  throw error;
};

const sendError = (res, error) => {
  const status = error.status || error.statusCode || 500;

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message:
        "This financial request was already processed. Refresh the invoice history before retrying.",
    });
  }

  return res.status(status).json({
    success: false,
    message:
      status === 500 && process.env.NODE_ENV === "production"
        ? "An unexpected server error occurred."
        : error.message,
  });
};

const requireIdempotencyKey = (req) => {
  const key = String(req.get("Idempotency-Key") || "").trim();

  if (!key || key.length > 120) {
    fail(
      "Send a unique Idempotency-Key header for this financial request.",
      400
    );
  }

  return key;
};

const getInvoice = async (id, session) => {
  if (!validId(id)) {
    fail("Invalid invoice ID.", 400);
  }

  let query = Invoice.findById(id);

  if (session) {
    query = query.session(session);
  }

  const invoice = await query;

  if (!invoice) {
    fail("Invoice not found.", 404);
  }

  return invoice;
};

const getTotals = async (invoiceId, session) => {
  let paymentsQuery = Payment.aggregate([
    {
      $match: {
        invoice: new mongoose.Types.ObjectId(invoiceId),
      },
    },
    {
      $group: {
        _id: {
          type: "$type",
          approvalStatus: "$approvalStatus",
        },
        amount: {
          $sum: "$amountPaise",
        },
      },
    },
  ]);

  let returnsQuery = InvoiceReturn.aggregate([
    {
      $match: {
        invoice: new mongoose.Types.ObjectId(invoiceId),
      },
    },
    {
      $group: {
        _id: null,
        amount: {
          $sum: "$amountPaise",
        },
      },
    },
  ]);

  if (session) {
    paymentsQuery = paymentsQuery.session(session);
    returnsQuery = returnsQuery.session(session);
  }

  const [rows, returnRows] = await Promise.all([
    paymentsQuery,
    returnsQuery,
  ]);

  let paid = 0;
  let approvedRefunds = 0;
  let pendingRefunds = 0;

  for (const row of rows) {
    if (row._id.type === "payment") {
      paid += row.amount;
    }

    if (
      row._id.type === "refund" &&
      row._id.approvalStatus !== "rejected"
    ) {
      if (row._id.approvalStatus === "pending") {
        pendingRefunds += row.amount;
      } else {
        // Includes approved, not_required, and legacy refunds.
        approvedRefunds += row.amount;
      }
    }
  }

  return {
    paid,
    approvedRefunds,
    pendingRefunds,
    returned: returnRows[0]?.amount || 0,
    netCollected: paid - approvedRefunds,
  };
};

const touchInvoice = async (invoice, user, session) => {
  invoice.updatedBy = actorId(user);
  await invoice.save({ session });
};

const validateDate = (value, label) => {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime()) || date > new Date()) {
    fail(`Enter a valid ${label} date that is not in the future.`);
  }

  return date;
};

// POST /:id/post
const postInvoice = async (req, res) => {
  try {
    const invoice = await getInvoice(req.params.id);

    if (invoice.status !== "pending") {
      return res.status(409).json({
        success: false,
        message: "Only pending invoices can be posted.",
      });
    }

    invoice.status = "posted";
    invoice.updatedBy = actorId(req.user);

    await invoice.save();

    return res.json({
      success: true,
      message: "Invoice posted successfully.",
      data: invoice,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// POST /:id/payments
const addPayment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const key = requireIdempotencyKey(req);
    const amountPaise = toPaise(req.body.amount);
    const method = String(req.body.method || "").toLowerCase();

    if (!amountPaise) {
      fail("Enter a valid payment amount greater than zero.");
    }

    if (!METHODS.includes(method)) {
      fail("Invalid payment method.");
    }

    const paidAt = validateDate(req.body.paidAt, "payment");

    let created;
    let outstanding;

    await session.withTransaction(async () => {
      const invoice = await getInvoice(req.params.id, session);

      if (invoice.status !== "posted") {
        fail("Payments can only be added to posted invoices.", 409);
      }

      const duplicate = await Payment.findOne({
        invoice: invoice._id,
        idempotencyKey: key,
      }).session(session);

      if (duplicate) {
        created = duplicate;
        outstanding = null;
        return;
      }

      const totals = await getTotals(invoice._id, session);

      const payable = Math.max(
        0,
        invoice.totalAmountPaise - totals.returned
      );

      outstanding =
        payable - (totals.paid - totals.approvedRefunds);

      if (amountPaise > outstanding) {
        fail("Payment cannot exceed the outstanding invoice balance.");
      }

      [created] = await Payment.create(
        [
          {
            invoice: invoice._id,
            customer: invoice.customer,
            type: "payment",
            amountPaise,
            method,
            paidAt,
            idempotencyKey: key,
            transactionReference: String(
              req.body.transactionReference || ""
            ).trim(),
            notes: String(req.body.notes || "").trim(),
            recordedBy: actorId(req.user),
          },
        ],
        { session }
      );

      outstanding -= amountPaise;

      await touchInvoice(invoice, req.user, session);
    });

    return res.status(201).json({
      success: true,
      message: "Payment recorded successfully.",
      data: {
        payment: created,
        outstandingPaise: outstanding,
        outstandingAmount:
          outstanding == null ? null : outstanding / 100,
      },
    });
  } catch (error) {
    return sendError(res, error);
  } finally {
    await session.endSession();
  }
};

// GET /:id/payments
const getPayments = async (req, res) => {
  try {
    const invoice = await getInvoice(req.params.id);

    const [payments, totals] = await Promise.all([
      Payment.find({ invoice: invoice._id })
        .populate("recordedBy", "name email")
        .populate("approvedBy", "name email")
        .populate("originalPayment", "amountPaise method paidAt")
        .sort({ createdAt: -1 })
        .lean(),

      getTotals(invoice._id),
    ]);

    const payable = Math.max(
      0,
      invoice.totalAmountPaise - totals.returned
    );

    const outstanding = payable - totals.netCollected;

    return res.json({
      success: true,
      data: payments,
      summary: {
        invoiceAmountPaise: invoice.totalAmountPaise,
        totalReturnedPaise: totals.returned,
        payablePaise: payable,
        totalPaidPaise: totals.paid,
        totalRefundedPaise: totals.approvedRefunds,
        pendingRefundPaise: totals.pendingRefunds,
        netCollectedPaise: totals.netCollected,
        outstandingPaise: outstanding,
        outstandingAmount: outstanding / 100,
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// POST /:id/returns
const addReturn = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const key = requireIdempotencyKey(req);
    const amountPaise = toPaise(req.body.amount);
    const reason = String(req.body.reason || "").trim();

    if (!amountPaise) {
      fail("Enter a valid return amount greater than zero.");
    }

    if (!reason) {
      fail("Return reason is required.");
    }

    const returnedAt = validateDate(req.body.returnedAt, "return");

    let record;
    let remaining;

    await session.withTransaction(async () => {
      const invoice = await getInvoice(req.params.id, session);

      if (invoice.status !== "posted") {
        fail("Returns can only be recorded for posted invoices.", 409);
      }

      const existing = await InvoiceReturn.findOne({
        invoice: invoice._id,
        idempotencyKey: key,
      }).session(session);

      if (existing) {
        record = existing;
        remaining = null;
        return;
      }

      const totals = await getTotals(invoice._id, session);

      const returnable =
        invoice.totalAmountPaise - totals.returned;

      if (amountPaise > returnable) {
        fail("Return amount cannot exceed the remaining invoice value.");
      }

      [record] = await InvoiceReturn.create(
        [
          {
            invoice: invoice._id,
            customer: invoice.customer,
            amountPaise,
            reason,
            notes: String(req.body.notes || "").trim(),
            returnedAt,
            idempotencyKey: key,
            recordedBy: actorId(req.user),
          },
        ],
        { session }
      );

      const newTotal = totals.returned + amountPaise;

      if (newTotal >= invoice.totalAmountPaise) {
        invoice.status = "returned";
      }

      remaining = invoice.totalAmountPaise - newTotal;

      await touchInvoice(invoice, req.user, session);
    });

    return res.status(201).json({
      success: true,
      message: "Return recorded successfully.",
      data: {
        return: record,
        remainingReturnablePaise: remaining,
        remainingReturnableAmount:
          remaining == null ? null : remaining / 100,
      },
    });
  } catch (error) {
    return sendError(res, error);
  } finally {
    await session.endSession();
  }
};

// GET /:id/returns
const getReturns = async (req, res) => {
  try {
    const invoice = await getInvoice(req.params.id);

    const returns = await InvoiceReturn.find({
      invoice: invoice._id,
    })
      .populate("recordedBy", "name email")
      .sort({ returnedAt: -1, createdAt: -1 })
      .lean();

    const total = returns.reduce(
      (sum, item) => sum + item.amountPaise,
      0
    );

    return res.json({
      success: true,
      data: returns,
      summary: {
        totalReturnedPaise: total,
        remainingReturnablePaise:
          invoice.totalAmountPaise - total,
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// POST /:id/refunds
// Merchandise-return refunds do not require admin approval.
// Billing-correction and goodwill refunds require admin approval.
const addRefund = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const key = requireIdempotencyKey(req);
    const amountPaise = toPaise(req.body.amount);
    const originalPaymentId = String(
      req.body.originalPaymentId || ""
    ).trim();

    const method = String(req.body.method || "").toLowerCase();
    const category = String(
      req.body.refundCategory || ""
    ).toLowerCase();

    const reason = String(req.body.reason || "").trim();

    if (!amountPaise || !validId(originalPaymentId)) {
      fail("Valid refund amount and originalPaymentId are required.");
    }

    if (!METHODS.includes(method)) {
      fail("Invalid refund method.");
    }

    if (
      !["merchandise_return", "billing_correction", "goodwill"].includes(
        category
      )
    ) {
      fail("Select a valid refund category.");
    }

    if (!reason) {
      fail("Refund reason is required.");
    }

    const refundedAt = validateDate(req.body.refundedAt, "refund");

    let refund;
    let remaining;

    await session.withTransaction(async () => {
      const invoice = await getInvoice(req.params.id, session);

      if (!["posted", "returned"].includes(invoice.status)) {
        fail(
          "Refunds can only be requested for posted or returned invoices.",
          409
        );
      }

      const existing = await Payment.findOne({
        invoice: invoice._id,
        idempotencyKey: key,
      }).session(session);

      if (existing) {
        refund = existing;
        remaining = null;
        return;
      }

      const original = await Payment.findOne({
        _id: originalPaymentId,
        invoice: invoice._id,
        type: "payment",
      }).session(session);

      if (!original) {
        fail("Original payment was not found for this invoice.", 404);
      }

      const totals = await getTotals(invoice._id, session);

      // Pending and completed refunds reserve the original payment amount.
      // Rejected requests do not reserve any amount.
      const refundsForPayment = await Payment.aggregate([
        {
          $match: {
            invoice: invoice._id,
            originalPayment: original._id,
            type: "refund",
            $or: [
              {
                approvalStatus: {
                  $in: ["pending", "approved", "not_required"],
                },
              },
              {
                approvalStatus: { $exists: false },
              },
            ],
          },
        },
        {
          $group: {
            _id: null,
            amount: { $sum: "$amountPaise" },
          },
        },
      ]).session(session);

      const alreadyReserved = refundsForPayment[0]?.amount || 0;

      const remainingFromPayment =
        original.amountPaise - alreadyReserved;

      if (amountPaise > remainingFromPayment) {
        fail(
          "Refund cannot exceed the unrefunded amount of the original payment."
        );
      }

      let approvalStatus = "pending";

      if (category === "merchandise_return") {
        const totalReturnRefunds = await Payment.aggregate([
          {
            $match: {
              invoice: invoice._id,
              type: "refund",
              refundCategory: "merchandise_return",
              $or: [
                {
                  approvalStatus: {
                    $in: ["pending", "approved", "not_required"],
                  },
                },
                {
                  approvalStatus: { $exists: false },
                },
              ],
            },
          },
          {
            $group: {
              _id: null,
              amount: { $sum: "$amountPaise" },
            },
          },
        ]).session(session);

        const alreadyAllocated =
          totalReturnRefunds[0]?.amount || 0;

        if (alreadyAllocated + amountPaise > totals.returned) {
          fail(
            "A merchandise-return refund cannot exceed the recorded returned value."
          );
        }

        approvalStatus = "not_required";
      }

      [refund] = await Payment.create(
        [
          {
            invoice: invoice._id,
            customer: invoice.customer,
            type: "refund",
            amountPaise,
            method,
            originalPayment: original._id,
            refundCategory: category,
            approvalStatus,
            paidAt: refundedAt,
            idempotencyKey: key,
            reason,
            transactionReference: String(
              req.body.transactionReference || ""
            ).trim(),
            notes: String(req.body.notes || "").trim(),
            recordedBy: actorId(req.user),
          },
        ],
        { session }
      );

      remaining = remainingFromPayment - amountPaise;

      await touchInvoice(invoice, req.user, session);
    });

    const statusMessage =
      refund.approvalStatus === "pending"
        ? "Refund request submitted. Admin approval is required."
        : "Return refund recorded successfully.";

    return res.status(201).json({
      success: true,
      message: statusMessage,
      data: {
        refund,
        remainingRefundablePaise: remaining,
        remainingRefundableAmount:
          remaining == null ? null : remaining / 100,
      },
    });
  } catch (error) {
    return sendError(res, error);
  } finally {
    await session.endSession();
  }
};

// POST /:id/refunds/:refundId/approve
// Admin only.
const approveRefund = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    if (!isAdmin(req)) {
      fail("Only an admin can approve this refund.", 403);
    }

    if (!validId(req.params.refundId)) {
      fail("Invalid refund ID.");
    }

    let updated;

    await session.withTransaction(async () => {
      const invoice = await getInvoice(req.params.id, session);

      const refund = await Payment.findOne({
        _id: req.params.refundId,
        invoice: invoice._id,
        type: "refund",
      }).session(session);

      if (!refund) {
        fail("Refund request not found.", 404);
      }

      if (refund.approvalStatus !== "pending") {
        fail(
          "Only pending refund requests can be approved.",
          409
        );
      }

      const totals = await getTotals(invoice._id, session);

      const original = await Payment.findById(
        refund.originalPayment
      ).session(session);

      if (!original) {
        fail("Original payment not found.", 404);
      }

      // Include other pending reservations and completed refunds.
      // Exclude the refund currently being approved.
      const otherReservedRefunds = await Payment.aggregate([
        {
          $match: {
            invoice: invoice._id,
            type: "refund",
            originalPayment: original._id,
            _id: { $ne: refund._id },
            $or: [
              {
                approvalStatus: {
                  $in: ["pending", "approved", "not_required"],
                },
              },
              {
                approvalStatus: { $exists: false },
              },
            ],
          },
        },
        {
          $group: {
            _id: null,
            amount: { $sum: "$amountPaise" },
          },
        },
      ]).session(session);

      const otherReserved =
        otherReservedRefunds[0]?.amount || 0;

      if (otherReserved + refund.amountPaise > original.amountPaise) {
        fail(
          "Approval would exceed the remaining original payment amount.",
          409
        );
      }

      if (refund.refundCategory === "merchandise_return") {
        const approvedReturnRefunds = await Payment.aggregate([
          {
            $match: {
              invoice: invoice._id,
              type: "refund",
              refundCategory: "merchandise_return",
              approvalStatus: {
                $in: ["approved", "not_required"],
              },
              _id: { $ne: refund._id },
            },
          },
          {
            $group: {
              _id: null,
              amount: { $sum: "$amountPaise" },
            },
          },
        ]).session(session);

        if (
          (approvedReturnRefunds[0]?.amount || 0) +
            refund.amountPaise >
          totals.returned
        ) {
          fail(
            "Approved merchandise refunds cannot exceed recorded returns.",
            409
          );
        }
      }

      refund.approvalStatus = "approved";
      refund.approvedBy = actorId(req.user);
      refund.approvedAt = new Date();

      await refund.save({ session });

      await touchInvoice(invoice, req.user, session);

      updated = refund;
    });

    return res.json({
      success: true,
      message: "Refund approved successfully.",
      data: updated,
    });
  } catch (error) {
    return sendError(res, error);
  } finally {
    await session.endSession();
  }
};

// POST /:id/refunds/:refundId/reject
// Admin only.
const rejectRefund = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    if (!isAdmin(req)) {
      fail("Only an admin can reject this refund.", 403);
    }

    if (!validId(req.params.refundId)) {
      fail("Invalid refund ID.");
    }

    const rejectionReason = String(
      req.body.reason || ""
    ).trim();

    if (!rejectionReason) {
      fail("A rejection reason is required.");
    }

    let updated;

    await session.withTransaction(async () => {
      const invoice = await getInvoice(req.params.id, session);

      const refund = await Payment.findOne({
        _id: req.params.refundId,
        invoice: invoice._id,
        type: "refund",
      }).session(session);

      if (!refund) {
        fail("Refund request not found.", 404);
      }

      if (refund.approvalStatus !== "pending") {
        fail(
          "Only pending refund requests can be rejected.",
          409
        );
      }

      refund.approvalStatus = "rejected";
      refund.rejectionReason = rejectionReason;
      refund.approvedBy = actorId(req.user);
      refund.approvedAt = new Date();

      await refund.save({ session });

      await touchInvoice(invoice, req.user, session);

      updated = refund;
    });

    return res.json({
      success: true,
      message: "Refund request rejected.",
      data: updated,
    });
  } catch (error) {
    return sendError(res, error);
  } finally {
    await session.endSession();
  }
};

// POST /:id/cancel
const cancelInvoice = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const reason = String(req.body.reason || "").trim();

    if (!reason) {
      fail("Cancellation reason is required.");
    }

    let cancelled;

    await session.withTransaction(async () => {
      const invoice = await getInvoice(req.params.id, session);

      if (!["pending", "posted"].includes(invoice.status)) {
        fail(
          "This invoice cannot be cancelled in its current status.",
          409
        );
      }

      const totals = await getTotals(invoice._id, session);

      if (
        totals.paid ||
        totals.approvedRefunds ||
        totals.pendingRefunds ||
        totals.returned
      ) {
        fail(
          "This invoice has payment, refund request, or return history. Complete the financial workflow before cancellation.",
          409
        );
      }

      invoice.status = "cancelled";
      invoice.cancellationReason = reason;
      invoice.updatedBy = actorId(req.user);

      await invoice.save({ session });

      cancelled = invoice;
    });

    return res.json({
      success: true,
      message: "Invoice cancelled successfully.",
      data: cancelled,
    });
  } catch (error) {
    return sendError(res, error);
  } finally {
    await session.endSession();
  }
};

module.exports = {
  postInvoice,
  addPayment,
  getPayments,
  addReturn,
  getReturns,
  addRefund,
  approveRefund,
  rejectRefund,
  cancelInvoice,
};
