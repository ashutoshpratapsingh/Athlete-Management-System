const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

const connectDB = require("./src/config/database");

const Athlete = require("./src/models/Athlete");
const Assessment = require("./src/models/Assessment");
const MatchPerformance = require("./src/models/MatchPerformance");
const TrainingPerformance = require("./src/models/TrainingPerformance");
const InjuryRecord = require("./src/models/InjuryRecord");
const CoachEvaluation = require("./src/models/CoachEvaluation");
const User = require("./src/models/User");


// ========================================
// Helper
// ========================================

const score = (value) => ({
    result: `${value}/100`,
    score: value
});


// ========================================
// Seed Database
// ========================================

const seedDatabase = async () => {

    try {

        await connectDB();

        console.log("Clearing existing development data...");


        // --------------------------------
        // Clear collections
        // --------------------------------

        await Athlete.deleteMany({});
        await Assessment.deleteMany({});
        await MatchPerformance.deleteMany({});
        await TrainingPerformance.deleteMany({});
        await InjuryRecord.deleteMany({});
        await CoachEvaluation.deleteMany({});
        await User.deleteMany({});


        console.log("Existing development data cleared.");


        // ========================================
        // Create Athletes
        // ========================================

        const athletes = await Athlete.insertMany([

            {
                externalId: "DEV-001",
                name: "Kian Osei",
                age: 22,
                position: "CM",
                club: "AMS Development FC",
                bloodGroup: "O+",
                assessmentDate: new Date("2026-08-20"),
                bestPosition: "CM",
                secondaryPositions: ["AM", "FB"],
                isActive: true
            },

            {
                externalId: "DEV-002",
                name: "Marcus Webb",
                age: 24,
                position: "ST",
                club: "AMS Development FC",
                bloodGroup: "A+",
                assessmentDate: new Date("2026-08-21"),
                bestPosition: "ST",
                secondaryPositions: ["Winger", "AM"],
                isActive: true
            },

            {
                externalId: "DEV-003",
                name: "Priya Nandan",
                age: 21,
                position: "Winger",
                club: "AMS Development FC",
                bloodGroup: "B+",
                assessmentDate: new Date("2026-08-22"),
                bestPosition: "Winger",
                secondaryPositions: ["AM", "ST"],
                isActive: true
            },

            {
                externalId: "DEV-004",
                name: "Daniel Okoro",
                age: 23,
                position: "CB",
                club: "AMS Development FC",
                bloodGroup: "O+",
                assessmentDate: new Date("2026-08-23"),
                bestPosition: "CB",
                secondaryPositions: ["FB"],
                isActive: true
            },

            {
                externalId: "DEV-005",
                name: "Arjun Mehta",
                age: 22,
                position: "GK",
                club: "AMS Development FC",
                bloodGroup: "AB+",
                assessmentDate: new Date("2026-08-24"),
                bestPosition: "GK",
                secondaryPositions: ["CB"],
                isActive: true
            }

        ]);


        console.log(
            `${athletes.length} athletes created.`
        );


        // ========================================
        // Assessments
        // ========================================

        const assessments = [

            // --------------------------------
            // Kian Osei - CM
            // --------------------------------

            {
                athleteId: athletes[0]._id,
                assessmentDate: new Date("2026-08-20"),

                lowerBodyStrength: score(78),
                coreStrength: score(80),

                sprint20m: score(76),
                sprint50m: score(74),
                agility505: score(79),
                verticalJump: score(70),
                aerobicCapacity: score(88),

                firstTouch: score(91),
                shortPassing: score(94),
                longPassing: score(89),

                shootingPower: score(72),
                shootingAccuracy: score(75),

                dribbling: score(84),
                crossing: score(73),
                heading: score(65),
                tackling: score(76),

                rightFootPower: score(85),
                rightFootPassing: score(94),
                rightFootControl: score(92),

                leftFootPower: score(74),
                leftFootPassing: score(86),
                leftFootControl: score(82),

                weakFootUsage: score(80),
                offBallMovement: score(88),
                decisionMaking: score(93),
                positionalDiscipline: score(90),
                criticalThinking: score(92),

                hsrDistance: score(82),
                sprintCount1H: score(78),
                sprintCount2H: score(80),
                hrRecovery: score(86),

                injuryNotes: "",
                coachNotes: "Excellent passing and decision making.",
                nutritionNotes: "Maintain hydration and balanced carbohydrate intake."
            },


            // --------------------------------
            // Marcus Webb - ST
            // --------------------------------

            {
                athleteId: athletes[1]._id,
                assessmentDate: new Date("2026-08-21"),

                lowerBodyStrength: score(91),
                coreStrength: score(87),

                sprint20m: score(88),
                sprint50m: score(85),
                agility505: score(82),
                verticalJump: score(89),
                aerobicCapacity: score(78),

                firstTouch: score(85),
                shortPassing: score(74),
                longPassing: score(62),

                shootingPower: score(94),
                shootingAccuracy: score(96),

                dribbling: score(88),
                crossing: score(70),
                heading: score(91),
                tackling: score(48),

                rightFootPower: score(96),
                rightFootPassing: score(78),
                rightFootControl: score(91),

                leftFootPower: score(80),
                leftFootPassing: score(65),
                leftFootControl: score(77),

                weakFootUsage: score(82),
                offBallMovement: score(93),
                decisionMaking: score(89),
                positionalDiscipline: score(83),
                criticalThinking: score(81),

                hsrDistance: score(84),
                sprintCount1H: score(90),
                sprintCount2H: score(86),
                hrRecovery: score(77),

                injuryNotes: "",
                coachNotes: "Strong finishing and excellent movement inside the box.",
                nutritionNotes: "Increase protein intake after high-intensity sessions."
            },


            // --------------------------------
            // Priya Nandan - Winger
            // --------------------------------

            {
                athleteId: athletes[2]._id,
                assessmentDate: new Date("2026-08-22"),

                lowerBodyStrength: score(72),
                coreStrength: score(76),

                sprint20m: score(95),
                sprint50m: score(92),
                agility505: score(94),
                verticalJump: score(78),
                aerobicCapacity: score(86),

                firstTouch: score(88),
                shortPassing: score(82),
                longPassing: score(70),

                shootingPower: score(81),
                shootingAccuracy: score(85),

                dribbling: score(96),
                crossing: score(93),
                heading: score(61),
                tackling: score(55),

                rightFootPower: score(87),
                rightFootPassing: score(85),
                rightFootControl: score(94),

                leftFootPower: score(84),
                leftFootPassing: score(80),
                leftFootControl: score(90),

                weakFootUsage: score(92),
                offBallMovement: score(91),
                decisionMaking: score(86),
                positionalDiscipline: score(78),
                criticalThinking: score(83),

                hsrDistance: score(94),
                sprintCount1H: score(96),
                sprintCount2H: score(91),
                hrRecovery: score(89),

                injuryNotes: "",
                coachNotes: "Exceptional pace, agility and dribbling.",
                nutritionNotes: "Maintain adequate recovery nutrition."
            },


            // --------------------------------
            // Daniel Okoro - CB
            // --------------------------------

            {
                athleteId: athletes[3]._id,
                assessmentDate: new Date("2026-08-23"),

                lowerBodyStrength: score(94),
                coreStrength: score(92),

                sprint20m: score(72),
                sprint50m: score(70),
                agility505: score(73),
                verticalJump: score(91),
                aerobicCapacity: score(80),

                firstTouch: score(74),
                shortPassing: score(82),
                longPassing: score(87),

                shootingPower: score(55),
                shootingAccuracy: score(50),

                dribbling: score(62),
                crossing: score(58),
                heading: score(96),
                tackling: score(95),

                rightFootPower: score(90),
                rightFootPassing: score(86),
                rightFootControl: score(78),

                leftFootPower: score(68),
                leftFootPassing: score(70),
                leftFootControl: score(66),

                weakFootUsage: score(65),
                offBallMovement: score(72),
                decisionMaking: score(91),
                positionalDiscipline: score(96),
                criticalThinking: score(90),

                hsrDistance: score(76),
                sprintCount1H: score(70),
                sprintCount2H: score(73),
                hrRecovery: score(82),

                injuryNotes: "",
                coachNotes: "Strong defensive positioning and aerial ability.",
                nutritionNotes: "Focus on recovery and joint-supportive nutrition."
            },


            // --------------------------------
            // Arjun Mehta - GK
            // --------------------------------

            {
                athleteId: athletes[4]._id,
                assessmentDate: new Date("2026-08-24"),

                lowerBodyStrength: score(84),
                coreStrength: score(86),

                sprint20m: score(65),
                sprint50m: score(60),
                agility505: score(72),
                verticalJump: score(96),
                aerobicCapacity: score(74),

                firstTouch: score(78),
                shortPassing: score(75),
                longPassing: score(84),

                shootingPower: score(40),
                shootingAccuracy: score(35),

                dribbling: score(45),
                crossing: score(30),
                heading: score(70),
                tackling: score(42),

                rightFootPower: score(88),
                rightFootPassing: score(86),
                rightFootControl: score(82),

                leftFootPower: score(80),
                leftFootPassing: score(79),
                leftFootControl: score(76),

                weakFootUsage: score(77),
                offBallMovement: score(60),
                decisionMaking: score(94),
                positionalDiscipline: score(97),
                criticalThinking: score(95),

                hsrDistance: score(68),
                sprintCount1H: score(55),
                sprintCount2H: score(58),
                hrRecovery: score(80),

                injuryNotes: "",
                coachNotes: "Excellent positioning and decision making.",
                nutritionNotes: "Maintain hydration and recovery routine."
            }

        ];


        await Assessment.insertMany(assessments);

        console.log(
            `${assessments.length} assessments created.`
        );


        // ========================================
        // Match Performances
        // ========================================

        const matches = [];


        for (let i = 0; i < athletes.length; i++) {

            const ratings = [
                7.2,
                7.6,
                8.1,
                7.8,
                8.3
            ];


            for (let j = 0; j < 5; j++) {

                const baseRating = ratings[i];

                matches.push({

                    athleteId: athletes[i]._id,

                    matchDate: new Date(
                        2026,
                        7,
                        1 + (j * 5)
                    ),

                    opponent: [
                        "Bengaluru FC",
                        "Mumbai United",
                        "Chennai Stars",
                        "Delhi Warriors",
                        "Hyderabad FC"
                    ][j],

                    competition: "Development League",

                    minutesPlayed: 75 + (j * 3),

                    goals:
                        athletes[i].position === "ST"
                            ? (j % 2 === 0 ? 1 : 0)
                            : 0,

                    assists:
                        athletes[i].position === "CM" ||
                        athletes[i].position === "Winger"
                            ? (j % 3 === 0 ? 1 : 0)
                            : 0,

                    passes: 35 + (j * 4),

                    tackles:
                        athletes[i].position === "CB"
                            ? 5 + j
                            : 2 + j,

                    interceptions:
                        athletes[i].position === "CB"
                            ? 4 + j
                            : 1 + j,

                    shots:
                        athletes[i].position === "ST"
                            ? 4 + j
                            : 1 + j,

                    performanceRating:
                        Math.min(
                            10,
                            baseRating + (j * 0.15)
                        ),

                    notes: "Development match performance."
                });
            }
        }


        await MatchPerformance.insertMany(matches);

        console.log(
            `${matches.length} match performances created.`
        );


        // ========================================
        // Training Performances
        // ========================================

        const trainings = [];


        for (let i = 0; i < athletes.length; i++) {

            for (let j = 0; j < 5; j++) {

                trainings.push({

                    athleteId: athletes[i]._id,

                    trainingDate: new Date(
                        2026,
                        7,
                        2 + (j * 5)
                    ),

                    sessionType:
                        j % 2 === 0
                            ? "Technical"
                            : "Fitness",

                    durationMinutes: 75,

                    workload: 60 + (j * 5),

                    intensity: 6 + (j * 0.5),

                    sprintDistance:
                        800 + (j * 100),

                    sprintCount:
                        8 + j,

                    passingAccuracy:
                        75 + (i * 3) + j,

                    shootingAccuracy:
                        70 + (i * 4) + j,

                    fitnessRating:
                        Math.min(
                            10,
                            7 + (i * 0.2) + (j * 0.15)
                        ),

                    coachRating:
                        Math.min(
                            10,
                            7.2 + (i * 0.2) + (j * 0.15)
                        ),

                    notes:
                        "Regular development training session."
                });
            }
        }


        await TrainingPerformance.insertMany(
            trainings
        );

        console.log(
            `${trainings.length} training performances created.`
        );


        // ========================================
        // Injury Records
        // ========================================

        await InjuryRecord.insertMany([

            {
                athleteId: athletes[0]._id,
                injuryDate: new Date("2026-07-10"),
                injuryType: "Muscle Strain",
                bodyPart: "Hamstring",
                severity: "Mild",
                description: "Minor training-related strain.",
                treatment: "Rest and physiotherapy.",
                recoveryStatus: "Recovered",
                expectedRecoveryDate: new Date("2026-07-17"),
                actualRecoveryDate: new Date("2026-07-16"),
                notes: "Returned to full training."
            },

            {
                athleteId: athletes[2]._id,
                injuryDate: new Date("2026-08-05"),
                injuryType: "Ankle Sprain",
                bodyPart: "Left Ankle",
                severity: "Moderate",
                description: "Sprain during training.",
                treatment: "Physiotherapy and controlled training.",
                recoveryStatus: "Recovering",
                expectedRecoveryDate: new Date("2026-09-05"),
                notes: "Training load currently monitored."
            }

        ]);


        console.log(
            "Injury records created."
        );


        // ========================================
        // Create Coach
        // ========================================

        const hashedCoachPassword =
            await bcrypt.hash(
                "Coach@123",
                10
            );


        const coach = await User.create({

            name: "Development Coach",

            email: "coach@ams.com",

            password: hashedCoachPassword,

            role: "COACH",

            isActive: true
        });


        // ========================================
        // Coach Evaluations
        // ========================================

        await CoachEvaluation.insertMany([

            {
                athleteId: athletes[0]._id,
                coachId: coach._id,
                evaluationDate: new Date("2026-08-25"),

                technicalRating: 9,
                tacticalRating: 9,
                physicalRating: 8,
                mentalRating: 9,
                disciplineRating: 9,
                overallRating: 9,

                strengths: [
                    "Passing",
                    "Decision Making",
                    "Game Awareness"
                ],

                weaknesses: [
                    "Aerial Ability"
                ],

                comments:
                    "Very reliable central midfielder."
            },


            {
                athleteId: athletes[1]._id,
                coachId: coach._id,
                evaluationDate: new Date("2026-08-25"),

                technicalRating: 9,
                tacticalRating: 8,
                physicalRating: 9,
                mentalRating: 9,
                disciplineRating: 8,
                overallRating: 9,

                strengths: [
                    "Finishing",
                    "Movement",
                    "Strength"
                ],

                weaknesses: [
                    "Defensive Contribution"
                ],

                comments:
                    "High-quality attacking player."
            },


            {
                athleteId: athletes[2]._id,
                coachId: coach._id,
                evaluationDate: new Date("2026-08-25"),

                technicalRating: 9,
                tacticalRating: 8,
                physicalRating: 10,
                mentalRating: 8,
                disciplineRating: 8,
                overallRating: 9,

                strengths: [
                    "Speed",
                    "Dribbling",
                    "Crossing"
                ],

                weaknesses: [
                    "Defensive Positioning"
                ],

                comments:
                    "Excellent wide attacking option."
            },


            {
                athleteId: athletes[3]._id,
                coachId: coach._id,
                evaluationDate: new Date("2026-08-25"),

                technicalRating: 8,
                tacticalRating: 9,
                physicalRating: 10,
                mentalRating: 9,
                disciplineRating: 10,
                overallRating: 9,

                strengths: [
                    "Tackling",
                    "Heading",
                    "Positioning"
                ],

                weaknesses: [
                    "Acceleration"
                ],

                comments:
                    "Strong central defender."
            },


            {
                athleteId: athletes[4]._id,
                coachId: coach._id,
                evaluationDate: new Date("2026-08-25"),

                technicalRating: 8,
                tacticalRating: 10,
                physicalRating: 9,
                mentalRating: 10,
                disciplineRating: 10,
                overallRating: 9,

                strengths: [
                    "Positioning",
                    "Decision Making",
                    "Vertical Reach"
                ],

                weaknesses: [
                    "Outfield Distribution"
                ],

                comments:
                    "Very promising goalkeeper."
            }

        ]);


        console.log(
            "Coach evaluations created."
        );


        // ========================================
        // Create Admin
        // ========================================

        const hashedAdminPassword =
            await bcrypt.hash(
                "Admin@123",
                10
            );


        await User.create({

            name: "AMS Administrator",

            email: "admin@ams.com",

            password: hashedAdminPassword,

            role: "ADMIN",

            isActive: true
        });


        console.log(
            "Admin user created."
        );


        console.log("\n================================");
        console.log("AMS DATABASE SEED COMPLETED");
        console.log("================================");

        console.log("\nLogin accounts:");

        console.log(
            "Admin: admin@ams.com / Admin@123"
        );

        console.log(
            "Coach: coach@ams.com / Coach@123"
        );

        console.log("\nAthletes created:", athletes.length);
        console.log("Assessments:", assessments.length);
        console.log("Match performances:", matches.length);
        console.log("Training performances:", trainings.length);


        process.exit(0);

    } catch (error) {

        console.error(
            "\nDatabase seed failed:"
        );

        console.error(error);

        process.exit(1);
    }
};


seedDatabase();