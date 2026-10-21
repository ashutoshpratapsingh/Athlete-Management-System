const InjuryRecord = require("../models/InjuryRecord");

// Create a new injury record
const createInjuryRecord = async (req, res) => {
    try {
        const injury = await InjuryRecord.create(req.body);

        res.status(201).json({
            success: true,
            message: "Injury record created successfully",
            data: injury
        });

    } catch (error) {
        console.error("Create injury record error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to create injury record",
            error: error.message
        });
    }
};


// Get all injuries of an athlete
const getAthleteInjuries = async (req, res) => {
    try {
        const injuries = await InjuryRecord.find({
            athleteId: req.params.athleteId
        }).sort({ injuryDate: -1 });

        res.status(200).json({
            success: true,
            count: injuries.length,
            data: injuries
        });

    } catch (error) {
        console.error("Get injuries error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch injury records",
            error: error.message
        });
    }
};


module.exports = {
    createInjuryRecord,
    getAthleteInjuries
};