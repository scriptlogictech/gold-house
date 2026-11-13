
const Customer = require("../models/Customer");

// Valid customer categories from the Customer model
const VALID_CATEGORIES = [
  "Gold Buyer",
  "Diamond Buyer",
  "Silver Buyer",
  "Wedding Customer",
  "VIP",
];

const VALID_STATUSES = ["active", "inactive"];

const VALID_GENDERS = ["male", "female", "other"];

// Helper: send a consistent error response
const handleControllerError = (res, error, message = "Something went wrong") => {
  console.error(message, error);

  if (error.code === 11000) {
    const duplicateField = Object.keys(error.keyPattern || {})[0];

    return res.status(409).json({
      success: false,
      message:
        duplicateField === "externalCustomerId"
          ? "A customer with this external customer ID already exists."
          : "A customer with these details already exists.",
    });
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message,
  });
};

// Helper: safely parse a positive integer
const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

/**
 * GET /api/v1/customers
 *
 * Supported query parameters:
 * page, limit, search, status, category, sort
 */
const getCustomers = async (req, res) => {
  try {
    const page = parsePositiveInteger(req.query.page, 1);
    const limit = Math.min(parsePositiveInteger(req.query.limit, 10), 100);
    const skip = (page - 1) * limit;

    const { search, status, category, sort } = req.query;

    const filter = {};

    // Filter by customer status
    if (status && status !== "all") {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status. Use active, inactive, or all.",
        });
      }

      filter.status = status;
    }

    // Filter by customer category
    if (category && category !== "all") {
      if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid customer category.",
        });
      }

      filter.category = category;
    }

    // Search by name, phone, email, external ID, city, or category
    if (typeof search === "string" && search.trim()) {
      const searchTerm = search.trim();

      // Escape special regular-expression characters supplied by users
      const escapedSearch = searchTerm.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const searchRegex = new RegExp(escapedSearch, "i");

      filter.$or = [
        { name: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
        { externalCustomerId: searchRegex },
        { city: searchRegex },
        { category: searchRegex },
      ];
    }

    // Default: newest customers first
    const sortOrder = sort === "oldest" ? 1 : -1;
    const sortOptions = {
      createdAt: sortOrder,
      _id: sortOrder,
    };

    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),

      Customer.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: customers,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Failed to fetch customers."
    );
  }
};

/**
 * POST /api/v1/customers
 *
 * Creates a customer.
 */
const createCustomer = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      externalCustomerId,
      dateOfBirth,
      gender,
      category,
      city,
      status,
      notes,
    } = req.body;

    // Basic required-field validation
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required.",
      });
    }

    if (typeof phone !== "string" || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer phone number is required.",
      });
    }

    // Validate optional fields when supplied
    if (gender && !VALID_GENDERS.includes(gender)) {
      return res.status(400).json({
        success: false,
        message: "Invalid gender.",
      });
    }

    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer category.",
      });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Use active or inactive.",
      });
    }

    const customerData = {
      name: name.trim(),
      phone: phone.trim(),
    };

    if (typeof email === "string" && email.trim()) {
      customerData.email = email.trim();
    }

    if (
      typeof externalCustomerId === "string" &&
      externalCustomerId.trim()
    ) {
      customerData.externalCustomerId = externalCustomerId.trim();
    }

    if (dateOfBirth) {
      customerData.dateOfBirth = dateOfBirth;
    }

    if (gender) {
      customerData.gender = gender;
    }

    if (category) {
      customerData.category = category;
    }

    if (typeof city === "string") {
      customerData.city = city.trim();
    }

    if (status) {
      customerData.status = status;
    }

    if (typeof notes === "string") {
      customerData.notes = notes.trim();
    }

    // Record the logged-in user if the schema supports this field
    if (req.user?._id) {
      customerData.createdBy = req.user._id;
      customerData.updatedBy = req.user._id;
    }

    const customer = await Customer.create(customerData);

    return res.status(201).json({
      success: true,
      message: "Customer created successfully.",
      data: customer,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Failed to create customer."
    );
  }
};

/**
 * GET /api/v1/customers/:id
 *
 * Returns one customer by MongoDB ID.
 */
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Failed to fetch customer."
    );
  }
};

/**
 * PATCH /api/v1/customers/:id
 *
 * Updates customer details.
 * Status is updated through the separate status endpoint.
 */
const updateCustomer = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "phone",
      "email",
      "externalCustomerId",
      "dateOfBirth",
      "gender",
      "category",
      "city",
      "notes",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    // Do not accept status changes through this endpoint
    if (Object.prototype.hasOwnProperty.call(req.body, "status")) {
      return res.status(400).json({
        success: false,
        message: "Update status using the customer status endpoint.",
      });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid customer fields were provided for update.",
      });
    }

    // Normalize text fields
    if (typeof updates.name === "string") {
      updates.name = updates.name.trim();

      if (!updates.name) {
        return res.status(400).json({
          success: false,
          message: "Customer name cannot be empty.",
        });
      }
    }

    if (typeof updates.phone === "string") {
      updates.phone = updates.phone.trim();

      if (!updates.phone) {
        return res.status(400).json({
          success: false,
          message: "Customer phone number cannot be empty.",
        });
      }
    }

    if (typeof updates.email === "string") {
      updates.email = updates.email.trim();

      if (!updates.email) {
        updates.email = undefined;
      }
    }

    if (typeof updates.externalCustomerId === "string") {
      updates.externalCustomerId = updates.externalCustomerId.trim();

      if (!updates.externalCustomerId) {
        updates.externalCustomerId = undefined;
      }
    }

    if (typeof updates.city === "string") {
      updates.city = updates.city.trim();
    }

    if (typeof updates.notes === "string") {
      updates.notes = updates.notes.trim();
    }

    if (updates.gender && !VALID_GENDERS.includes(updates.gender)) {
      return res.status(400).json({
        success: false,
        message: "Invalid gender.",
      });
    }

    if (
      updates.category &&
      !VALID_CATEGORIES.includes(updates.category)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer category.",
      });
    }

    if (req.user?._id) {
      updates.updatedBy = req.user._id;
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully.",
      data: customer,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Failed to update customer."
    );
  }
};

/**
 * PATCH /api/v1/customers/:id/status
 *
 * Updates a customer's status to active or inactive.
 */
const updateCustomerStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Use active or inactive.",
      });
    }

    const updates = { status };

    if (req.user?._id) {
      updates.updatedBy = req.user._id;
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Customer ${status === "active" ? "activated" : "deactivated"} successfully.`,
      data: customer,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Failed to update customer status."
    );
  }
};

module.exports = {
  getCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  updateCustomerStatus,
};
