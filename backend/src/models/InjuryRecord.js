const mongoose = require("mongoose");

const injuryRecordSchema = new mongoose.Schema(
    {
        athleteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Athlete",
            required: true
        },

        injuryDate: {
            type: Date,
            required: true
        },

        injuryType: {
            type: String,
            trim: true,
            required: true
        },

        bodyPart: {
            type: String,
            trim: true
        },

        severity: {
            type: String,
            enum: ["Mild", "Moderate", "Severe"],
            default: "Mild"
        },

        description: {
            type: String,
            trim: true
        },

        treatment: {
            type: String,
            trim: true
        },

        recoveryStatus: {
            type: String,
            enum: ["Under Treatment", "Recovering", "Recovered"],
            default: "Under Treatment"
        },

        expectedRecoveryDate: {
            type: Date
        },

        actualRecoveryDate: {
            type: Date
        },

        notes: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const InjuryRecord = mongoose.model(
    "InjuryRecord",
    injuryRecordSchema
);

module.exports = InjuryRecord;