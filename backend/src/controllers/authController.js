
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

// =====================================================
// REGISTER ATHLETE
// =====================================================

const registerUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password
        } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 6 characters"
            });
        }

        // Normalize input
        const normalizedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();

        // Check whether the email already exists
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        /*
         * Public registration creates an ATHLETE account.
         *
         * athleteId is intentionally not accepted here.
         * The Admin can link the account to an Athlete record
         * through the User Management module.
         */
        const user = await User.create({
            name: normalizedName,
            email: normalizedEmail,
            password: hashedPassword,
            role: "ATHLETE"
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                athleteId: user.athleteId || null
            }
        });

    } catch (error) {
        console.error(
            "Register error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Registration failed"
        });
    }
};


// =====================================================
// LOGIN USER
// =====================================================

const loginUser = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // Find user
        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check account status
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "User account is inactive"
            });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                userId: user._id.toString(),
                role: user.role,
                athleteId: user.athleteId
                    ? user.athleteId.toString()
                    : null
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                athleteId: user.athleteId || null
            }
        });

    } catch (error) {
        console.error(
            "Login error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
};


module.exports = {
    registerUser,
    loginUser
};