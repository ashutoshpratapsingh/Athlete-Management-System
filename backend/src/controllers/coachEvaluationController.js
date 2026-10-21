const CoachEvaluation = require("../models/CoachEvaluation");

// Create a coach evaluation
const createCoachEvaluation = async (req, res) => {
    try {
        const evaluation = await CoachEvaluation.create(req.body);

        res.status(201).json({
            success: true,
            message: "Coach evaluation created successfully",
            data: evaluation
        });

    } catch (error) {
        console.error("Create coach evaluation error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to create coach evaluation",
            error: error.message
        });
    }
};


// Get all evaluations of an athlete
const getAthleteCoachEvaluations = async (req, res) => {
    try {
        const evaluations = await CoachEvaluation.find({
            athleteId: req.params.athleteId
        })
        .sort({ evaluationDate: -1 });

        res.status(200).json({
            success: true,
            count: evaluations.length,
            data: evaluations
        });

    } catch (error) {
        console.error("Get coach evaluations error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch coach evaluations",
            error: error.message
        });
    }
};


module.exports = {
    createCoachEvaluation,
    getAthleteCoachEvaluations
};