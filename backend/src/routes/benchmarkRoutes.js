const express = require("express");

const {
    getAssessmentBenchmarkComparison
} = require("../controllers/benchmarkController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


// ==========================================
// GET BENCHMARK COMPARISON
// ==========================================

router.get(
    "/assessment/:assessmentId",
    authMiddleware,
    roleMiddleware("ADMIN", "COACH", "ATHLETE"),
    getAssessmentBenchmarkComparison
);


module.exports = router;