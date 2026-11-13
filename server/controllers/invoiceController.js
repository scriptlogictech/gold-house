
const mongoose = require("mongoose");
const Invoice = require("../models/Invoice");
const ImportJob = require("../models/ImportJob");
const Customer = require("../models/Customer");

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const actorId = (user) => user?._id || user?.id || null;

const toPaise = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return null;

  const paise = Math.round(amount * 100);
  return Math.abs(paise / 100 - amount) < 0.000001 ? paise : null;
};

const populateInvoice = (query) =>
  query
    .populate("customer", "name phone email")
    .populate("family", "name code")
    .populate("importJob", "source fileName status");

const getInvoices = async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
    );
    const filter = {};

    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "").toLowerCase();
    const source = String(req.query.source || "").trim();

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      const customers = await Customer.find({
        $or: [
          { name: regex },
          { phone: regex },
          { email: regex },
        ],
      }).distinct("_id");

      filter.$or = [
        { invoiceNumber: regex },
        { sourceInvoiceId: regex },
        { source: regex },
        { customer: { $in: customers } },
      ];
    }

    if (["pending", "posted", "returned", "cancelled"].includes(status)) {
      filter.status = status;
    }

    if (source) filter.source = source;

    const from = req.query.from ? new Date(req.query.from) : null;
    const to = req.query.to ? new Date(req.query.to) : null;

    if (from || to) {
      filter.invoiceDate = {};

      if (from && !Number.isNaN(from.getTime())) {
        from.setHours(0, 0, 0, 0);
        filter.invoiceDate.$gte = from;
      }

      if (to && !Number.isNaN(to.getTime())) {
        to.setHours(23, 59, 59, 999);
        filter.invoiceDate.$lte = to;
      }

      if (!Object.keys(filter.invoiceDate).length) {
        delete filter.invoiceDate;
      }
    }

    const [invoices, total] = await Promise.all([
      populateInvoice(
        Invoice.find(filter)
          .sort({ invoiceDate: -1, createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
      ).lean(),
      Invoice.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getInvoiceById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice ID.",
      });
    }

    const invoice = await populateInvoice(
      Invoice.findById(req.params.id)
    ).lean();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found.",
      });
    }

    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/invoices/import/preview
