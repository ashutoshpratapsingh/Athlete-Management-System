const Assessment = require("../models/Assessment");
const Athlete = require("../models/Athlete");
const { compareMetricWithBenchmark } = require("../services/benchmarkService");


// ==========================================
// GET BENCHMARK COMPARISON FOR AN ASSESSMENT
// ==========================================

const getAssessmentBenchmarkComparison = async (req, res) => {
    try {
        const { assessmentId } = req.params;

        const assessment = await Assessment.findById(assessmentId)
            .populate("athleteId");

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found"
            });
        }

        // Only verified assessments should be benchmarked
        if (assessment.verificationStatus !== "VERIFIED") {
            return res.status(400).json({
                success: false,
                message:
                    "Benchmark comparison is available only for verified assessments"
            });
        }

        const athlete = assessment.athleteId;

        const position = athlete?.position || "ALL";
        const ageGroup = athlete?.ageGroup || "ALL";
        const gender = athlete?.gender || "ALL";

        const metrics = [
            "sprint20m",
            "sprint50m",
            "verticalJump",
            "agility505",
            "firstTouch",
            "shortPassing",
            "dribbling",
            "shootingAccuracy",
            "decisionMaking",
            "offBallMovement",
            "positionalDiscipline"
        ];

        const comparisons = [];

        for (const metric of metrics) {
            const metricData = assessment[metric];

            if (
                !metricData ||
                metricData.score === undefined &&
                metricData.result === undefined
            ) {
                continue;
            }

            // Most of our current benchmark data is based
            // on numeric values.
            let value = metricData.score;

            // For future benchmarks that use result values,
            // try converting the result into a number.
            if (
                (value === undefined || value === null) &&
                metricData.result !== undefined
            ) {
                value = Number(metricData.result);
            }

            if (Number.isNaN(value)) {
                continue;
            }

            const comparison =
                await compareMetricWithBenchmark({
                    metric,
                    value,
                    position,
                    ageGroup,
                    gender
                });

            comparisons.push(comparison);
        }

        const validComparisons = comparisons.filter(
            item =>
                item.performanceStatus === "ABOVE_BENCHMARK" ||
                item.performanceStatus === "WITHIN_RANGE" ||
                item.performanceStatus === "BELOW_BENCHMARK"
        );

        const aboveBenchmark = validComparisons.filter(
            item => item.performanceStatus === "ABOVE_BENCHMARK"
        ).length;

        const withinRange = validComparisons.filter(
            item => item.performanceStatus === "WITHIN_RANGE"
        ).length;

        const belowBenchmark = validComparisons.filter(
            item => item.performanceStatus === "BELOW_BENCHMARK"
        ).length;

        let classification = "INSUFFICIENT_DATA";

        if (validComparisons.length > 0) {
            const percentageAbove =
                (aboveBenchmark / validComparisons.length) * 100;

            if (percentageAbove >= 70) {
                classification = "HIGH_PERFORMANCE";
            } else if (percentageAbove >= 50) {
                classification = "COMPETITIVE";
            } else if (percentageAbove >= 30) {
                classification = "DEVELOPMENTAL";
            } else {
                classification = "BELOW_COMPETITIVE_BENCHMARK";
            }
        }

        res.status(200).json({
            success: true,

            assessment: {
                id: assessment._id,
                date: assessment.assessmentDate,
                verificationStatus: assessment.verificationStatus
            },

            athlete: {
                id: athlete?._id,
                name: athlete?.name || athlete?.fullName,
                position,
                ageGroup,
                gender
            },

            summary: {
                totalMetrics: validComparisons.length,
                aboveBenchmark,
                withinRange,
                belowBenchmark,
                classification
            },

            comparisons
        });

    } catch (error) {
        console.error(
            "Benchmark comparison error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to generate benchmark comparison",
            error: error.message
        });
    }
};


module.exports = {
    getAssessmentBenchmarkComparison
};