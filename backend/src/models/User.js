
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please provide a valid email address"
            ]
        },

        password: {
            type: String,
            required: true,
            minlength: 6
        },

        role: {
            type: String,
            enum: [
                "ADMIN",
                "COACH",
                "RESEARCHER",
                "ATHLETE"
            ],
            default: "ATHLETE"
        },

        athleteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Athlete",
            default: null
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model(
    "User",
    userSchema
);

module.exports = User;