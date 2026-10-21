const express = require("express");

const {
    createMatchPerformance,
    getAthleteMatchPerformances
} = require("../controllers/matchPerformanceController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const ownershipMiddleware = require("../middleware/ownershipMiddleware");

const router = express.Router();

// Create match performance
router.post(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN", "COACH"),
    createMatchPerformance
);

// Get athlete match performances
router.get(
    "/athlete/:athleteId",
    authMiddleware,
    roleMiddleware("ADMIN", "COACH", "ATHLETE"),
    ownershipMiddleware,
    getAthleteMatchPerformances
);

module.exports = router;