const previewInvoiceImport = async (req, res, next) => {
  try {
    const source = String(req.body.source || "").trim();
    const fileName = String(req.body.fileName || "").trim();
    const inputRows = req.body.invoices;

    if (!source) {
      return res.status(400).json({
        success: false,
        message: "Billing source is required.",
      });
    }

    if (!Array.isArray(inputRows) || inputRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide a non-empty invoices array.",
      });
    }

    if (inputRows.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "A single import is limited to 5,000 rows.",
      });
    }

    const seenInvoiceNumbers = new Set();
    const rows = [];
    const errors = [];
    let duplicateRows = 0;

    for (let i = 0; i < inputRows.length; i += 1) {
      const input = inputRows[i] || {};
      const rowNumber = i + 1;
      const invoiceNumber = String(input.invoiceNumber || "").trim();
      const sourceInvoiceId = String(input.sourceInvoiceId || "").trim();
      const issues = [];

      if (!invoiceNumber) issues.push("Invoice number is required.");

      const date = input.invoiceDate ? new Date(input.invoiceDate) : null;
      if (!date || Number.isNaN(date.getTime())) {
        issues.push("A valid invoice date is required.");
      } else if (date.getTime() > Date.now()) {
        issues.push("Invoice date cannot be in the future.");
      }

      const totalAmountPaise = toPaise(input.totalAmount);
      if (totalAmountPaise === null) {
        issues.push("Total amount must be a valid non-negative rupee amount.");
      }

      const eligibleAmountPaise =
        input.eligibleAmount === undefined || input.eligibleAmount === null
          ? totalAmountPaise
          : toPaise(input.eligibleAmount);

      if (eligibleAmountPaise === null) {
        issues.push("Eligible amount must be a valid non-negative rupee amount.");
      } else if (
        totalAmountPaise !== null &&
        eligibleAmountPaise > totalAmountPaise
      ) {
        issues.push("Eligible amount cannot exceed invoice total.");
      }

      if (
        input.status !== undefined &&
        input.status !== "pending"
      ) {
        issues.push(
          "New imports must use pending status; posting and reversals require a separate workflow."
        );
      }

      let customer = null;
      const customerId = String(input.customerId || "").trim();
      const customerPhone = String(input.customerPhone || "").trim();

      if (customerId) {
        if (!mongoose.isValidObjectId(customerId)) {
          issues.push("Customer ID is invalid.");
        } else {
          customer = await Customer.findById(customerId)
            .select("_id name phone status")
            .lean();

          if (!customer) issues.push("Customer ID was not found.");
        }
      } else if (customerPhone) {
        const matches = await Customer.find({ phone: customerPhone })
          .select("_id name phone status")
          .limit(2)
          .lean();

        if (matches.length === 0) {
          issues.push("No customer matches this phone number.");
        } else if (matches.length > 1) {
          issues.push(
            "This phone number matches multiple customers; provide customerId instead."
          );
        } else {
          customer = matches[0];
        }
      } else {
        issues.push("Provide customerId or customerPhone.");
      }

      if (customer && customer.status !== "active") {
        issues.push("The selected customer is inactive.");
      }

      const duplicateKey = `${source.toLowerCase()}::${invoiceNumber.toLowerCase()}`;

      if (invoiceNumber && seenInvoiceNumbers.has(duplicateKey)) {
        issues.push("Duplicate invoice number in this import.");
        duplicateRows += 1;
      } else if (invoiceNumber) {
        seenInvoiceNumbers.add(duplicateKey);

        const existing = await Invoice.exists({
          source,
          invoiceNumber,
        });

        if (existing) {
          issues.push("This invoice already exists in the database.");
          duplicateRows += 1;
        }
      }

      if (issues.length) {
        errors.push({
          row: rowNumber,
          invoiceNumber,
          message: issues.join(" "),
        });
        continue;
      }

      const rawLineItems = Array.isArray(input.lineItems) ? input.lineItems : [];
      const lineItems = [];
      let lineItemError = "";

      for (const item of rawLineItems) {
        const quantity = item.quantity === undefined || item.quantity === null || item.quantity === ""
          ? 1
          : Number(item.quantity);
        const unitPricePaise = item.unitPrice === undefined || item.unitPrice === null || item.unitPrice === ""
          ? 0
          : toPaise(item.unitPrice);
        const amountPaise = item.amount === undefined || item.amount === null || item.amount === ""
          ? 0
          : toPaise(item.amount);

        if (!Number.isFinite(quantity) || quantity <= 0) {
          lineItemError = "Line item quantity must be a positive number.";
          break;
        }
        if (unitPricePaise === null || amountPaise === null) {
          lineItemError = "Line item prices must be valid rupee amounts with no more than two decimal places.";
          break;
        }

        lineItems.push({
          description: String(item.description || "").trim(),
          sku: String(item.sku || "").trim(),
          category: String(item.category || "").trim(),
          quantity,
          unitPricePaise,
          amountPaise,
        });
      }

      if (lineItemError) {
        errors.push({ row: rowNumber, invoiceNumber, message: lineItemError });
        continue;
      }

      rows.push({
        invoiceNumber,
        source,
        sourceInvoiceId: sourceInvoiceId || null,
        customer: customer._id,
        invoiceDate: date,
        currency: "INR",
        totalAmountPaise,
        eligibleAmountPaise,
        lineItems,
        status: "pending",
      });
    }

    const job = await ImportJob.create({
      source,
      fileName,
      status: "previewed",
      totalRows: inputRows.length,
      validRows: rows.length,
      duplicateRows,
      rejectedRows: errors.length,
      rows,
      errors,
      startedBy: actorId(req.user),
    });

    res.status(201).json({
      success: true,
      message: "Import preview created. Review the results before confirming.",
      data: {
        jobId: job._id,
        source: job.source,
        status: job.status,
        totalRows: job.totalRows,
        validRows: job.validRows,
        duplicateRows: job.duplicateRows,
        rejectedRows: job.rejectedRows,
        errors: job.errors,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/invoices/import/:jobId/confirm
// Confirmation is atomic: either every valid row is imported and the job
// is completed, or the transaction rolls back and the preview remains intact.
const confirmInvoiceImport = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { jobId } = req.params;

    if (!mongoose.isValidObjectId(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid import job ID.",
      });
    }

    let responseData;

    await session.withTransaction(async () => {
      const job = await ImportJob.findById(jobId).session(session);

      if (!job) {
        const error = new Error("Import job not found.");
        error.status = 404;
        throw error;
      }

      if (String(job.startedBy || "") !== String(actorId(req.user) || "")) {
        const error = new Error(
          "Only the staff member who created this preview can confirm it."
        );
        error.status = 403;
        throw error;
      }

      if (job.status !== "previewed") {
        const error = new Error("This import job has already been processed.");
        error.status = 409;
        throw error;
      }

      const documents = job.rows.map((row) => ({
        ...row.toObject?.() || row,
        importJob: job._id,
        createdBy: actorId(req.user),
        updatedBy: actorId(req.user),
      }));

      if (documents.length > 0) {
        await Invoice.insertMany(documents, {
          session,
          ordered: true,
        });
      }

      job.status = "completed";
      job.importedRows = documents.length;
      job.completedAt = new Date();
      await job.save({ session });

      responseData = {
        jobId: job._id,
        status: job.status,
        totalRows: job.totalRows,
        importedRows: job.importedRows,
        duplicateRows: job.duplicateRows,
        rejectedRows: job.rejectedRows,
        errors: job.errors,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Invoice import completed successfully.",
      data: responseData,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "At least one invoice became a duplicate after preview. No invoices from this confirmation were imported. Create a new preview after resolving the duplicates.",
      });
    }

    next(error);
  } finally {
    await session.endSession();
  }
};

// GET /api/v1/invoices/imports/:jobId
// Staff can view only their own import jobs; admins can view all jobs.
const getImportJob = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid import job ID.",
      });
    }

    const job = await ImportJob.findById(req.params.jobId).lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Import job not found.",
      });
    }

    const isAdmin = req.user?.role === "admin";
    const isOwner = String(job.startedBy || "") === String(actorId(req.user) || "");

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this import job.",
      });
    }

    return res.status(200).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  previewInvoiceImport,
  confirmInvoiceImport,
  getImportJob,
};
