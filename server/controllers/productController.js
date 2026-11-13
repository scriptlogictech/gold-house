
const mongoose = require("mongoose");
const Product = require("../models/Product");
const { PRODUCT_CATEGORIES } = require("../models/Product");
const configureCloudinary = require("../config/cloudinary");

const isValidId = (id) => mongoose.isValidObjectId(id);

const ALLOWED_FIELDS = [
  "name",
  "sku",
  "category",
  "description",
  "images",
  "metal",
  "purity",
  "grossWeight",
  "netWeight",
  "featured",
  "showOnWebsite",
];

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const makeSlug = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);

const publicProductFields =
  "name slug category description images metal purity grossWeight netWeight featured createdAt updatedAt";

// --------------------------------------------------
// NORMALIZE REQUEST BODY
// Supports JSON and multipart/form-data requests.
// --------------------------------------------------

const normalizeProductBody = (body = {}) => {
  const normalized = { ...body };

  // Convert FormData boolean strings into actual booleans.
  for (const field of ["featured", "showOnWebsite"]) {
    if (normalized[field] === "true") {
      normalized[field] = true;
    } else if (normalized[field] === "false") {
      normalized[field] = false;
    }
  }

  // Convert weight strings into numbers.
  for (const field of ["grossWeight", "netWeight"]) {
    if (
      normalized[field] !== undefined &&
      normalized[field] !== ""
    ) {
      normalized[field] = Number(normalized[field]);
    }
  }

  // Support images sent as a JSON string.
  if (typeof normalized.images === "string") {
    try {
      normalized.images = JSON.parse(normalized.images);
    } catch {
      normalized.images = [normalized.images];
    }
  }

  return normalized;
};

// --------------------------------------------------
// CLOUDINARY IMAGE UPLOAD
// --------------------------------------------------

const uploadFilesToCloudinary = async (files = []) => {
  if (!files.length) return [];

  const cloudinary = configureCloudinary();

  const uploadedImages = await Promise.all(
    files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "gold-house/products",
              resource_type: "image",
            },
            (error, result) => {
              if (error) {
                return reject(error);
              }

              resolve(result.secure_url);
            }
          );

          stream.end(file.buffer);
        })
    )
  );

  return uploadedImages;
};

// --------------------------------------------------
// VALIDATE PRODUCT INPUT
// --------------------------------------------------

const validateProductInput = (body, isUpdate = false) => {
  const errors = [];

  if (
    !isUpdate ||
    Object.prototype.hasOwnProperty.call(body, "name")
  ) {
    if (
      typeof body.name !== "string" ||
      !body.name.trim()
    ) {
      errors.push("Product name is required.");
    }
  }

  if (
    !isUpdate ||
    Object.prototype.hasOwnProperty.call(body, "category")
  ) {
    if (!PRODUCT_CATEGORIES.includes(body.category)) {
      errors.push(
        `Category must be one of: ${PRODUCT_CATEGORIES.join(", ")}.`
      );
    }
  }

  if (body.images !== undefined) {
    if (
      !Array.isArray(body.images) ||
      body.images.length > 12 ||
      body.images.some(
        (url) =>
          typeof url !== "string" ||
          !url.trim() ||
          !/^https?:\/\//i.test(url.trim())
      )
    ) {
      errors.push(
        "Images must be an array of up to 12 HTTP/HTTPS image URLs."
      );
    }
  }

  for (const field of ["featured", "showOnWebsite"]) {
    if (
      body[field] !== undefined &&
      typeof body[field] !== "boolean"
    ) {
      errors.push(`${field} must be true or false.`);
    }
  }

  for (const field of ["grossWeight", "netWeight"]) {
    if (
      body[field] !== undefined &&
      body[field] !== null &&
      body[field] !== ""
    ) {
      const value = Number(body[field]);

      if (!Number.isFinite(value) || value < 0) {
        errors.push(
          `${field} must be a non-negative number.`
        );
      }
    }
  }

  return errors;
};

