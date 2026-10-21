const mongoose = require("mongoose");

const trainingPerformanceSchema = new mongoose.Schema(
    {
        athleteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Athlete",
            required: true
        },

        trainingDate: {
            type: Date,
            required: true
        },

        sessionType: {
            type: String,
            trim: true
        },

        durationMinutes: {
            type: Number,
            min: 0
        },

        workload: {
            type: Number,
            min: 0
        },

        intensity: {
            type: Number,
            min: 0,
            max: 10
        },

        sprintDistance: {
            type: Number,
            min: 0
        },

        sprintCount: {
            type: Number,
            min: 0
        },

        passingAccuracy: {
            type: Number,
            min: 0,
            max: 100
        },

        shootingAccuracy: {
            type: Number,
            min: 0,
            max: 100
        },

        fitnessRating: {
            type: Number,
            min: 0,
            max: 10
        },

        coachRating: {
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

const TrainingPerformance = mongoose.model(
    "TrainingPerformance",
    trainingPerformanceSchema
);

module.exports = TrainingPerformance;