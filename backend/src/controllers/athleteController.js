
const Athlete = require("../models/Athlete");
const User = require("../models/User");

// Create a new athlete
const createAthlete = async (req, res) => {
    try {
        const {
            externalId,
            name,
            age,
            position,
            club,
            bloodGroup,
            assessmentDate,
            bestPosition,
            secondaryPositions
        } = req.body;

        const athlete = await Athlete.create({
            externalId,
            name,
            age,
            position,
            club,
            bloodGroup,
            assessmentDate,
            bestPosition,
            secondaryPositions
        });

        res.status(201).json({
            success: true,
            message: "Athlete created successfully",
            data: athlete
        });

    } catch (error) {
        console.error("Create athlete error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to create athlete",
            error: error.message
        });
    }
};


// Get all athletes
const getAllAthletes = async (req, res) => {
    try {
        const athletes = await Athlete.find({
            isActive: true
        }).sort({
            createdAt: -1
        });

        res.status(200).json({
            success: true,
            count: athletes.length,
            data: athletes
        });

    } catch (error) {
        console.error("Get athletes error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch athletes",
            error: error.message
        });
    }
};


// Get logged-in athlete profile
const getMyAthleteProfile = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User identity not found in token"
            });
        }

        const user = await User.findById(userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User account not found"
            });
        }

        if (user.role !== "ATHLETE") {
            return res.status(403).json({
                success: false,
                message: "This endpoint is only for athletes"
            });
        }

        if (!user.athleteId) {
            return res.status(404).json({
                success: false,
                message: "No athlete profile is linked to this account"
            });
        }

        const athlete = await Athlete.findById(user.athleteId);

        if (!athlete) {
            return res.status(404).json({
                success: false,
                message: "Linked athlete profile not found"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive
                },
                athlete
            }
        });

    } catch (error) {
        console.error(
            "Get my athlete profile error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch your athlete profile",
            error: error.message
        });
    }
};


// Get athlete by ID
const getAthleteById = async (req, res) => {
    try {
        const athlete = await Athlete.findById(req.params.id);

        if (!athlete) {
            return res.status(404).json({
                success: false,
                message: "Athlete not found"
            });
        }

        res.status(200).json({
            success: true,
            data: athlete
        });

    } catch (error) {
        console.error("Get athlete error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch athlete",
            error: error.message
        });
    }
};


// Update athlete
const updateAthlete = async (req, res) => {
    try {
        const athlete = await Athlete.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!athlete) {
            return res.status(404).json({
                success: false,
                message: "Athlete not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Athlete updated successfully",
            data: athlete
        });

    } catch (error) {
        console.error("Update athlete error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to update athlete",
            error: error.message
        });
    }
};


// Deactivate athlete
const deactivateAthlete = async (req, res) => {
    try {
        const athlete = await Athlete.findByIdAndUpdate(
            req.params.id,
            {
                isActive: false
            },
            {
                new: true
            }
        );

        if (!athlete) {
            return res.status(404).json({
                success: false,
                message: "Athlete not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Athlete deactivated successfully",
            data: athlete
        });

    } catch (error) {
        console.error(
            "Deactivate athlete error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to deactivate athlete",
            error: error.message
        });
    }
};


module.exports = {
    createAthlete,
    getAllAthletes,
    getMyAthleteProfile,
    getAthleteById,
    updateAthlete,
    deactivateAthlete
};