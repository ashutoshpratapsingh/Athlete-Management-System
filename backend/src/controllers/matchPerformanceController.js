const MatchPerformance = require("../models/MatchPerformance");

// Create match performance
const createMatchPerformance = async (req, res) => {
    try {
        const performance = await MatchPerformance.create(req.body);

        res.status(201).json({
            success: true,
            message: "Match performance created successfully",
            data: performance
        });

    } catch (error) {
        console.error("Create match performance error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to create match performance",
            error: error.message
        });
    }
};


// Get athlete match history
const getAthleteMatchPerformances = async (req, res) => {
    try {
        const performances = await MatchPerformance.find({
            athleteId: req.params.athleteId
        }).sort({ matchDate: -1 });

        res.status(200).json({
            success: true,
            count: performances.length,
            data: performances
        });

    } catch (error) {
        console.error("Get match performances error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch match performances",
            error: error.message
        });
    }
};


module.exports = {
    createMatchPerformance,
    getAthleteMatchPerformances
};