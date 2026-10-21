const express = require("express");
const cors = require("cors");
const Athlete = require("./models/Athlete");

const athleteRoutes = require("./routes/athleteRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const matchPerformanceRoutes = require("./routes/matchPerformanceRoutes");
const trainingPerformanceRoutes = require("./routes/trainingPerformanceRoutes");
const injuryRecordRoutes = require("./routes/injuryRecordRoutes");
const coachEvaluationRoutes = require("./routes/coachEvaluationRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const aiReportRoutes = require("./routes/aiReportRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const mlRoutes = require("./routes/mlRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const benchmarkRoutes = require("./routes/benchmarkRoutes");
const researcherRoutes = require("./routes/researcherRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/athletes", athleteRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/match-performances", matchPerformanceRoutes);
app.use("/api/training-performances", trainingPerformanceRoutes);
app.use("/api/injury-records", injuryRecordRoutes);
app.use("/api/coach-evaluations", coachEvaluationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reports", aiReportRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/ml", mlRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/benchmarks", benchmarkRoutes);
app.use("/api/researcher", researcherRoutes);

// Root route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "AMS Backend is running"
    });
});

module.exports = app;