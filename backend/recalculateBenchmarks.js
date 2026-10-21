const mongoose = require("mongoose");
require("dotenv").config();

const Assessment = require("./src/models/Assessment");
const {
    validateAssessment
} = require("./src/services/benchmarkEngine");

async function recalculateBenchmarks() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        const assessments = await Assessment.find({});

        console.log(
            `Found ${assessments.length} assessments`
        );

        let updated = 0;

        for (const assessment of assessments) {
            try {
                const validation =
                    await validateAssessment(assessment);

                assessment.benchmarkValidation =
                    validation;

                await assessment.save();

                updated++;

                console.log(
                    `✅ Updated assessment: ${assessment._id}`
                );

                console.log({
                    performanceIndex:
                        validation.overallPerformanceIndex,

                    performanceLevel:
                        validation.overallPerformanceLevel,

                    coverage:
                        validation.benchmarkCoverage,

                    metricsChecked:
                        validation.metricsChecked,

                    benchmarksFound:
                        validation.metricsWithBenchmark,

                    anomalies:
                        validation.anomaliesDetected
                });

            } catch (error) {
                console.error(
                    `❌ Failed assessment ${assessment._id}:`,
                    error.message
                );
            }
        }

        console.log(
            `\n✅ Recalculation completed`
        );

        console.log(
            `Updated ${updated} of ${assessments.length} assessments`
        );

        await mongoose.connection.close();

        console.log(
            "MongoDB connection closed"
        );

    } catch (error) {
        console.error(
            "Benchmark recalculation error:",
            error
        );

        process.exit(1);
    }
}

recalculateBenchmarks();