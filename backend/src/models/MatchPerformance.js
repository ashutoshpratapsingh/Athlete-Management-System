const mongoose = require("mongoose");

const matchPerformanceSchema = new mongoose.Schema(
    {
        athleteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Athlete",
            required: true
        },

        matchDate: {
            type: Date,
            required: true
        },

        opponent: {
            type: String,
            trim: true
        },

        competition: {
            type: String,
            trim: true
        },

        minutesPlayed: {
            type: Number,
            min: 0
        },

        goals: {
            type: Number,
            min: 0,
            default: 0
        },

        assists: {
            type: Number,
            min: 0,
            default: 0
        },

        passes: {
            type: Number,
            min: 0,
            default: 0
        },

        tackles: {
            type: Number,
            min: 0,
            default: 0
        },

        interceptions: {
            type: Number,
            min: 0,
            default: 0
        },

        shots: {
            type: Number,
            min: 0,
            default: 0
        },

        performanceRating: {
            type: Number,
            min: 0,
            max: 10
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

const MatchPerformance = mongoose.model(
    "MatchPerformance",
    matchPerformanceSchema
);

module.exports = MatchPerformance;