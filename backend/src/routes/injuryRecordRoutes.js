const express = require("express");

const {
    createInjuryRecord,
    getAthleteInjuries
} = require("../controllers/injuryRecordController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const ownershipMiddleware = require("../middleware/ownershipMiddleware");

const router = express.Router();

// Create injury record
router.post(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN", "COACH"),
    createInjuryRecord
);

// Get athlete injury records
router.get(
    "/athlete/:athleteId",
    authMiddleware,
    roleMiddleware("ADMIN", "COACH", "ATHLETE"),
    ownershipMiddleware,
    getAthleteInjuries
);

module.exports = router;