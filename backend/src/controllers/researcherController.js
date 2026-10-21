const mongoose = require("mongoose");
const Athlete = require("../models/Athlete");
const EligibilityCriteria = require("../models/EligibilityCriteria");
const AthleteEligibility = require("../models/AthleteEligibility");
const EligibilityReviewHistory = require("../models/EligibilityReviewHistory");

// ==========================================
// CREATE ELIGIBILITY CRITERIA
// Researcher / Admin
// ==========================================

const createEligibilityCriteria = async (req, res) => {
    try {
        const criteria = await EligibilityCriteria.create({
            ...req.body,
            createdBy: req.user.id || req.user._id
        });

        res.status(201).json({
            success: true,
            message: "Eligibility criteria created successfully",
            data: criteria
        });

    } catch (error) {
        console.error(
            "Create eligibility criteria error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to create eligibility criteria",
            error: error.message
        });
    }
};


// ==========================================
// GET ACTIVE ELIGIBILITY CRITERIA
// Researcher / Admin
// ==========================================

const getEligibilityCriteria = async (req, res) => {
    try {
        const criteria = await EligibilityCriteria.find({
            status: "ACTIVE"
        })
        .sort({
            createdAt: -1
        });

        res.status(200).json({
            success: true,
            count: criteria.length,
            data: criteria
        });

    } catch (error) {
        console.error(
            "Get eligibility criteria error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch eligibility criteria",
            error: error.message
        });
    }
};


// ==========================================
// GET ALL ATHLETES FOR RESEARCH REVIEW
// Researcher / Admin
// ==========================================


const getResearchAthletes = async (req, res) => {
    try {
        const athletes = await Athlete.find({
            isActive: true
        })
            .sort({ name: 1 })
            .lean();

        const athleteIds = athletes.map((athlete) => athlete._id);

        const reviews = await AthleteEligibility.find({
            athleteId: { $in: athleteIds }
        })
            .populate("criteriaId")
            .populate("reviewedBy", "name email role")
            .sort({ updatedAt: -1 })
            .lean();

        const latestReviewByAthlete = new Map();

        for (const review of reviews) {
            const athleteId = String(review.athleteId);

            if (!latestReviewByAthlete.has(athleteId)) {
                latestReviewByAthlete.set(athleteId, review);
            }
        }

        const results = athletes.map((athlete) => ({
            ...athlete,
            eligibility:
                latestReviewByAthlete.get(String(athlete._id)) || null
        }));

        return res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });
    } catch (error) {
        console.error("Get research athletes error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch athletes",
            error: error.message
        });
    }
};



// ==========================================
// CREATE / UPDATE ATHLETE ELIGIBILITY REVIEW
// Researcher
// ==========================================


