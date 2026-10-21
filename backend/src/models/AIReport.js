const mongoose = require("mongoose");

const aiReportSchema = new mongoose.Schema(
    {
        athleteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Athlete",
            required: true
        },

        reportDate: {
            type: Date,
            default: Date.now
        },

        reportType: {
            type: String,
            enum: ["BASIC", "FULL"],
            default: "FULL"
        },

        overallScore: {
            type: Number,
            min: 0,
            max: 100
        },

        strengths: [
            {
                type: String,
                trim: true
            }
        ],

        weaknesses: [
            {
                type: String,
                trim: true
            }
        ],

        injuryRisk: {
            type: String,
            trim: true
        },

        trainingRecommendations: [
            {
                type: String,
                trim: true
            }
        ],

        nutritionRecommendations: [
            {
                type: String,
                trim: true
            }
        ],

        recoveryRecommendations: [
            {
                type: String,
                trim: true
            }
        ],

        aiSummary: {
            type: String,
            trim: true
        },

        isPaid: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const AIReport = mongoose.model("AIReport", aiReportSchema);

module.exports = AIReport;