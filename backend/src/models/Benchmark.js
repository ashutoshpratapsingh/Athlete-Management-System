const mongoose = require("mongoose");

const benchmarkSchema = new mongoose.Schema(
    {
        metric: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            enum: [
                "PHYSICAL",
                "TECHNICAL",
                "TACTICAL",
                "FOOT_SKILLS",
                "MATCH_LOAD"
            ],
            required: true
        },

        position: {
            type: String,
            default: "ALL"
        },

        ageGroup: {
            type: String,
            default: "ALL"
        },

        gender: {
            type: String,
            default: "ALL"
        },

        level: {
            type: String,
            enum: [
                "DEVELOPMENTAL",
                "COMPETITIVE",
                "ELITE"
            ],
            default: "DEVELOPMENTAL"
        },

        unit: {
            type: String,
            required: true
        },

        // For metrics where LOWER is better
        lowerIsBetter: {
            type: Boolean,
            default: false
        },

        benchmarkValue: {
            type: Number,
            required: true
        },

        acceptableRangeMin: {
            type: Number
        },

        acceptableRangeMax: {
            type: Number
        },

        sourceType: {
            type: String,
            enum: [
                "RESEARCH",
                "OFFICIAL_STANDARD",
                "EXPERT_DEFINED",
                "CLUB_STANDARD"
            ],
            required: true
        },

        sourceName: {
            type: String,
            required: true,
            trim: true
        },

        sourceReference: {
            type: String,
            trim: true
        },

        testProtocol: {
            type: String,
            trim: true
        },

        version: {
            type: String,
            default: "2026.1"
        },

        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE"],
            default: "ACTIVE"
        }
    },
    {
        timestamps: true
    }
);

const Benchmark = mongoose.model("Benchmark", benchmarkSchema);

module.exports = Benchmark;