
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { getCookieOptions } = require("../middleware/authMiddleware");

const createToken = (userId) => {
  return jwt.sign(
    { userId: userId.toString() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
};

const getPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  lastLoginAt: user.lastLoginAt,
});

const login = async (req, res, next) => {
  try {
    const email =
      typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const password =
      typeof req.body?.password === "string"
        ? req.body.password
        : "";

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Contact the administrator.",
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = createToken(user._id);

    res.cookie("goldhouse_token", token, {
      ...getCookieOptions(),
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: getPublicUser(user),
    });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  res.clearCookie("goldhouse_token", getCookieOptions());

  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

const getMe = (req, res) => {
  return res.status(200).json({
    success: true,
    user: getPublicUser(req.user),
  });
};

module.exports = {
  login,
  logout,
  getMe,
};
