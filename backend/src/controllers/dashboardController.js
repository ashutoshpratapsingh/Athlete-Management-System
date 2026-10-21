const Athlete = require("../models/Athlete");
const Assessment = require("../models/Assessment");
const MatchPerformance = require("../models/MatchPerformance");
const TrainingPerformance = require("../models/TrainingPerformance");
const InjuryRecord = require("../models/InjuryRecord");
const AIReport = require("../models/AIReport");

const getDashboardStats = async (req, res) => {
    try {
        const [
            totalAthletes,
            activeAthletes,
            totalAssessments,
            totalMatches,
            totalTrainingSessions,
            totalInjuries,
            totalAIReports
        ] = await Promise.all([
            Athlete.countDocuments(),
            Athlete.countDocuments({ isActive: true }),
            Assessment.countDocuments(),
            MatchPerformance.countDocuments(),
            TrainingPerformance.countDocuments(),
            InjuryRecord.countDocuments(),
            AIReport.countDocuments()
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalAthletes,
                activeAthletes,
                totalAssessments,
                totalMatches,
                totalTrainingSessions,
                totalInjuries,
                totalAIReports
            }
        });
    } catch (error) {
        console.error(
            "Dashboard stats error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics",
            error: error.message
        });
    }
};

module.exports = {
    getDashboardStats
};