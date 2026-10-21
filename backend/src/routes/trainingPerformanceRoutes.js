const express = require("express");

const {
    createTrainingPerformance,
    getAthleteTrainingPerformances
} = require("../controllers/trainingPerformanceController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const ownershipMiddleware = require("../middleware/ownershipMiddleware");

const router = express.Router();

// Create training performance
router.post(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN", "COACH"),
    createTrainingPerformance
);

// Get athlete training performances
router.get(
    "/athlete/:athleteId",
    authMiddleware,
    roleMiddleware("ADMIN", "COACH", "ATHLETE"),
    ownershipMiddleware,
    getAthleteTrainingPerformances
);

module.exports = router;