const reviewAthleteEligibility = async (req, res) => {
    try {
        const { athleteId, criteriaId } = req.body;

        if (!athleteId || !criteriaId) {
            return res.status(400).json({
                success: false,
                message: "Athlete ID and criteria ID are required"
            });
        }

        const athlete = await Athlete.findById(athleteId);

        if (!athlete) {
            return res.status(404).json({
                success: false,
                message: "Athlete not found"
            });
        }

        const criteria = await EligibilityCriteria.findById(criteriaId);

        if (!criteria || criteria.status !== "ACTIVE") {
            return res.status(404).json({
                success: false,
                message: "Active eligibility criteria not found"
            });
        }

        const previousReview = await AthleteEligibility.findOne({
            athleteId,
            criteriaId
        });

        const input = req.body;
        const previous = previousReview || {};

        const actualQualificationLevel = String(
            input.actualQualificationLevel ??
            previous.actualQualificationLevel ??
            "UNKNOWN"
        ).toUpperCase();

        const qualificationRanks = {
            NONE: 0,
            LOCAL: 1,
            DISTRICT: 2,
            STATE: 3,
            NATIONAL: 4,
            INTERNATIONAL: 5
        };

        const reasons = [];
        const missing = [];
        let failed = false;

        // 1. Qualification check
        if (
            actualQualificationLevel === "UNKNOWN" ||
            qualificationRanks[actualQualificationLevel] === undefined
        ) {
            missing.push("Qualification level is not recorded");
        } else if (
            qualificationRanks[actualQualificationLevel] <
            qualificationRanks[criteria.minimumQualificationLevel]
        ) {
            failed = true;
            reasons.push(
                `Qualification is below the required ${criteria.minimumQualificationLevel} level`
            );
        }

        // 2. Age check
        const age = athlete.age;
        let ageEligible = null;

        if (
            criteria.minimumAge != null ||
            criteria.maximumAge != null
        ) {
            if (age == null || age === "") {
                missing.push("Athlete age is not recorded");
            } else {
                ageEligible =
                    (criteria.minimumAge == null ||
                        age >= criteria.minimumAge) &&
                    (criteria.maximumAge == null ||
                        age <= criteria.maximumAge);

                if (!ageEligible) {
                    failed = true;
                    reasons.push("Athlete does not meet the age requirement");
                }
            }
        } else {
            ageEligible = true;
        }

        // 3. Certificate check
        const certificatesVerified =
            input.certificatesVerified ??
            previous.certificatesVerified ??
            null;

        if (criteria.certificateRequired) {
            if (certificatesVerified === null) {
                missing.push("Certificate verification is pending");
            } else if (certificatesVerified === false) {
                failed = true;
                reasons.push("Required certificate is not verified");
            }
        }

        // 4. Document check
        const documentsComplete =
            input.documentsComplete ??
            previous.documentsComplete ??
            null;

        if (criteria.documentsRequired) {
            if (documentsComplete === null) {
                missing.push("Document verification is pending");
            } else if (documentsComplete === false) {
                failed = true;
                reasons.push("Required documents are incomplete");
            }
        }

        // 5. Performance check
        const performanceScore =
            input.performanceScore ??
            previous.performanceScore ??
            null;

        let performanceReviewed =
            input.performanceReviewed ??
            previous.performanceReviewed ??
            false;

        if (criteria.performanceThresholdEnabled) {
            if (
                performanceScore === null ||
                performanceScore === "" ||
                !Number.isFinite(Number(performanceScore))
            ) {
                missing.push("Performance score is not recorded");
            } else if (Number(performanceScore) < criteria.minimumPerformanceScore) {
                failed = true;
                reasons.push("Performance score is below the required threshold");
                performanceReviewed = true;
            } else {
                performanceReviewed = true;
            }
        }

        // A confirmed failure takes priority over missing information.
        let status;

        if (failed) {
            status = "NOT_ELIGIBLE";
        } else if (missing.length > 0) {
            status = "INSUFFICIENT_DATA";
        } else {
            status = "ELIGIBLE";
        }

        const reason = [...reasons, ...missing].join("; ") ||
            "All configured eligibility requirements are satisfied";

        const eligibility = await AthleteEligibility.findOneAndUpdate(
            { athleteId, criteriaId },
            {
                athleteId,
                criteriaId,
                actualQualificationLevel,
                ageEligible,
                certificatesVerified,
                documentsComplete,
                performanceReviewed,
                performanceScore:
                    performanceScore == null || performanceScore === ""
                        ? null
                        : Number(performanceScore),
                status,
                reason,
                researcherRemarks:
                    input.researcherRemarks ??
                    previous.researcherRemarks ??
                    "",
                reviewedBy: req.user.id || req.user._id,
                reviewedAt: new Date()
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );

        
await EligibilityReviewHistory.create({
    athleteId: eligibility.athleteId,
    criteriaId: eligibility.criteriaId,
    eligibilityId: eligibility._id,
    actualQualificationLevel: eligibility.actualQualificationLevel,
    ageEligible: eligibility.ageEligible,
    certificatesVerified: eligibility.certificatesVerified,
    documentsComplete: eligibility.documentsComplete,
    performanceReviewed: eligibility.performanceReviewed,
    performanceScore: eligibility.performanceScore,
    status: eligibility.status,
    reason: eligibility.reason,
    researcherRemarks: eligibility.researcherRemarks,
    reviewedBy: eligibility.reviewedBy,
    reviewedAt: eligibility.reviewedAt || new Date()
});


        return res.status(200).json({
            success: true,
            message: "Athlete eligibility evaluated and saved successfully",
            data: eligibility
        });

    } catch (error) {
        console.error(
            "Review athlete eligibility error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to evaluate athlete eligibility",
            error: error.message
        });
    }
};


// ==========================================
// GET ATHLETE ELIGIBILITY REVIEW
// Researcher / Admin
// ==========================================

const getAthleteEligibility = async (req, res) => {
    try {
        const eligibility =
            await AthleteEligibility.find({
                athleteId: req.params.athleteId
            })
            .populate(
                "criteriaId"
            )
            .populate(
                "reviewedBy",
                "name email role"
            )
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            success: true,
            count: eligibility.length,
            data: eligibility
        });

    } catch (error) {
        console.error(
            "Get athlete eligibility error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch athlete eligibility",
            error: error.message
        });
    }
};


// ==========================================
// RESEARCHER DASHBOARD SUMMARY
// Researcher / Admin
// ==========================================

const getResearcherDashboard = async (req, res) => {
    try {
        const [
            totalAthletes,
            totalReviews,
            eligible,
            eligibleWithReview,
            notEligible,
            insufficientData
        ] = await Promise.all([
            Athlete.countDocuments({
                isActive: true
            }),

            AthleteEligibility.countDocuments(),

            AthleteEligibility.countDocuments({
                status: "ELIGIBLE"
            }),

            AthleteEligibility.countDocuments({
                status: "ELIGIBLE_WITH_REVIEW"
            }),

            AthleteEligibility.countDocuments({
                status: "NOT_ELIGIBLE"
            }),

            AthleteEligibility.countDocuments({
                status: "INSUFFICIENT_DATA"
            })
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalAthletes,
                totalReviews,
                eligible,
                eligibleWithReview,
                notEligible,
                insufficientData
            }
        });

    } catch (error) {
        console.error(
            "Researcher dashboard error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to load researcher dashboard",
            error: error.message
        });
    }
};


const getEligibilityReviewHistory = async (req, res) => {
    try {
        const { athleteId } = req.params;

        if (!athleteId || !mongoose.isValidObjectId(athleteId)) {
            return res.status(400).json({
                success: false,
                message: "A valid athlete ID is required"
            });
        }

        const history = await EligibilityReviewHistory.find({
            athleteId
        })
            .populate("criteriaId", "name minimumQualificationLevel")
            .populate("reviewedBy", "name email")
            .sort({ reviewedAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (error) {
        console.error("Get eligibility history error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve eligibility review history"
        });
    }
};


module.exports = {
    createEligibilityCriteria,
    getEligibilityCriteria,
    getResearchAthletes,
    reviewAthleteEligibility,
    getAthleteEligibility,
    getResearcherDashboard,
    getEligibilityReviewHistory
};