const mongoose = require("mongoose");

const athleteEligibilitySchema = new mongoose.Schema(
    {
        athleteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Athlete",
            required: true
        },

        criteriaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "EligibilityCriteria",
            required: true
        },

        // Qualification actually achieved by the athlete
        actualQualificationLevel: {
            type: String,
            enum: [
                "LOCAL",
                "DISTRICT",
                "STATE",
                "NATIONAL",
                "INTERNATIONAL",
                "NONE",
                "UNKNOWN"
            ],
            default: "UNKNOWN"
        },

        // Individual eligibility checks
        ageEligible: {
            type: Boolean,
            default: null
        },

        documentsComplete: {
            type: Boolean,
            default: null
        },

        certificatesVerified: {
            type: Boolean,
            default: null
        },

        performanceReviewed: {
            type: Boolean,
            default: false
        },

        // Current overall performance score
        performanceScore: {
            type: Number,
            min: 0,
            max: 100,
            default: null
        },

        // IMPORTANT:
        // Performance level and eligibility are separate concepts.
        performanceLevel: {
            type: String,
            enum: [
                "DEVELOPMENT_REQUIRED",
                "DEVELOPING",
                "COMPETITIVE",
                "ADVANCED",
                "ELITE",
                "NOT_ASSESSED"
            ],
            default: "NOT_ASSESSED"
        },

        // Final Researcher decision
        status: {
            type: String,
            enum: [
                "ELIGIBLE",
                "ELIGIBLE_WITH_REVIEW",
                "NOT_ELIGIBLE",
                "INSUFFICIENT_DATA"
            ],
            default: "INSUFFICIENT_DATA"
        },

        reason: {
            type: String,
            trim: true
        },

        researcherRemarks: {
            type: String,
            trim: true
        },

        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        reviewedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const AthleteEligibility = mongoose.model(
    "AthleteEligibility",
    athleteEligibilitySchema
);

module.exports = AthleteEligibility;