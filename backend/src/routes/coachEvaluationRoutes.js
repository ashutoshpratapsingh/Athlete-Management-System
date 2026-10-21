const express = require("express");

const {
    createCoachEvaluation,
    getAthleteCoachEvaluations
} = require("../controllers/coachEvaluationController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const ownershipMiddleware = require("../middleware/ownershipMiddleware");

const router = express.Router();

// Create coach evaluation
router.post(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN", "COACH"),
    createCoachEvaluation
);

// Get athlete coach evaluations
router.get(
    "/athlete/:athleteId",
    authMiddleware,
    roleMiddleware("ADMIN", "COACH", "ATHLETE"),
    ownershipMiddleware,
    getAthleteCoachEvaluations
);

module.exports = router;