// --------------------------------------------------
// GENERATE UNIQUE PRODUCT SLUG
// --------------------------------------------------

const getUniqueSlug = async (name, excludeId = null) => {
  const base = makeSlug(name);

  if (!base) {
    const error = new Error(
      "Product name must contain letters or numbers."
    );
    error.status = 400;
    throw error;
  }

  let slug = base;
  let counter = 2;

  while (true) {
    const filter = { slug };

    if (excludeId) {
      filter._id = { $ne: excludeId };
    }

    const exists = await Product.exists(filter);

    if (!exists) return slug;

    slug = `${base}-${counter++}`;
  }
};

// --------------------------------------------------
// GET PUBLIC PRODUCTS
// GET /api/v1/products
// --------------------------------------------------

const getPublicProducts = async (req, res, next) => {
  try {
    const page = Math.max(
      1,
      parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      48,
      Math.max(1, parseInt(req.query.limit, 10) || 12)
    );

    const filter = {
      isActive: true,
      showOnWebsite: true,
      isDeleted: false,
    };

    const category = String(
      req.query.category || ""
    ).trim();

    if (
      category &&
      category !== "All Jewellery" &&
      category !== "all"
    ) {
      if (!PRODUCT_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product category.",
        });
      }

      filter.category = category;
    }

    const search = String(
      req.query.search || ""
    ).trim();

    if (search) {
      const regex = new RegExp(
        escapeRegex(search),
        "i"
      );

      filter.$or = [
        { name: regex },
        { description: regex },
        { sku: regex },
        { category: regex },
      ];
    }

    if (
      String(req.query.featured || "").toLowerCase() ===
      "true"
    ) {
      filter.featured = true;
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .select(publicProductFields)
        .sort({
          featured: -1,
          createdAt: -1,
          _id: -1,
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// GET PUBLIC PRODUCT BY SLUG
// GET /api/v1/products/:slug
// --------------------------------------------------

const getPublicProductBySlug = async (
  req,
  res,
  next
) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      isActive: true,
      showOnWebsite: true,
      isDeleted: false,
    })
      .select(publicProductFields)
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// GET ADMIN PRODUCTS
// GET /api/v1/products/admin/all
// --------------------------------------------------

const getAdminProducts = async (req, res, next) => {
  try {
    const page = Math.max(
      1,
      parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 20)
    );

    const filter = {
      isDeleted:
        String(req.query.includeDeleted || "") ===
        "true",
    };

    const status = String(
      req.query.status || "all"
    ).toLowerCase();

    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "inactive") {
      filter.isActive = false;
    }

    const category = String(
      req.query.category || ""
    ).trim();

    if (category && category !== "all") {
      if (!PRODUCT_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product category.",
        });
      }

      filter.category = category;
    }

    const search = String(
      req.query.search || ""
    ).trim();

    if (search) {
      const regex = new RegExp(
        escapeRegex(search),
        "i"
      );

      filter.$or = [
        { name: regex },
        { sku: regex },
        { description: regex },
        { slug: regex },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("createdBy", "name email")
        .populate("updatedBy", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// CREATE PRODUCT
// POST /api/v1/products
// --------------------------------------------------

const createProduct = async (req, res, next) => {
  try {
    const data = normalizeProductBody(req.body || {});

    // Validate ordinary fields before uploading images.
    const initialErrors = validateProductInput(data);

    if (initialErrors.length) {
      return res.status(400).json({
        success: false,
        message: initialErrors[0],
        errors: initialErrors,
      });
    }

    const uploadedImages = await uploadFilesToCloudinary(
      req.files || []
    );

    const existingImages = Array.isArray(data.images)
      ? data.images.map((url) => url.trim())
      : [];

    data.images = [
      ...existingImages,
      ...uploadedImages,
    ];

    // Validate the final image array.
    const imageErrors = validateProductInput({
      images: data.images,
    }, true);

    if (imageErrors.length) {
      return res.status(400).json({
        success: false,
        message: imageErrors[0],
        errors: imageErrors,
      });
    }

    const productData = {};

    for (const field of ALLOWED_FIELDS) {
      if (data[field] !== undefined) {
        productData[field] = data[field];
      }
    }

    productData.name = productData.name.trim();

    productData.slug = await getUniqueSlug(
      productData.name
    );

    if (productData.sku) {
      productData.sku = String(
        productData.sku
      ).trim().toUpperCase();
    }

    productData.createdBy = req.user?._id || null;
    productData.updatedBy = req.user?._id || null;

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: product,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A product with this identifier already exists.",
      });
    }

    next(error);
  }
};

