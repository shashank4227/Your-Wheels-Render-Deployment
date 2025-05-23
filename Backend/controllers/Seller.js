const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Seller = require("../models/Seller");

// ✅ Seller Signup
exports.sellerSignUp = async (req, res) => {
  const { firstName, lastName, email, password, terms } = req.body;

  if (!firstName || !lastName || !email || !password || !terms) {
    return res.status(400).json({ success: false, msg: "All fields are required." });
  }

  try {
    const existingUser = await Seller.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, msg: "User already exists." });
    }

    const newUser = new Seller({
      firstName,
      lastName,
      email,
      password,
      role: "seller",
    });

    await newUser.save();
    const token = newUser.generateAuthToken();

    res.status(201).json({
      success: true,
      msg: "Seller registered successfully",
      userId: newUser._id,
      role: "seller",
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// ✅ Get Seller by ID (no Redis caching)
exports.sellerId = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await Seller.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// ✅ Seller Login
exports.sellerLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Seller.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "No User found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = user.generateAuthToken();

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        sellerId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
