const TrainingPerformance = require("../models/TrainingPerformance");

// Create training performance
const createTrainingPerformance = async (req, res) => {
    try {
        const performance = await TrainingPerformance.create(req.body);

        res.status(201).json({
            success: true,
            message: "Training performance created successfully",
            data: performance
        });

    } catch (error) {
        console.error("Create training performance error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to create training performance",
            error: error.message
        });
    }
};


// Get athlete training history
const getAthleteTrainingPerformances = async (req, res) => {
    try {
        const performances = await TrainingPerformance.find({
            athleteId: req.params.athleteId
        }).sort({ trainingDate: -1 });

        res.status(200).json({
            success: true,
            count: performances.length,
            data: performances
        });

    } catch (error) {
        console.error("Get training performances error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch training performances",
            error: error.message
        });
    }
};


module.exports = {
    createTrainingPerformance,
    getAthleteTrainingPerformances
};