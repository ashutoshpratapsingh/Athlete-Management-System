const Benchmark = require("../models/Benchmark");

/**
 * Metrics that should be checked against benchmarks.
 *
 * For physical measurement metrics:
 *     result = actual measured value
 *
 * For coach-rated skill metrics:
 *     score = normalized 0-10 score
 */

const BENCHMARK_METRICS = [
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


/**
 * Metrics where the actual measured RESULT
 * should be compared against the benchmark.
 *
 * Examples:
 * 20m Sprint = 3.8 seconds
 * 50m Sprint = 7.8 seconds
 * Vertical Jump = 48 cm
 * 505 Agility = 2.8 seconds
 */
const RESULT_BASED_METRICS = [];


/**
 * Extract the correct numeric value from an assessment metric.
 *
 * IMPORTANT:
 *
 * Physical metrics:
 *     use result
 *
 * Coach-rated metrics:
 *     use score
 */

function extractValue(metric, metricData) {

    if (!metricData) {
        return null;
    }

    // ==========================================
    // PHYSICAL / MEASURED METRICS
    // ==========================================

    if (RESULT_BASED_METRICS.includes(metric)) {

        if (
            metricData.result !== undefined &&
            metricData.result !== null &&
            metricData.result !== ""
        ) {

            const rawResult =
                String(metricData.result).trim();

            // If the stored value is a normalized
            // percentage such as "76/100", return
            // the normalized score as 76.
            //
            // NOTE:
            // This is still a normalized score, not
            // an actual physical measurement.
            const fractionMatch =
                rawResult.match(
                    /^\s*(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/
                );

            if (fractionMatch) {

                const numerator =
                    Number(fractionMatch[1]);

                const denominator =
                    Number(fractionMatch[2]);

                if (
                    Number.isFinite(numerator) &&
                    Number.isFinite(denominator) &&
                    denominator !== 0
                ) {
                    return numerator;
                }
            }

            // Normal physical measurement such as:
            // "3.8"
            // "3.8 seconds"
            // "48 cm"
            // "2.8 seconds"

            const numberMatch =
                rawResult.match(
                    /-?\d+(?:\.\d+)?/
                );

            if (numberMatch) {

                const numericValue =
                    Number(numberMatch[0]);

                if (Number.isFinite(numericValue)) {
                    return numericValue;
                }
            }
        }

        return null;
    }

    // ==========================================
    // COACH-RATED SKILL METRICS
    // ==========================================

    if (
        metricData.score !== undefined &&
        metricData.score !== null &&
        metricData.score !== ""
    ) {

        let numericScore =
            Number(metricData.score);

        if (!Number.isFinite(numericScore)) {
            return null;
        }

        /*
         * Assessment scores are stored on a 0–100 scale.
         * Benchmarks for coach-rated metrics are defined
         * on a 0–10 scale.
         *
         * Convert:
         *
         * 91 → 9.1
         * 94 → 9.4
         * 75 → 7.5
         *
         * This keeps both sides on the same scale.
         */

        if (numericScore > 10) {
            numericScore =
                numericScore / 10;
        }

        return numericScore;
    }

    return null;
}


/**
 * Calculate performance level from Performance Index.
 */
function getPerformanceLevel(performanceIndex) {

    if (
        performanceIndex === null ||
        performanceIndex === undefined
    ) {
        return "UNKNOWN";
    }

    if (performanceIndex >= 110) {
        return "ELITE";
    }

    if (performanceIndex >= 100) {
        return "ABOVE_BENCHMARK";
    }

    if (performanceIndex >= 90) {
        return "NEAR_BENCHMARK";
    }

    if (performanceIndex >= 75) {
        return "DEVELOPING";
    }

    return "BELOW_BENCHMARK";
}


/**
 * Compare athlete value against benchmark.
 */
function evaluateMetric(
    athleteValue,
    benchmark
) {

    if (athleteValue === null) {

        return {
            status: "NOT_AVAILABLE",

            athleteValue: null,

            benchmarkValue:
                benchmark.benchmarkValue,

            difference: null,

            percentageDifference: null,

            performanceIndex: null,

            performanceLevel: "UNKNOWN",

            unit: benchmark.unit,

            lowerIsBetter:
                benchmark.lowerIsBetter,

            message:
                "No measurable value available"
        };
    }


    const benchmarkValue =
        Number(benchmark.benchmarkValue);


    // ==========================================
    // DIFFERENCE
    // ==========================================

    const difference =
        athleteValue - benchmarkValue;


    // ==========================================
    // PERCENTAGE DIFFERENCE
    // ==========================================

    const percentageDifference =
        benchmarkValue !== 0
            ? Number(
                (
                    (difference /
                        benchmarkValue) *
                    100
                ).toFixed(2)
            )
            : 0;


    // ==========================================
    // PERFORMANCE INDEX
    //
    // 100 = exactly benchmark
    // >100 = better
    // <100 = below benchmark
    // ==========================================

    let performanceIndex;


    if (benchmark.lowerIsBetter) {

        /*
         * Example:
         *
         * Benchmark = 3.50 sec
         * Athlete = 3.80 sec
         *
         * 3.50 / 3.80 × 100
         * = 92.11
         */

        performanceIndex =
            athleteValue > 0
                ? Number(
                    (
                        (benchmarkValue /
                            athleteValue) *
                        100
                    ).toFixed(2)
                )
                : 0;

    } else {

        /*
         * Example:
         *
         * Benchmark = 7
         * Athlete = 8
         *
         * 8 / 7 × 100
         * = 114.29
         */

        performanceIndex =
            benchmarkValue !== 0
                ? Number(
                    (
                        (athleteValue /
                            benchmarkValue) *
                        100
                    ).toFixed(2)
                )
                : 0;
    }


    const performanceLevel =
        getPerformanceLevel(
            performanceIndex
        );


    // ==========================================
    // PASS / NEEDS REVIEW
    // ==========================================

    let passed;

    if (benchmark.lowerIsBetter) {

        passed =
            athleteValue <= benchmarkValue;

    } else {

        passed =
            athleteValue >= benchmarkValue;
    }


    return {

        status:
            passed
                ? "PASS"
                : "NEEDS_REVIEW",

        athleteValue,

        benchmarkValue,

        difference:
            Number(
                difference.toFixed(2)
            ),

        percentageDifference,

        performanceIndex,

        performanceLevel,

        unit:
            benchmark.unit,

        lowerIsBetter:
            benchmark.lowerIsBetter,

        source: {

            type:
                benchmark.sourceType,

            name:
                benchmark.sourceName,

            reference:
                benchmark.sourceReference ||
                null
        },

        message:
            passed
                ? "Athlete meets or exceeds benchmark"
                : "Athlete is below benchmark"
    };
}


/**
 * MAIN BENCHMARK VALIDATION ENGINE
 */
const validateAssessment = async (
    assessment
) => {

    const results = {};

    let metricsChecked = 0;

    let metricsWithBenchmark = 0;

    let anomaliesDetected = 0;

    const performanceIndexes = [];


    // ==========================================
    // CHECK EACH BENCHMARK METRIC
    // ==========================================

    for (
        const metric of BENCHMARK_METRICS
    ) {

        const metricData =
            assessment[metric];


        const athleteValue =
            extractValue(
                metric,
                metricData
            );


        // No usable value
        if (athleteValue === null) {
            continue;
        }


        metricsChecked++;


        // ======================================
        // FIND ACTIVE BENCHMARK
        // ======================================

        const benchmark =
            await Benchmark.findOne({

                metric,

                status: "ACTIVE"

            }).sort({

                createdAt: -1

            });


        if (!benchmark) {

            results[metric] = {

                status:
                    "NO_BENCHMARK",

                athleteValue
            };

            continue;
        }


        metricsWithBenchmark++;


        // ======================================
        // EVALUATE
        // ======================================

        const evaluation =
            evaluateMetric(
                athleteValue,
                benchmark
            );


        results[metric] =
            evaluation;


        // ======================================
        // COLLECT PERFORMANCE INDEX
        // ======================================

        if (
            evaluation.performanceIndex !== null &&
            evaluation.performanceIndex !== undefined &&
            Number.isFinite(
                evaluation.performanceIndex
            )
        ) {

            performanceIndexes.push(
                evaluation.performanceIndex
            );
        }


        // ======================================
        // ANOMALY
        // ======================================

        if (
            evaluation.status ===
            "NEEDS_REVIEW"
        ) {

            anomaliesDetected++;
        }
    }


    // ==========================================
    // OVERALL STATUS
    // ==========================================

    let overallStatus =
        "NOT_CHECKED";


    if (metricsChecked > 0) {

        overallStatus =
            anomaliesDetected > 0
                ? "NEEDS_REVIEW"
                : "PASS";
    }


    // ==========================================
    // BENCHMARK COVERAGE
    // ==========================================

    const benchmarkCoverage =
        metricsChecked > 0

            ? Number(

                (
                    (
                        metricsWithBenchmark /
                        metricsChecked
                    ) *
                    100

                ).toFixed(2)

            )

            : 0;


    // ==========================================
    // OVERALL PERFORMANCE INDEX
    // ==========================================

    const overallPerformanceIndex =
        performanceIndexes.length > 0

            ? Number(

                (
                    performanceIndexes.reduce(
                        (
                            sum,
                            value
                        ) =>
                            sum + value,

                        0
                    )

                    /
                    performanceIndexes.length

                ).toFixed(2)

            )

            : null;


    // ==========================================
    // OVERALL PERFORMANCE LEVEL
    // ==========================================

    const overallPerformanceLevel =
        getPerformanceLevel(
            overallPerformanceIndex
        );


    // ==========================================
    // RETURN VALIDATION RESULT
    // ==========================================

    return {

        overallStatus,

        overallPerformanceIndex,

        overallPerformanceLevel,

        benchmarkCoverage,

        metricsChecked,

        metricsWithBenchmark,

        anomaliesDetected,

        results,

        generatedAt:
            new Date()
    };
};


module.exports = {
    validateAssessment
};