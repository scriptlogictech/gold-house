
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

async function createAdmin() {
  try {
    const { INITIAL_ADMIN_NAME, INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_PASSWORD } =
      process.env;

    if (
      !INITIAL_ADMIN_NAME ||
      !INITIAL_ADMIN_EMAIL ||
      !INITIAL_ADMIN_PASSWORD
    ) {
      throw new Error(
        "Set INITIAL_ADMIN_NAME, INITIAL_ADMIN_EMAIL, and INITIAL_ADMIN_PASSWORD in .env."
      );
    }

    if (INITIAL_ADMIN_PASSWORD.length < 12) {
      throw new Error(
        "Use an initial admin password with at least 12 characters."
      );
    }

    await connectDB();

    const existingAdmin = await User.exists({ role: "admin" });

    if (existingAdmin) {
      console.log("An administrator already exists. No account was created.");
      return;
    }

    const email = INITIAL_ADMIN_EMAIL.trim().toLowerCase();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error(
        "This email already belongs to a user. Choose another email."
      );
    }

    await User.create({
      name: INITIAL_ADMIN_NAME.trim(),
      email,
      password: INITIAL_ADMIN_PASSWORD,
      role: "admin",
      status: "active",
    });

    console.log("Initial administrator created successfully.");
    console.log(`Admin email: ${email}`);
    console.log("Remove the INITIAL_ADMIN_* variables from .env now.");
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

createAdmin();
