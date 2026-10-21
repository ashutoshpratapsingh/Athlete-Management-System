const mongoose = require("mongoose");

const coachEvaluationSchema = new mongoose.Schema(
    {
        athleteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Athlete",
            required: true
        },

        coachId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        evaluationDate: {
            type: Date,
            required: true
        },

        technicalRating: {
            type: Number,
            min: 0,
            max: 10
        },

        tacticalRating: {
            type: Number,
            min: 0,
            max: 10
        },

        physicalRating: {
            type: Number,
            min: 0,
            max: 10
        },

        mentalRating: {
            type: Number,
            min: 0,
            max: 10
        },

        disciplineRating: {
            type: Number,
            min: 0,
            max: 10
        },

        overallRating: {
            type: Number,
            min: 0,
            max: 10
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

        comments: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const CoachEvaluation = mongoose.model(
    "CoachEvaluation",
    coachEvaluationSchema
);

module.exports = CoachEvaluation;