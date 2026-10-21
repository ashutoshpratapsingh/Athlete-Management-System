const express = require("express");

const {
    createAssessment,
    getAthleteAssessments,
    getPerformanceReport,
    getMyAssessments,
    getPendingAssessments,
    updateVerificationStatus
} = require("../controllers/assessmentController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const ownershipMiddleware = require("../middleware/ownershipMiddleware");

const router = express.Router();


// ==========================================
// CREATE ASSESSMENT
// Admin / Coach
// ==========================================

router.post(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN", "COACH"),
    createAssessment
);


// ==========================================
// ATHLETE - MY ASSESSMENTS
// ==========================================

router.get(
    "/me",
    authMiddleware,
    roleMiddleware("ATHLETE"),
    getMyAssessments
);


// ==========================================
// ADMIN - GET PENDING ASSESSMENTS
// ==========================================

router.get(
    "/pending",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getPendingAssessments
);

// ==========================================
// PERFORMANCE INTELLIGENCE REPORT
// Admin / Coach
// ==========================================

router.get(
    "/:assessmentId/performance-report",
    authMiddleware,
    roleMiddleware("ADMIN", "COACH"),
    getPerformanceReport
);

// ==========================================
// ADMIN - VERIFY / REVIEW / REJECT
// ==========================================

router.put(
    "/:assessmentId/verification",
    authMiddleware,
    roleMiddleware("ADMIN"),
    updateVerificationStatus
);


// ==========================================
// GET SPECIFIC ATHLETE ASSESSMENTS
// Admin / Coach / Athlete
// ==========================================

router.get(
    "/athlete/:athleteId",
    authMiddleware,
    roleMiddleware("ADMIN", "COACH", "ATHLETE"),
    ownershipMiddleware,
    getAthleteAssessments
);


module.exports = router;