const Assessment = require("../models/Assessment");
const User = require("../models/User");

const {
    compareWithBenchmark
} = require("../services/benchmarkService");

const {
    validateAssessment
} = require("../services/benchmarkEngine");

const {
    validateAssessmentAgainstBenchmarks
} = require("../services/benchmarkValidationService");


// ==========================================
// CREATE ASSESSMENT
// ==========================================

const createAssessment = async (req, res) => {
    try {
        const {
            athleteId,
            assessmentDate,
            ...assessmentData
        } = req.body;

        // Validate required fields
        if (!athleteId || !assessmentDate) {
            return res.status(400).json({
                success: false,
                message:
                    "Athlete ID and assessment date are required"
            });
        }

        // Get logged-in user's ID
        const userId =
            req.user.id || req.user._id;

        /*
         * ==========================================
         * BENCHMARK VALIDATION
         * ==========================================
         */

        const metricFields = [
            "lowerBodyStrength",
            "coreStrength",
            "sprint20m",
            "sprint50m",
            "agility505",
            "verticalJump",
            "aerobicCapacity",
            
            "flexibility",
            "mobility",

            "firstTouch",
            "shortPassing",
            "longPassing",
            "shootingPower",
            "shootingAccuracy",
            "dribbling",
            "crossing",
            "heading",
            "tackling",

            "rightFootPower",
            "rightFootPassing",
            "rightFootControl",
            "leftFootPower",
            "leftFootPassing",
            "leftFootControl",
            "weakFootUsage",

            "offBallMovement",
            "decisionMaking",
            "positionalDiscipline",
            "criticalThinking",

            "hsrDistance",
            "sprintCount1H",
            "sprintCount2H",
            "hrRecovery"
        ];

        const benchmarkResults = {};

        let metricsChecked = 0;
        let metricsWithBenchmark = 0;
        let anomaliesDetected = 0;

        /*
         * Check every metric supplied by the coach.
         */

        for (const metric of metricFields) {

            const metricData =
                assessmentData[metric];

            // Skip metrics that were not supplied
            if (
                !metricData ||
                metricData.score === undefined ||
                metricData.score === null ||
                metricData.score === ""
            ) {
                continue;
            }

            metricsChecked++;

let benchmarkValue;

if (
    ["sprint20m", "sprint50m", "agility505", "verticalJump"]
        .includes(metric)
) {
    benchmarkValue = metricData.result;
} else {
    benchmarkValue = metricData.score;
}

const result =
    await compareWithBenchmark(
        metric,
        benchmarkValue
    );

            benchmarkResults[metric] = result;

            if (result.available) {
                metricsWithBenchmark++;
            }

            if (result.anomaly) {
                anomaliesDetected++;
            }
        }

        /*
         * Calculate benchmark coverage.
         */

        const benchmarkCoverage =
            metricsChecked > 0
                ? Number(
                    (
                        (metricsWithBenchmark /
                            metricsChecked) *
                        100
                    ).toFixed(2)
                )
                : 0;

        /*
         * Determine overall validation.
         */

        const overallStatus =
            anomaliesDetected > 0
                ? "NEEDS_REVIEW"
                : metricsWithBenchmark === 0
                    ? "NOT_CHECKED"
                    : "PASS";

        /*
         * ==========================================
         * CREATE ASSESSMENT
         * ==========================================
         */

        const assessment =
            await Assessment.create({

                athleteId,

                assessmentDate,

                ...assessmentData,

                // Verification
                recordedBy: userId,

                verificationStatus:
                    "PENDING",

                /*
                 * Benchmark validation
                 */
                benchmarkValidation: {

                    overallStatus,

                    benchmarkCoverage,

                    metricsChecked,

                    metricsWithBenchmark,

                    anomaliesDetected,

                    results:
                        benchmarkResults,

                    generatedAt:
                        new Date()
                }
            });

        res.status(201).json({

            success: true,

            message:
                "Assessment created successfully and benchmark validation completed",

            data: assessment,

            validation: {

                overallStatus,

                benchmarkCoverage,

                metricsChecked,

                metricsWithBenchmark,

                anomaliesDetected
            }
        });

    } catch (error) {

        console.error(
            "Create assessment error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to create assessment",

            error:
                error.message
        });
    }
};

