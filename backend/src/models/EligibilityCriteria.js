const mongoose = require("mongoose");

const eligibilityCriteriaSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        // Minimum recognized competition level
        minimumQualificationLevel: {
            type: String,
            enum: [
                "LOCAL",
                "DISTRICT",
                "STATE",
                "NATIONAL",
                "INTERNATIONAL"
            ],
            required: true
        },

        // Optional age requirements
        minimumAge: {
            type: Number,
            min: 0
        },

        maximumAge: {
            type: Number,
            min: 0
        },

        // Whether verified competition certificates are mandatory
        certificateRequired: {
            type: Boolean,
            default: true
        },

        // Whether all required documents must be present
        documentsRequired: {
            type: Boolean,
            default: true
        },

        // Performance is NOT the same as eligibility.
        // This is only an optional research threshold.
        minimumPerformanceScore: {
            type: Number,
            min: 0,
            max: 100,
            default: null
        },

        performanceThresholdEnabled: {
            type: Boolean,
            default: false
        },

        status: {
            type: String,
            enum: [
                "ACTIVE",
                "INACTIVE"
            ],
            default: "ACTIVE"
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    {
        timestamps: true
    }
);

const EligibilityCriteria = mongoose.model(
    "EligibilityCriteria",
    eligibilityCriteriaSchema
);

module.exports = EligibilityCriteria;