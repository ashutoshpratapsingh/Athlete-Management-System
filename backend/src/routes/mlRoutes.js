const express = require("express");

const {
    analyzeAthletePerformance,
    predictAthleteMatchPerformance,
    analyzeAthletePosition,
    analyzeTeamPositions
} = require("../controllers/mlController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const ownershipMiddleware = require("../middleware/ownershipMiddleware");

const router = express.Router();

// Team Position Analytics
// Keep this BEFORE /position/:athleteId
router.post(
    "/position/team",
    authMiddleware,
    roleMiddleware("ADMIN", "COACH"),
    analyzeTeamPositions
);

// Individual Performance Analytics
router.post(
    "/performance/:athleteId",
    authMiddleware,
    roleMiddleware("ADMIN", "COACH", "ATHLETE"),
    ownershipMiddleware,
    analyzeAthletePerformance
);

// Match Performance Prediction
router.post(
    "/match-prediction/:athleteId",
    authMiddleware,
    roleMiddleware("ADMIN", "COACH", "ATHLETE"),
    ownershipMiddleware,
    predictAthleteMatchPerformance
);

// Individual Position Analytics
router.post(
    "/position/:athleteId",
    authMiddleware,
    roleMiddleware("ADMIN", "COACH", "ATHLETE"),
    ownershipMiddleware,
    analyzeAthletePosition
);

module.exports = router;