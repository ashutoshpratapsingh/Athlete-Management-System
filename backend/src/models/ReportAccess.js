const mongoose = require("mongoose");

const reportAccessSchema = new mongoose.Schema(
    {
        athleteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Athlete",
            required: true
        },

        reportId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AIReport",
            required: true
        },

        paymentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment",
            required: true
        },

        accessType: {
            type: String,
            enum: ["FREE", "FULL"],
            default: "FULL"
        },

        isActive: {
            type: Boolean,
            default: true
        },

        grantedAt: {
            type: Date,
            default: Date.now
        },

        expiresAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

reportAccessSchema.index(
    {
        athleteId: 1,
        reportId: 1
    },
    {
        unique: true
    }
);

const ReportAccess = mongoose.model(
    "ReportAccess",
    reportAccessSchema
);

module.exports = ReportAccess;