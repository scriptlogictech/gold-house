
const mongoose = require("mongoose");
const Family = require("../models/Family");
const Customer = require("../models/Customer");

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isValidId = (id) => mongoose.isValidObjectId(id);

const publicFamilyQuery = () => [
  { path: "headId", select: "name phone email status category city" },
  { path: "memberIds", select: "name phone email status category city" },
];

const parseMemberIds = (memberIds, headId) => {
  const ids = Array.isArray(memberIds) ? memberIds : [];

  if (!headId || !isValidId(headId)) {
    const error = new Error("A valid family head is required.");
    error.status = 400;
    throw error;
  }

  if (ids.some((id) => !isValidId(String(id)))) {
    const error = new Error("One or more member IDs are invalid.");
    error.status = 400;
    throw error;
  }

  // A family head must also be included as a member.
  return [...new Set([...ids.map(String), String(headId)])];
};

const validateCustomers = async (headId, memberIds) => {
  const ids = [...new Set([String(headId), ...memberIds.map(String)])];

  const customers = await Customer.find({
    _id: { $in: ids },
  }).select("_id");

  const found = new Set(customers.map((customer) => String(customer._id)));
  const missing = ids.filter((id) => !found.has(id));

  if (missing.length) {
    const error = new Error(
      "One or more selected customers do not exist."
    );
    error.status = 400;
    throw error;
  }
};

const checkDuplicateName = async (name, excludeId = null) => {
  const filter = {
    name: { $regex: `^${escapeRegex(name.trim())}$`, $options: "i" },
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  const duplicate = await Family.findOne(filter).select("_id");

  if (duplicate) {
    const error = new Error("A family with this name already exists.");
    error.status = 409;
    throw error;
  }
};

const checkMemberAssignments = async (memberIds, excludeId = null) => {
  const filter = {
    memberIds: { $in: memberIds },
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  const assignedFamily = await Family.findOne(filter)
    .select("name code");

  if (assignedFamily) {
    const error = new Error(
      `A selected customer already belongs to ${assignedFamily.name} (${assignedFamily.code}).`
    );
    error.status = 409;
    throw error;
  }
};

// GET /api/v1/families
const getFamilies = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );
    const skip = (page - 1) * limit;

    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "").toLowerCase();
    const sort = String(req.query.sort || "newest");

    const filter = {};

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      const matchingCustomers = await Customer.find({
        $or: [{ name: regex }, { phone: regex }, { email: regex }],
      }).distinct("_id");

      filter.$or = [
        { name: regex },
        { code: regex },
        { headId: { $in: matchingCustomers } },
        { memberIds: { $in: matchingCustomers } },
      ];
    }

    if (["active", "inactive"].includes(status)) {
      filter.status = status;
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      name_asc: { name: 1 },
      name_desc: { name: -1 },
    };

    const sortBy = sortOptions[sort] || sortOptions.newest;

    const [families, total] = await Promise.all([
      Family.find(filter)
        .populate(publicFamilyQuery())
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .lean(),
      Family.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: families,
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

// GET /api/v1/families/:id
const getFamilyById = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid family ID.",
      });
    }

    const family = await Family.findById(req.params.id)
      .populate(publicFamilyQuery())
      .lean();

    if (!family) {
      return res.status(404).json({
        success: false,
        message: "Family not found.",
      });
    }

    res.status(200).json({ success: true, data: family });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/families
const createFamily = async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const headId = req.body.headId;
    const memberIds = parseMemberIds(req.body.memberIds, headId);
    const status = String(req.body.status || "active").toLowerCase();
    const notes = String(req.body.notes || "").trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Family name is required.",
      });
    }

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive.",
      });
    }

    await validateCustomers(headId, memberIds);
    await checkDuplicateName(name);
    await checkMemberAssignments(memberIds);

    const family = await Family.create({
      name,
      code: `GH-FAM-${new mongoose.Types.ObjectId().toString().slice(-8).toUpperCase()}`,
      headId,
      memberIds,
      status,
      notes,
      createdBy: req.user?._id || req.user?.id || null,
      updatedBy: req.user?._id || req.user?.id || null,
    });

    const populatedFamily = await Family.findById(family._id)
      .populate(publicFamilyQuery())
      .lean();

    res.status(201).json({
      success: true,
      message: "Family created successfully.",
      data: populatedFamily,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A family with this code already exists.",
      });
    }

    next(error);
  }
};

// PUT /api/v1/families/:id
const updateFamily = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid family ID.",
      });
    }

    const family = await Family.findById(req.params.id);

    if (!family) {
      return res.status(404).json({
        success: false,
        message: "Family not found.",
      });
    }

    const name =
      req.body.name === undefined
        ? family.name
        : String(req.body.name).trim();

    const headId =
      req.body.headId === undefined
        ? String(family.headId)
        : req.body.headId;

    const memberIds = parseMemberIds(
      req.body.memberIds === undefined
        ? family.memberIds.map(String)
        : req.body.memberIds,
      headId
    );

    const status =
      req.body.status === undefined
        ? family.status
        : String(req.body.status).toLowerCase();

    const notes =
      req.body.notes === undefined
        ? family.notes
        : String(req.body.notes).trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Family name is required.",
      });
    }

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive.",
      });
    }

    await validateCustomers(headId, memberIds);
    await checkDuplicateName(name, family._id);
    await checkMemberAssignments(memberIds, family._id);

    family.name = name;
    family.headId = headId;
    family.memberIds = memberIds;
    family.status = status;
    family.notes = notes;
    family.updatedBy = req.user?._id || req.user?.id || null;

    await family.save();

    const updatedFamily = await Family.findById(family._id)
      .populate(publicFamilyQuery())
      .lean();

    res.status(200).json({
      success: true,
      message: "Family updated successfully.",
      data: updatedFamily,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFamilies,
  getFamilyById,
  createFamily,
  updateFamily,
};