// ==========================================
// GET ALL ASSESSMENTS OF ATHLETE
// ==========================================

const getAthleteAssessments = async (req, res) => {
    try {
        const assessments = await Assessment.find({
            athleteId: req.params.athleteId
        }).sort({
            assessmentDate: -1
        });

        res.status(200).json({
            success: true,
            count: assessments.length,
            data: assessments
        });

    } catch (error) {
        console.error(
            "Get assessments error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch assessments",
            error: error.message
        });
    }
};

// ==========================================
// GET PERFORMANCE INTELLIGENCE REPORT
// ==========================================

const getPerformanceReport = async (req, res) => {
    try {
        const { assessmentId } = req.params;

        const assessment = await Assessment.findById(
            assessmentId
        ).populate(
            "athleteId",
            "name fullName firstName lastName age gender position"
        );

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found"
            });
        }

        // ==========================================
        // CATEGORY DEFINITIONS
        // ==========================================

        const categories = {
            physical: [
                "lowerBodyStrength",
                "coreStrength",
                "sprint20m",
                "sprint50m",
                "agility505",
                "verticalJump",
                "aerobicCapacity"
            ],

            technical: [
                "firstTouch",
                "shortPassing",
                "longPassing",
                "shootingPower",
                "shootingAccuracy",
                "dribbling",
                "crossing",
                "heading",
                "tackling"
            ],

            footSkills: [
                "rightFootPower",
                "rightFootPassing",
                "rightFootControl",
                "leftFootPower",
                "leftFootPassing",
                "leftFootControl",
                "weakFootUsage"
            ],

            tactical: [
                "offBallMovement",
                "decisionMaking",
                "positionalDiscipline",
                "criticalThinking"
            ],

            matchLoad: [
                "hsrDistance",
                "sprintCount1H",
                "sprintCount2H",
                "hrRecovery"
            ]
        };

        // ==========================================
        // CALCULATE CATEGORY SCORE
        // ==========================================

        const calculateCategoryScore = (metrics) => {

            const scores = [];

            metrics.forEach((metric) => {

                const data = assessment[metric];

                if (!data) return;

                let value = Number(data.score);

                if (
                    !Number.isFinite(value) &&
                    data.result !== undefined
                ) {
                    value = Number(
                        String(data.result)
                            .replace(/[^\d.-]/g, "")
                    );
                }

                if (Number.isFinite(value)) {
                    scores.push(value);
                }
            });

            if (scores.length === 0) {
                return {
                    score: null,
                    metricsEvaluated: 0
                };
            }

            const average =
                scores.reduce(
                    (sum, value) => sum + value,
                    0
                ) / scores.length;

            return {
                score: Number(average.toFixed(2)),
                metricsEvaluated: scores.length
            };
        };

        // ==========================================
        // CATEGORY PERFORMANCE
        // ==========================================

        const physical =
            calculateCategoryScore(
                categories.physical
            );

        const technical =
            calculateCategoryScore(
                categories.technical
            );

        const footSkills =
            calculateCategoryScore(
                categories.footSkills
            );

        const tactical =
            calculateCategoryScore(
                categories.tactical
            );

        const matchLoad =
            calculateCategoryScore(
                categories.matchLoad
            );

        // ==========================================
        // BENCHMARK INTELLIGENCE
        // ==========================================

        const benchmarkValidation =
            assessment.benchmarkValidation || {};

        const benchmarkResults =
            benchmarkValidation.results || {};

        // ==========================================
        // STRENGTHS & WEAKNESSES
        // ==========================================

        const strengths = [];
        const weaknesses = [];

        Object.entries(benchmarkResults)
            .forEach(([metric, result]) => {

                if (!result) return;

                const performanceIndex =
                    Number(result.performanceIndex);

                if (!Number.isFinite(performanceIndex)) {
                    return;
                }

                if (performanceIndex >= 110) {

                    strengths.push({
                        metric,
                        performanceIndex,
                        level: "ELITE"
                    });

                } else if (performanceIndex >= 100) {

                    strengths.push({
                        metric,
                        performanceIndex,
                        level: "ABOVE_BENCHMARK"
                    });

                } else if (performanceIndex < 90) {

                    weaknesses.push({
                        metric,
                        performanceIndex,
                        level:
                            performanceIndex < 75
                                ? "HIGH_PRIORITY"
                                : "DEVELOPING"
                    });
                }
            });

        // ==========================================
        // OVERALL PERFORMANCE
        // ==========================================

        const overallPerformanceIndex =
            benchmarkValidation
                .overallPerformanceIndex ??
            null;

        const overallPerformanceLevel =
            benchmarkValidation
                .overallPerformanceLevel ??
            "UNKNOWN";

        // ==========================================
        // DEVELOPMENT PRIORITIES
        // ==========================================

        const developmentPriorities =
            weaknesses
                .sort(
                    (a, b) =>
                        a.performanceIndex -
                        b.performanceIndex
                )
                .slice(0, 5);

        // ==========================================
        // RECOMMENDATIONS
        // ==========================================

        const trainingRecommendations = [];

        developmentPriorities.forEach(
            (item) => {

                switch (item.metric) {

                    case "sprint20m":
                        trainingRecommendations.push(
                            "Acceleration and explosive-start training"
                        );
                        break;

                    case "sprint50m":
                        trainingRecommendations.push(
                            "Linear speed and sprint mechanics training"
                        );
                        break;

                    case "agility505":
                        trainingRecommendations.push(
                            "Change-of-direction and agility drills"
                        );
                        break;

                    case "verticalJump":
                        trainingRecommendations.push(
                            "Lower-body power and plyometric training"
                        );
                        break;

                    case "firstTouch":
                        trainingRecommendations.push(
                            "First-touch and ball-control drills"
                        );
                        break;

                    case "shortPassing":
                        trainingRecommendations.push(
                            "Short passing accuracy and combination-play drills"
                        );
                        break;

                    case "dribbling":
                        trainingRecommendations.push(
                            "Close-control and 1v1 dribbling drills"
                        );
                        break;

                    case "shootingAccuracy":
                        trainingRecommendations.push(
                            "Finishing and shooting-placement practice"
                        );
                        break;

                    case "decisionMaking":
                        trainingRecommendations.push(
                            "Small-sided games and decision-making scenarios"
                        );
                        break;

                    case "offBallMovement":
                        trainingRecommendations.push(
                            "Off-ball movement and positioning drills"
                        );
                        break;

                    case "positionalDiscipline":
                        trainingRecommendations.push(
                            "Position-specific tactical discipline training"
                        );
                        break;

                    default:
                        trainingRecommendations.push(
                            `${item.metric} development program`
                        );
                }
            }
        );

        // ==========================================
        // FINAL REPORT
        // ==========================================

        const report = {

            athlete: assessment.athleteId,

            assessment: {
                id: assessment._id,
                date: assessment.assessmentDate,
                verificationStatus:
                    assessment.verificationStatus
            },

            overall: {
                performanceIndex:
                    overallPerformanceIndex,

                performanceLevel:
                    overallPerformanceLevel
            },

            categoryPerformance: {

                physical,

                technical,

                footSkills,

                tactical,

                matchLoad
            },

            benchmarkAnalysis: {

                coverage:
                    benchmarkValidation
                        .benchmarkCoverage ?? 0,

                metricsChecked:
                    benchmarkValidation
                        .metricsChecked ?? 0,

                benchmarksFound:
                    benchmarkValidation
                        .metricsWithBenchmark ?? 0,

                anomalies:
                    benchmarkValidation
                        .anomaliesDetected ?? 0
            },

            strengths,

            weaknesses,

            developmentPriorities,

            recommendations: {
                training:
                    [
                        ...new Set(
                            trainingRecommendations
                        )
                    ],

                recovery: [
                    "Monitor recovery between high-intensity sessions",
                    "Maintain adequate hydration and sleep",
                    "Track fatigue after repeated sprint sessions"
                ],

                nutrition: [
                    "Maintain balanced protein and carbohydrate intake",
                    "Hydrate adequately around training sessions",
                    "Adjust nutrition according to training load"
                ]
            },

            researchMetadata: {
                benchmarkVersion:
                    "2026.1",

                verificationStatus:
                    assessment.verificationStatus,

                dataSource:
                    assessment.dataSource,

                recordedBy:
                    assessment.recordedBy,

                reviewedBy:
                    assessment.reviewedBy,

                generatedAt:
                    new Date()
            }
        };

        res.status(200).json({
            success: true,
            data: report
        });

    } catch (error) {

        console.error(
            "Performance report error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to generate performance report",
            error: error.message
        });
    }
};


