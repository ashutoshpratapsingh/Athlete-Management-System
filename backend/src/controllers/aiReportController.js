const AIReport = require("../models/AIReport");
const Athlete = require("../models/Athlete");

const {
    collectAthleteReportData,
    generatePerformanceAnalysis,
    buildPremiumReport
} = require("../services/reportService");


// ============================================================
// GENERATE PREMIUM AI REPORT
// ============================================================

const generateReport = async (req, res) => {
    try {
        const { athleteId } = req.params;

        const athlete =
            await Athlete.findById(athleteId);

        if (!athlete) {
            return res.status(404).json({
                success: false,
                message: "Athlete not found"
            });
        }


        // Collect all athlete data

        const reportData =
            await collectAthleteReportData(
                athleteId
            );


        // Run ML performance analysis

        const performanceResult =
            await generatePerformanceAnalysis(
                athleteId
            );


        // Build complete premium report

        const reportContent =
            buildPremiumReport({
                athlete,
                reportData,
                performanceAnalysis:
                    performanceResult.performanceAnalysis
            });


        // Preserve existing payment status

        const existingReport =
            await AIReport.findOne({
                athleteId,
                reportType: "FULL"
            });


        const report =
            await AIReport.findOneAndUpdate(
                {
                    athleteId,
                    reportType: "FULL"
                },
                {
                    $set: {
                        athleteId,
                        reportDate: new Date(),

                        reportType: "FULL",

                        overallScore:
                            reportContent.overallScore,

                        strengths:
                            reportContent.strengths,

                        weaknesses:
                            reportContent.weaknesses,

                        injuryRisk:
                            reportContent.injuryAnalysis.risk,

                        trainingRecommendations:
                            reportContent.trainingRecommendations,

                        nutritionRecommendations:
                            reportContent.nutritionRecommendations,

                        recoveryRecommendations:
                            reportContent.recoveryRecommendations,

                        aiSummary:
                            reportContent.aiSummary
                    }
                },
                {
                    new: true,
                    upsert: true,
                    setDefaultsOnInsert: true
                }
            );


        return res.status(200).json({
            success: true,
            message:
                "Premium AI report generated successfully",

            data: {
                report,

                detailedAnalysis:
                    reportContent,

                performanceAnalysis:
                    performanceResult.performanceAnalysis
            }
        });

    } catch (error) {
        console.error(
            "Generate AI report error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to generate AI report",
            error: error.message
        });
    }
};


// ============================================================
// CREATE MANUAL REPORT
// ============================================================

const createReport = async (req, res) => {
    try {
        const {
            athleteId,
            reportType,
            overallScore,
            strengths,
            weaknesses,
            injuryRisk,
            trainingRecommendations,
            nutritionRecommendations,
            recoveryRecommendations,
            aiSummary
        } = req.body;


        const athlete =
            await Athlete.findById(athleteId);

        if (!athlete) {
            return res.status(404).json({
                success: false,
                message: "Athlete not found"
            });
        }


        const report =
            await AIReport.create({
                athleteId,
                reportType:
                    reportType || "FULL",
                overallScore,
                strengths,
                weaknesses,
                injuryRisk,
                trainingRecommendations,
                nutritionRecommendations,
                recoveryRecommendations,
                aiSummary
            });


        return res.status(201).json({
            success: true,
            message:
                "AI report created successfully",
            data: report
        });

    } catch (error) {
        console.error(
            "Create report error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to create AI report",
            error: error.message
        });
    }
};


// ============================================================
// BASIC REPORT
// ============================================================

const getBasicReport = async (req, res) => {
    try {
        const athlete =
            await Athlete.findById(
                req.params.athleteId
            );

        if (!athlete) {
            return res.status(404).json({
                success: false,
                message: "Athlete not found"
            });
        }


        return res.status(200).json({
            success: true,

            reportType: "BASIC",

            access: "FREE",

            data: {
                name: athlete.name,
                age: athlete.age,
                position: athlete.position,
                club: athlete.club,
                bloodGroup:
                    athlete.bloodGroup,
                assessmentDate:
                    athlete.assessmentDate,
                bestPosition:
                    athlete.bestPosition,
                secondaryPositions:
                    athlete.secondaryPositions
            }
        });

    } catch (error) {
        console.error(
            "Get basic report error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch basic report",
            error: error.message
        });
    }
};


// ============================================================
// FULL REPORT
// ============================================================

const getFullReport = async (req, res) => {
    try {
        const athleteId =
            req.params.athleteId;


        const athlete =
            await Athlete.findById(
                athleteId
            );

        if (!athlete) {
            return res.status(404).json({
                success: false,
                message: "Athlete not found"
            });
        }


        // Find latest premium report

        const aiReport =
            await AIReport.findOne({
                athleteId,
                reportType: "FULL"
            }).sort({
                reportDate: -1
            });


        // Admin and Coach have direct access

        const userRole = String(req.user.role || "").toUpperCase();

        const isAuthorizedRole =
            userRole === "ADMIN" ||
            userRole === "COACH";


        // Athlete requires payment

        const isPaidAthlete =
            req.user.role === "ATHLETE" &&
            aiReport &&
            aiReport.isPaid === true;


        if (
            !isAuthorizedRole &&
            !isPaidAthlete
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Full report is locked. Please complete payment to access it."
            });
        }


        // If no report exists, generate it

        let finalReport = aiReport;

        if (!finalReport) {
            return res.status(404).json({
                success: false,
                message:
                    "Premium report has not been generated yet."
            });
        }


        // Collect detailed data

        const reportData =
            await collectAthleteReportData(
                athleteId
            );


        const performanceResult =
            await generatePerformanceAnalysis(
                athleteId
            );


        const detailedAnalysis =
            buildPremiumReport({
                athlete,
                reportData,
                performanceAnalysis:
                    performanceResult.performanceAnalysis
            });


        return res.status(200).json({
            success: true,

            reportType: "FULL",

            access:
                isAuthorizedRole
                    ? "AUTHORIZED_ROLE"
                    : "PAID",

            data: {
                athlete,

                report:
                    finalReport,

                detailedAnalysis,

                assessments:
                    reportData.assessments,

                matchPerformances:
                    reportData.matchPerformances,

                trainingPerformances:
                    reportData.trainingPerformances,

                injuryRecords:
                    reportData.injuryRecords,

                coachEvaluations:
                    reportData.coachEvaluations,

                performanceAnalysis:
                    performanceResult.performanceAnalysis
            }
        });

    } catch (error) {
        console.error(
            "Get full report error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch full report",
            error: error.message
        });
    }
};


module.exports = {
    generateReport,
    createReport,
    getBasicReport,
    getFullReport
};