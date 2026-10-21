const Benchmark = require("../models/Benchmark");

/*
 * Compare one assessment against the benchmark database.
 *
 * For lowerIsBetter metrics:
 *   lower actual value = better performance
 *
 * For higherIsBetter metrics:
 *   higher actual value = better performance
 */

const validateAssessmentAgainstBenchmarks = async (assessment) => {
    const results = {};

    let metricsChecked = 0;
    let metricsWithBenchmark = 0;
    let anomaliesDetected = 0;

    for (const metric of benchmarkMetrics) {
        const assessmentMetric = assessment[metric];

        // No value recorded for this metric
        if (
            !assessmentMetric ||
            assessmentMetric.score === undefined &&
            assessmentMetric.result === undefined
        ) {
            continue;
        }

        metricsChecked++;

        const benchmark = await Benchmark.findOne({
            metric,
            status: "ACTIVE"
        }).sort({ createdAt: -1 });

        if (!benchmark) {
            results[metric] = {
                status: "NO_BENCHMARK",
                message: "No benchmark available"
            };

            continue;
        }

        metricsWithBenchmark++;

        // Prefer numeric score when available.
        // Otherwise try to convert result to a number.
        let actualValue = assessmentMetric.score;

        if (
            actualValue === undefined ||
            actualValue === null ||
            Number.isNaN(Number(actualValue))
        ) {
            actualValue = parseFloat(
                String(assessmentMetric.result || "")
                    .replace(/[^\d.-]/g, "")
            );
        }

        if (
            actualValue === undefined ||
            actualValue === null ||
            Number.isNaN(Number(actualValue))
        ) {
            results[metric] = {
                status: "INVALID_VALUE",
                benchmark: benchmark.benchmarkValue
            };

            anomaliesDetected++;
            continue;
        }

        actualValue = Number(actualValue);

        const benchmarkValue = Number(
            benchmark.benchmarkValue
        );

        let percentage;

        if (benchmark.lowerIsBetter) {
            percentage =
                (benchmarkValue / actualValue) * 100;
        } else {
            percentage =
                (actualValue / benchmarkValue) * 100;
        }

        let status = "PASS";

        if (percentage < 85) {
            status = "NEEDS_REVIEW";
            anomaliesDetected++;
        }

        results[metric] = {
            status,
            actualValue,
            benchmarkValue,
            percentage: Number(percentage.toFixed(2)),
            unit: benchmark.unit,
            lowerIsBetter: benchmark.lowerIsBetter,
            sourceType: benchmark.sourceType,
            sourceName: benchmark.sourceName,
            sourceReference: benchmark.sourceReference || null
        };
    }

    const benchmarkCoverage =
        metricsChecked === 0
            ? 0
            : Number(
                (
                    (metricsWithBenchmark / metricsChecked) *
                    100
                ).toFixed(2)
            );

    let overallStatus = "NOT_CHECKED";

    if (metricsChecked > 0) {
        overallStatus =
            anomaliesDetected > 0
                ? "NEEDS_REVIEW"
                : "PASS";
    }

    return {
        overallStatus,
        benchmarkCoverage,
        metricsChecked,
        metricsWithBenchmark,
        anomaliesDetected,
        results,
        generatedAt: new Date()
    };
};

module.exports = {
    validateAssessmentAgainstBenchmarks
};