// ==========================================
// GET LOGGED-IN ATHLETE ASSESSMENTS
// ==========================================

const getMyAssessments = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.role !== "ATHLETE") {
            return res.status(403).json({
                success: false,
                message: "Only athletes can access this endpoint"
            });
        }

        if (!user.athleteId) {
            return res.status(404).json({
                success: false,
                message:
                    "No athlete profile linked to this account"
            });
        }

        const assessments = await Assessment.find({
            athleteId: user.athleteId
        }).sort({
            assessmentDate: -1
        });

        res.status(200).json({
            success: true,
            count: assessments.length,
            data: assessments
        });

    } catch (error) {
        console.error(
            "Get my assessments error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch your assessments",
            error: error.message
        });
    }
};


// ==========================================
// ADMIN - GET PENDING ASSESSMENTS
// ==========================================

const getPendingAssessments = async (req, res) => {
    try {

        const assessments = await Assessment.find({
            $or: [
                {
                    verificationStatus: "PENDING"
                },
                {
                    verificationStatus: {
                        $exists: false
                    }
                }
            ]
        })
            .populate(
                "athleteId",
                "name fullName firstName lastName"
            )
            .populate(
                "recordedBy",
                "name email"
            )
            .sort({
                assessmentDate: -1
            });

        res.status(200).json({
            success: true,
            count: assessments.length,
            data: assessments
        });

    } catch (error) {

        console.error(
            "Get pending assessments error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch pending assessments",
            error: error.message
        });
    }
};


