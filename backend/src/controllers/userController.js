
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");

const allowedRoles = ["ADMIN", "COACH", "RESEARCHER", "ATHLETE"];

// Create user
const createUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role,
            athleteId
        } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Name, email, password and role are required"
            });
        }

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user role"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 6 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        if (
            athleteId &&
            !mongoose.Types.ObjectId.isValid(athleteId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid athlete ID"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role,
            athleteId: athleteId || undefined,
            isActive: true
        });

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                athleteId: user.athleteId,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error("Create user error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to create user",
            error: error.message
        });
    }
};

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .populate("athleteId", "name externalId position")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error("Get users error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch users",
            error: error.message
        });
    }
};

// Update user details
const updateUser = async (req, res) => {
    try {
        const {
            name,
            email,
            role,
            athleteId
        } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (role && !allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user role"
            });
        }

        if (
            athleteId &&
            !mongoose.Types.ObjectId.isValid(athleteId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid athlete ID"
            });
        }

        if (email) {
            const normalizedEmail = email.trim().toLowerCase();

            const existingUser = await User.findOne({
                email: normalizedEmail,
                _id: { $ne: user._id }
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "Another user already uses this email"
                });
            }

            user.email = normalizedEmail;
        }

        if (name !== undefined) {
            user.name = name.trim();
        }

        if (role !== undefined) {
            user.role = role;
        }

        if (athleteId !== undefined) {
            user.athleteId = athleteId || undefined;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                athleteId: user.athleteId,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error("Update user error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to update user",
            error: error.message
        });
    }
};

// Activate or deactivate user
const updateUserStatus = async (req, res) => {
    try {
        const { isActive } = req.body;

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isActive must be a boolean value"
            });
        }

        if (req.user && req.user.id === req.params.id && !isActive) {
            return res.status(400).json({
                success: false,
                message: "You cannot deactivate your own account"
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive },
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: isActive
                ? "User activated successfully"
                : "User deactivated successfully",
            data: user
        });
    } catch (error) {
        console.error("Update user status error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to update user status",
            error: error.message
        });
    }
};

module.exports = {
    createUser,
    getAllUsers,
    updateUser,
    updateUserStatus
};