// --------------------------------------------------
// UPDATE PRODUCT
// PATCH /api/v1/products/:id
// --------------------------------------------------

const updateProduct = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const data = normalizeProductBody(req.body || {});

    const product = await Product.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const errors = validateProductInput(data, true);

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors,
      });
    }

    const updates = {};

    for (const field of ALLOWED_FIELDS) {
      if (
        Object.prototype.hasOwnProperty.call(
          data,
          field
        )
      ) {
        updates[field] = data[field];
      }
    }

    if (
      Object.prototype.hasOwnProperty.call(
        updates,
        "name"
      )
    ) {
      updates.name = String(
        updates.name
      ).trim();

      if (!updates.name) {
        return res.status(400).json({
          success: false,
          message: "Product name cannot be empty.",
        });
      }

      updates.slug = await getUniqueSlug(
        updates.name,
        product._id
      );
    }

    if (updates.sku !== undefined) {
      updates.sku = String(
        updates.sku || ""
      ).trim().toUpperCase();
    }

    // Upload newly selected images.
    const uploadedImages = await uploadFilesToCloudinary(
      req.files || []
    );

    // If images were supplied, use that list as the retained
    // image list. Otherwise, preserve the current database list.
    if (
      updates.images !== undefined ||
      uploadedImages.length > 0
    ) {
      const retainedImages = Array.isArray(updates.images)
        ? updates.images.map((url) => url.trim())
        : product.images || [];

      updates.images = [
        ...retainedImages,
        ...uploadedImages,
      ];

      const imageErrors = validateProductInput(
        { images: updates.images },
        true
      );

      if (imageErrors.length) {
        return res.status(400).json({
          success: false,
          message: imageErrors[0],
          errors: imageErrors,
        });
      }
    }

    Object.assign(product, updates, {
      updatedBy: req.user?._id || null,
    });

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: product,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Product slug or SKU already exists.",
      });
    }

    next(error);
  }
};

// --------------------------------------------------
// UPDATE PRODUCT STATUS
// PATCH /api/v1/products/:id/status
// --------------------------------------------------

const updateProductStatus = async (
  req,
  res,
  next
) => {
  try {
    const isActive =
      req.body?.isActive === "true"
        ? true
        : req.body?.isActive === "false"
          ? false
          : req.body?.isActive;

    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false.",
      });
    }

    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        isDeleted: false,
      },
      {
        $set: {
          isActive,
          updatedBy: req.user?._id || null,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: `Product ${
        product.isActive ? "activated" : "deactivated"
      } successfully.`,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// SOFT DELETE PRODUCT
// DELETE /api/v1/products/:id
// --------------------------------------------------

const softDeleteProduct = async (
  req,
  res,
  next
) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        isDeleted: false,
      },
      {
        $set: {
          isDeleted: true,
          isActive: false,
          showOnWebsite: false,
          updatedBy: req.user?._id || null,
        },
      },
      {
        new: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product moved to deleted items.",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// EXPORT CONTROLLERS
// --------------------------------------------------

module.exports = {
  getPublicProducts,
  getPublicProductBySlug,
  getAdminProducts,
  createProduct,
  updateProduct,
  updateProductStatus,
  softDeleteProduct,
};