// ==========================================
// ADMIN - UPDATE VERIFICATION STATUS
// ==========================================

const updateVerificationStatus = async (req, res) => {
    try {

        const { assessmentId } = req.params;

        const {
            verificationStatus,
            reviewNotes
        } = req.body;

        const allowedStatuses = [
            "VERIFIED",
            "NEEDS_REVIEW",
            "REJECTED"
        ];

        if (
            !verificationStatus ||
            !allowedStatuses.includes(
                verificationStatus
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid verification status"
            });
        }

        const assessment =
            await Assessment.findById(
                assessmentId
            );

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message:
                    "Assessment not found"
            });
        }

        const adminId =
            req.user.id || req.user._id;

assessment.verificationStatus = verificationStatus;

assessment.reviewedBy = req.user.id;
assessment.reviewedAt = new Date();

if (reviewNotes !== undefined) {
    assessment.reviewNotes = reviewNotes;
}

// ==========================================
// BENCHMARK VALIDATION
// ==========================================

const benchmarkValidation =
    await validateAssessmentAgainstBenchmarks(
        assessment
    );

assessment.benchmarkValidation = benchmarkValidation;

console.log("BENCHMARK VALIDATION:", {
    assessmentId: assessment._id,
    overallStatus: benchmarkValidation.overallStatus,
    coverage: benchmarkValidation.benchmarkCoverage,
    metricsChecked: benchmarkValidation.metricsChecked,
    metricsWithBenchmark:
        benchmarkValidation.metricsWithBenchmark,
    anomalies:
        benchmarkValidation.anomaliesDetected
});

await assessment.save();

        res.status(200).json({
            success: true,

            message:
                `Assessment marked as ${verificationStatus}`,

            data: assessment
        });

    } catch (error) {

        console.error(
            "Update verification error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to update verification status",
            error: error.message
        });
    }
};

module.exports = {
    createAssessment,
    getAthleteAssessments,
    getPerformanceReport,
    getMyAssessments,
    getPendingAssessments,
    updateVerificationStatus
};