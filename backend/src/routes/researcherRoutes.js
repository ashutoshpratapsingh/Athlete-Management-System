const express = require("express");

const {
    createEligibilityCriteria,
    getEligibilityCriteria,
    getResearchAthletes,
    reviewAthleteEligibility,
    getAthleteEligibility,
    getResearcherDashboard,
    getEligibilityReviewHistory
} = require("../controllers/researcherController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    downloadEligibilityReport,
    downloadAllEligibilityReports
} = require("../controllers/eligibilityReportController");

const router = express.Router();


// ==========================================
// RESEARCHER DASHBOARD
// ==========================================

router.get(
    "/dashboard",
    authMiddleware,
    roleMiddleware("RESEARCHER", "ADMIN"),
    getResearcherDashboard
);


// ==========================================
// ELIGIBILITY CRITERIA
// ==========================================

router.post(
    "/criteria",
    authMiddleware,
    roleMiddleware("RESEARCHER", "ADMIN"),
    createEligibilityCriteria
);

router.get(
    "/criteria",
    authMiddleware,
    roleMiddleware("RESEARCHER", "ADMIN"),
    getEligibilityCriteria
);


// ==========================================
// ATHLETES
// ==========================================

router.get(
    "/athletes",
    authMiddleware,
    roleMiddleware("RESEARCHER", "ADMIN"),
    getResearchAthletes
);


// ==========================================
// ATHLETE ELIGIBILITY REVIEW
// ==========================================

router.post(
    "/eligibility",
    authMiddleware,
    roleMiddleware("RESEARCHER", "ADMIN"),
    reviewAthleteEligibility
);

router.get(
    "/eligibility/:athleteId",
    authMiddleware,
    roleMiddleware("RESEARCHER", "ADMIN"),
    getAthleteEligibility
);

router.get(
    "/eligibility-history/:athleteId",
    authMiddleware,
    roleMiddleware("RESEARCHER", "ADMIN"),
    getEligibilityReviewHistory
);

router.get(
    "/athletes/:athleteId/eligibility-report",
    authMiddleware,
    roleMiddleware("RESEARCHER", "ADMIN"),
    downloadEligibilityReport
);

router.get(
    "/eligibility-reports/all",
    authMiddleware,
    roleMiddleware("RESEARCHER", "ADMIN"),
    downloadAllEligibilityReports
);

module.exports = router;