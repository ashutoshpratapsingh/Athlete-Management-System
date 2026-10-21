const express = require("express");

const {
    generateReport,
    createReport,
    getBasicReport,
    getFullReport
} = require("../controllers/aiReportController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const ownershipMiddleware = require("../middleware/ownershipMiddleware");

const router = express.Router();


// ============================================================
// GENERATE PREMIUM REPORT
// ADMIN / COACH / OWN ATHLETE
// ============================================================

router.post(
    "/generate/:athleteId",
    authMiddleware,
    ownershipMiddleware,
    generateReport
);

// ============================================================
// MANUAL REPORT CREATION
// ADMIN / COACH ONLY
// ============================================================

router.post(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN", "COACH"),
    createReport
);


// ============================================================
// BASIC FREE REPORT
// ============================================================

router.get(
    "/basic/:athleteId",
    authMiddleware,
    roleMiddleware(
        "ADMIN",
        "COACH",
        "ATHLETE"
    ),
    ownershipMiddleware,
    getBasicReport
);


// ============================================================
// FULL PREMIUM REPORT
// ============================================================

router.get(
    "/full/:athleteId",
    authMiddleware,
    roleMiddleware(
        "ADMIN",
        "COACH",
        "ATHLETE"
    ),
    ownershipMiddleware,
    getFullReport
);


module.exports = router;