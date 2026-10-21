const Benchmark = require("../models/Benchmark");

/**
 * Compare one athlete metric against the appropriate benchmark.
 */
const compareWithBenchmark = async (metric, athleteValue, options = {}) => {
    try {
        if (
            athleteValue === undefined ||
            athleteValue === null ||
            athleteValue === ""
        ) {
            return {
                available: false,
                reason: "No athlete value provided"
            };
        }

        const value = Number(athleteValue);

        if (Number.isNaN(value)) {
            return {
                available: false,
                reason: "Athlete value is not numeric"
            };
        }

        /*
         * Find the most relevant active benchmark.
         *
         * We first try to match:
         * metric + position + ageGroup + gender
         *
         * If those are not available, we fall back to ALL.
         */

        const position = options.position || "ALL";
        const ageGroup = options.ageGroup || "ALL";
        const gender = options.gender || "ALL";

        let benchmark = await Benchmark.findOne({
            metric,
            status: "ACTIVE",
            position,
            ageGroup,
            gender
        });

        // Fallback to general benchmark
        if (!benchmark) {
            benchmark = await Benchmark.findOne({
                metric,
                status: "ACTIVE",
                position: "ALL",
                ageGroup: "ALL",
                gender: "ALL"
            });
        }

        if (!benchmark) {
            return {
                available: false,
                metric,
                athleteValue: value,
                reason: `No active benchmark found for ${metric}`
            };
        }

        const benchmarkValue = benchmark.benchmarkValue;

        const lowerIsBetter = benchmark.lowerIsBetter;

        /*
         * Calculate deviation.
         */

        const deviation =
            ((value - benchmarkValue) / benchmarkValue) * 100;

        /*
         * Determine whether athlete is inside
         * the acceptable benchmark range.
         */

        let withinAcceptableRange = true;

        if (
            benchmark.acceptableRangeMin !== undefined &&
            benchmark.acceptableRangeMin !== null &&
            value < benchmark.acceptableRangeMin
        ) {
            withinAcceptableRange = false;
        }

        if (
            benchmark.acceptableRangeMax !== undefined &&
            benchmark.acceptableRangeMax !== null &&
            value > benchmark.acceptableRangeMax
        ) {
            withinAcceptableRange = false;
        }

        /*
         * Performance ratio.
         *
         * If lower is better:
         * benchmark / athlete
         *
         * If higher is better:
         * athlete / benchmark
         */

        let performanceRatio;

        if (lowerIsBetter) {
            performanceRatio = benchmarkValue / value;
        } else {
            performanceRatio = value / benchmarkValue;
        }

        /*
         * Performance classification.
         */

        let performanceLevel;

        if (performanceRatio >= 1.10) {
            performanceLevel = "ELITE";
        } else if (performanceRatio >= 0.95) {
            performanceLevel = "ADVANCED";
        } else if (performanceRatio >= 0.75) {
            performanceLevel = "DEVELOPING";
        } else {
            performanceLevel = "BEGINNER";
        }

        /*
         * Detect suspiciously extreme values.
         *
         * This DOES NOT automatically mean fraud.
         * It means human review is required.
         */

        let anomaly = false;
        let anomalyReason = null;

        if (lowerIsBetter) {
            if (value < benchmarkValue * 0.70) {
                anomaly = true;

                anomalyReason =
                    "Result is significantly better than the benchmark and requires verification.";
            }
        } else {
            if (value > benchmarkValue * 1.40) {
                anomaly = true;

                anomalyReason =
                    "Result is significantly above the benchmark and requires verification.";
            }
        }

        /*
         * Determine validation status.
         */

        let validationStatus;

        if (anomaly) {
            validationStatus = "NEEDS_REVIEW";
        } else if (!withinAcceptableRange) {
            validationStatus = "NEEDS_REVIEW";
        } else {
            validationStatus = "WITHIN_EXPECTED_RANGE";
        }

        return {
            available: true,

            metric,

            athleteValue: value,

            benchmarkValue,

            unit: benchmark.unit,

            deviationPercentage:
                Number(deviation.toFixed(2)),

            performanceLevel,

            withinAcceptableRange,

            validationStatus,

            anomaly,

            anomalyReason,

            benchmarkDetails: {
                category: benchmark.category,
                position: benchmark.position,
                ageGroup: benchmark.ageGroup,
                gender: benchmark.gender,
                level: benchmark.level,
                lowerIsBetter: benchmark.lowerIsBetter,
                acceptableRangeMin:
                    benchmark.acceptableRangeMin,
                acceptableRangeMax:
                    benchmark.acceptableRangeMax
            },

            researchReference: {
                sourceType: benchmark.sourceType,
                sourceName: benchmark.sourceName,
                sourceReference: benchmark.sourceReference,
                testProtocol: benchmark.testProtocol,
                version: benchmark.version
            }
        };

    } catch (error) {
        console.error(
            "Benchmark comparison error:",
            error.message
        );

        return {
            available: false,
            reason: "Benchmark comparison failed"
        };
    }
};


module.exports = {
    compareWithBenchmark
};