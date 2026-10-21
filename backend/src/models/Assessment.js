const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
    {
        athleteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Athlete",
            required: true
        },

        assessmentDate: {
            type: Date,
            required: true
        },

        // ================================
        // DATA VERIFICATION INFORMATION
        // ================================

        verificationStatus: {
            type: String,
            enum: [
                "PENDING",
                "UNDER_REVIEW",
                "VERIFIED",
                "REJECTED",
                "NEEDS_REVIEW"
            ],
            default: "PENDING"
        },

        recordedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        dataSource: {
            type: String,
            enum: [
                "COACH_ENTRY",
                "SUPERVISED_TEST",
                "OFFICIAL_RECORD",
                "ATHLETE_SELF_REPORTED",
                "OTHER"
            ],
            default: "COACH_ENTRY"
        },

        testProtocol: {
            type: String,
            trim: true,
            default: ""
        },

        evidenceDocument: {
            type: String,
            trim: true,
            default: ""
        },

        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        reviewedAt: {
            type: Date,
            default: null
        },

        reviewNotes: {
            type: String,
            trim: true,
            default: ""
        },

        // ================================
        // PHYSICAL PERFORMANCE
        // ================================

        lowerBodyStrength: {
            result: String,
            score: Number
        },

        coreStrength: {
            result: String,
            score: Number
        },

        sprint20m: {
            result: String,
            score: Number
        },

        sprint50m: {
            result: String,
            score: Number
        },

        agility505: {
            result: String,
            score: Number
        },

        verticalJump: {
            result: String,
            score: Number
        },

        aerobicCapacity: {
            result: String,
            score: Number
        },

        
        flexibility: {
            result: String,
            score: Number
        },

        mobility: {
            result: String,
            score: Number
        },


        // ================================
        // TECHNICAL SKILLS
        // ================================

        firstTouch: {
            result: String,
            score: Number
        },

        shortPassing: {
            result: String,
            score: Number
        },

        longPassing: {
            result: String,
            score: Number
        },

        shootingPower: {
            result: String,
            score: Number
        },

        shootingAccuracy: {
            result: String,
            score: Number
        },

        dribbling: {
            result: String,
            score: Number
        },

        crossing: {
            result: String,
            score: Number
        },

        heading: {
            result: String,
            score: Number
        },

        tackling: {
            result: String,
            score: Number
        },

        // ================================
        // FOOT SKILLS
        // ================================

        rightFootPower: {
            result: String,
            score: Number
        },

        rightFootPassing: {
            result: String,
            score: Number
        },

        rightFootControl: {
            result: String,
            score: Number
        },

        leftFootPower: {
            result: String,
            score: Number
        },

        leftFootPassing: {
            result: String,
            score: Number
        },

        leftFootControl: {
            result: String,
            score: Number
        },

        weakFootUsage: {
            result: String,
            score: Number
        },

        // ================================
        // COGNITIVE / TACTICAL SKILLS
        // ================================

        offBallMovement: {
            result: String,
            score: Number
        },

        decisionMaking: {
            result: String,
            score: Number
        },

        positionalDiscipline: {
            result: String,
            score: Number
        },

        criticalThinking: {
            result: String,
            score: Number
        },

        // ================================
        // MATCH / PHYSICAL LOAD METRICS
        // ================================

        hsrDistance: {
            result: String,
            score: Number
        },

        sprintCount1H: {
            result: String,
            score: Number
        },

        sprintCount2H: {
            result: String,
            score: Number
        },

        hrRecovery: {
            result: String,
            score: Number
        },

        // ================================
        // BENCHMARK VALIDATION
        // ================================

         benchmarkValidation: {
            overallStatus: {
                type: String,
                enum: [
                    "NOT_CHECKED",
                    "PASS",
                    "NEEDS_REVIEW"
                ],
                default: "NOT_CHECKED"
            },

            overallPerformanceIndex: {
                type: Number,
                default: null
            },

            overallPerformanceLevel: {
                type: String,
                default: "UNKNOWN"
            },

            benchmarkCoverage: {
                type: Number,
                default: 0
            },

            metricsChecked: {
                type: Number,
                default: 0
            },

            metricsWithBenchmark: {
                type: Number,
                default: 0
            },

            anomaliesDetected: {
                type: Number,
                default: 0
            },

            results: {
                type: mongoose.Schema.Types.Mixed,
                default: {}
            },

            generatedAt: {
                type: Date,
                default: null
            }
        },

        // ================================
        // NOTES
        // ================================

        injuryNotes: {
            type: String,
            trim: true
        },

        coachNotes: {
            type: String,
            trim: true
        },

        nutritionNotes: {
            type: String,
            trim: true
        }
    },

    {
        timestamps: true
    }
);

const Assessment = mongoose.model(
    "Assessment",
    assessmentSchema
);

module.exports = Assessment;