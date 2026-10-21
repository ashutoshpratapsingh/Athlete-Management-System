
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./src/config/database");
const AthleteEligibility = require("./src/models/AthleteEligibility");
const EligibilityReviewHistory = require("./src/models/EligibilityReviewHistory");

async function migrateEligibilityHistory() {
    try {
        await connectDB();

        const records = await AthleteEligibility.find({}).lean();

        let migrated = 0;
        let skipped = 0;

        for (const record of records) {
            // Avoid copying the same current review more than once.
            const existing = await EligibilityReviewHistory.findOne({
                eligibilityId: record._id
            }).lean();

            if (existing) {
                skipped++;
                continue;
            }

            await EligibilityReviewHistory.create({
                athleteId: record.athleteId,
                criteriaId: record.criteriaId,
                eligibilityId: record._id,
                actualQualificationLevel:
                    record.actualQualificationLevel || "UNKNOWN",
                ageEligible: record.ageEligible ?? null,
                certificatesVerified:
                    record.certificatesVerified ?? null,
                documentsComplete: record.documentsComplete ?? null,
                performanceReviewed:
                    record.performanceReviewed ?? false,
                performanceScore: record.performanceScore ?? null,
                status: record.status || "INSUFFICIENT_DATA",
                reason: record.reason || "",
                researcherRemarks: record.researcherRemarks || "",
                reviewedBy: record.reviewedBy ?? null,
                reviewedAt: record.reviewedAt || record.updatedAt || new Date()
            });

            migrated++;
        }

        console.log("Eligibility history migration completed.");
        console.log("Migrated:", migrated);
        console.log("Skipped existing snapshots:", skipped);
    } catch (error) {
        console.error("Migration failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

migrateEligibilityHistory();