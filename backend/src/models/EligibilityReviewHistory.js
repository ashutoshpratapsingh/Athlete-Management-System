
const mongoose = require("mongoose");

const eligibilityReviewHistorySchema = new mongoose.Schema(
    {
        athleteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Athlete",
            required: true,
            index: true
        },

        criteriaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "EligibilityCriteria",
            required: true
        },

        eligibilityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AthleteEligibility",
            default: null
        },

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

        ageEligible: {
            type: Boolean,
            default: null
        },

        certificatesVerified: {
            type: Boolean,
            default: null
        },

        documentsComplete: {
            type: Boolean,
            default: null
        },

        performanceReviewed: {
            type: Boolean,
            default: false
        },

        performanceScore: {
            type: Number,
            min: 0,
            max: 100,
            default: null
        },

        status: {
            type: String,
            enum: [
                "ELIGIBLE",
                "ELIGIBLE_WITH_REVIEW",
                "NOT_ELIGIBLE",
                "INSUFFICIENT_DATA"
            ],
            required: true
        },

        reason: {
            type: String,
            trim: true,
            default: ""
        },

        researcherRemarks: {
            type: String,
            trim: true,
            default: ""
        },

        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        reviewedAt: {
            type: Date,
            default: Date.now,
            required: true
        }
    },
    {
        timestamps: true
    }
);

eligibilityReviewHistorySchema.index({
    athleteId: 1,
    reviewedAt: -1
});

eligibilityReviewHistorySchema.index({
    athleteId: 1,
    criteriaId: 1,
    reviewedAt: -1
});

module.exports = mongoose.model(
    "EligibilityReviewHistory",
    eligibilityReviewHistorySchema
);