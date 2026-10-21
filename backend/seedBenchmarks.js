const mongoose = require("mongoose");
require("dotenv").config();

const Benchmark = require("./src/models/Benchmark");

const benchmarks = [

    // =========================================================
    // PHYSICAL PERFORMANCE
    // =========================================================

    {
        metric: "lowerBodyStrength",
        category: "PHYSICAL",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "score",
        lowerIsBetter: false,
        benchmarkValue: 7,
        acceptableRangeMin: 5,
        acceptableRangeMax: 10,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Football Physical Performance Benchmark",
        sourceReference: "AMS-BENCH-2026-PHY-005",
        testProtocol: "Coach-rated lower body strength assessment on 0-10 scale",
        version: "2026.1"
    },

    {
        metric: "coreStrength",
        category: "PHYSICAL",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "score",
        lowerIsBetter: false,
        benchmarkValue: 7,
        acceptableRangeMin: 5,
        acceptableRangeMax: 10,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Football Physical Performance Benchmark",
        sourceReference: "AMS-BENCH-2026-PHY-006",
        testProtocol: "Coach-rated core strength assessment on 0-10 scale",
        version: "2026.1"
    },

    {
        metric: "sprint20m",
        category: "PHYSICAL",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "seconds",
        lowerIsBetter: true,
        benchmarkValue: 3.50,
        acceptableRangeMin: 3.50,
        acceptableRangeMax: 4.20,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Football Performance Benchmark",
        sourceReference: "AMS-BENCH-2026-PHY-001",
        testProtocol: "20 metre linear sprint from standing start",
        version: "2026.1"
    },

    {
        metric: "sprint50m",
        category: "PHYSICAL",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "seconds",
        lowerIsBetter: true,
        benchmarkValue: 7.20,
        acceptableRangeMin: 7.20,
        acceptableRangeMax: 8.50,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Football Performance Benchmark",
        sourceReference: "AMS-BENCH-2026-PHY-002",
        testProtocol: "50 metre linear sprint",
        version: "2026.1"
    },

    {
        metric: "agility505",
        category: "PHYSICAL",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "seconds",
        lowerIsBetter: true,
        benchmarkValue: 2.50,
        acceptableRangeMin: 2.50,
        acceptableRangeMax: 3.20,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Football Performance Benchmark",
        sourceReference: "AMS-BENCH-2026-PHY-004",
        testProtocol: "505 change-of-direction agility test",
        version: "2026.1"
    },

    {
        metric: "verticalJump",
        category: "PHYSICAL",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "cm",
        lowerIsBetter: false,
        benchmarkValue: 45,
        acceptableRangeMin: 35,
        acceptableRangeMax: 45,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Football Performance Benchmark",
        sourceReference: "AMS-BENCH-2026-PHY-003",
        testProtocol: "Standing vertical jump measurement",
        version: "2026.1"
    },

    {
        metric: "aerobicCapacity",
        category: "PHYSICAL",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "score",
        lowerIsBetter: false,
        benchmarkValue: 7,
        acceptableRangeMin: 5,
        acceptableRangeMax: 10,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Football Physical Performance Benchmark",
        sourceReference: "AMS-BENCH-2026-PHY-007",
        testProtocol: "Coach-rated aerobic capacity assessment on 0-10 scale",
        version: "2026.1"
    },


    // =========================================================
    // TECHNICAL PERFORMANCE
    // =========================================================

    {
        metric: "firstTouch",
        category: "TECHNICAL",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "score",
        lowerIsBetter: false,
        benchmarkValue: 7,
        acceptableRangeMin: 5,
        acceptableRangeMax: 10,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Technical Skill Benchmark",
        sourceReference: "AMS-BENCH-2026-TEC-001",
        testProtocol: "Coach-rated first touch assessment on 0-10 scale",
        version: "2026.1"
    },

    {
        metric: "shortPassing",
        category: "TECHNICAL",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "score",
        lowerIsBetter: false,
        benchmarkValue: 7,
        acceptableRangeMin: 5,
        acceptableRangeMax: 10,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Technical Skill Benchmark",
        sourceReference: "AMS-BENCH-2026-TEC-002",
        testProtocol: "Short passing accuracy assessment on 0-10 scale",
        version: "2026.1"
    },

    {
        metric: "longPassing",
        category: "TECHNICAL",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "score",
        lowerIsBetter: false,
        benchmarkValue: 7,
        acceptableRangeMin: 5,
        acceptableRangeMax: 10,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Technical Skill Benchmark",
        sourceReference: "AMS-BENCH-2026-TEC-005",
        testProtocol: "Long passing accuracy assessment on 0-10 scale",
        version: "2026.1"
    },

    {
        metric: "shootingPower",
        category: "TECHNICAL",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "score",
        lowerIsBetter: false,
        benchmarkValue: 7,
        acceptableRangeMin: 5,
        acceptableRangeMax: 10,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Technical Skill Benchmark",
        sourceReference: "AMS-BENCH-2026-TEC-006",
        testProtocol: "Coach-rated shooting power assessment on 0-10 scale",
        version: "2026.1"
    },

    {
        metric: "shootingAccuracy",
        category: "TECHNICAL",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "score",
        lowerIsBetter: false,
        benchmarkValue: 7,
        acceptableRangeMin: 5,
        acceptableRangeMax: 10,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Technical Skill Benchmark",
        sourceReference: "AMS-BENCH-2026-TEC-004",
        testProtocol: "Shooting accuracy assessment on 0-10 scale",
        version: "2026.1"
    },

    {
        metric: "dribbling",
        category: "TECHNICAL",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "score",
        lowerIsBetter: false,
        benchmarkValue: 7,
        acceptableRangeMin: 5,
        acceptableRangeMax: 10,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Technical Skill Benchmark",
        sourceReference: "AMS-BENCH-2026-TEC-003",
        testProtocol: "Coach-rated dribbling assessment on 0-10 scale",
        version: "2026.1"
    },

    {
        metric: "crossing",
        category: "TECHNICAL",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "score",
        lowerIsBetter: false,
        benchmarkValue: 7,
        acceptableRangeMin: 5,
        acceptableRangeMax: 10,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Technical Skill Benchmark",
        sourceReference: "AMS-BENCH-2026-TEC-007",
        testProtocol: "Coach-rated crossing accuracy assessment on 0-10 scale",
        version: "2026.1"
    },

    {
        metric: "heading",
        category: "TECHNICAL",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "score",
        lowerIsBetter: false,
        benchmarkValue: 7,
        acceptableRangeMin: 5,
        acceptableRangeMax: 10,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Technical Skill Benchmark",
        sourceReference: "AMS-BENCH-2026-TEC-008",
        testProtocol: "Coach-rated heading assessment on 0-10 scale",
        version: "2026.1"
    },

    {
        metric: "tackling",
        category: "TECHNICAL",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "score",
        lowerIsBetter: false,
        benchmarkValue: 7,
        acceptableRangeMin: 5,
        acceptableRangeMax: 10,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Technical Skill Benchmark",
        sourceReference: "AMS-BENCH-2026-TEC-009",
        testProtocol: "Coach-rated tackling assessment on 0-10 scale",
        version: "2026.1"
    },


    // =========================================================
    // FOOT / BALL SKILLS
    // =========================================================

    {
        metric: "rightFootPower",
        category: "FOOT_SKILLS",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "score",
        lowerIsBetter: false,
        benchmarkValue: 7,
        acceptableRangeMin: 5,
        acceptableRangeMax: 10,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Foot Skill Benchmark",
        sourceReference: "AMS-BENCH-2026-FOOT-001",
        testProtocol: "Right foot power assessment on 0-10 scale",
        version: "2026.1"
    },

    {
        metric: "rightFootPassing",
        category: "FOOT_SKILLS",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "score",
        lowerIsBetter: false,
        benchmarkValue: 7,
        acceptableRangeMin: 5,
        acceptableRangeMax: 10,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Foot Skill Benchmark",
        sourceReference: "AMS-BENCH-2026-FOOT-002",
        testProtocol: "Right foot passing assessment on 0-10 scale",
        version: "2026.1"
    },

    {
        metric: "rightFootControl",
        category: "FOOT_SKILLS",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "score",
        lowerIsBetter: false,
        benchmarkValue: 7,
        acceptableRangeMin: 5,
        acceptableRangeMax: 10,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Foot Skill Benchmark",
        sourceReference: "AMS-BENCH-2026-FOOT-003",
        testProtocol: "Right foot control assessment on 0-10 scale",
        version: "2026.1"
    },

    {
        metric: "leftFootPower",
        category: "FOOT_SKILLS",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "score",
        lowerIsBetter: false,
        benchmarkValue: 7,
        acceptableRangeMin: 5,
        acceptableRangeMax: 10,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Foot Skill Benchmark",
        sourceReference: "AMS-BENCH-2026-FOOT-004",
        testProtocol: "Left foot power assessment on 0-10 scale",
        version: "2026.1"
    },

    {
        metric: "leftFootPassing",
        category: "FOOT_SKILLS",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "score",
        lowerIsBetter: false,
        benchmarkValue: 7,
        acceptableRangeMin: 5,
        acceptableRangeMax: 10,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Foot Skill Benchmark",
        sourceReference: "AMS-BENCH-2026-FOOT-005",
        testProtocol: "Left foot passing assessment on 0-10 scale",
        version: "2026.1"
    },

    {
        metric: "leftFootControl",
        category: "FOOT_SKILLS",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "score",
        lowerIsBetter: false,
        benchmarkValue: 7,
        acceptableRangeMin: 5,
        acceptableRangeMax: 10,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Foot Skill Benchmark",
        sourceReference: "AMS-BENCH-2026-FOOT-006",
        testProtocol: "Left foot control assessment on 0-10 scale",
        version: "2026.1"
    },

    {
        metric: "weakFootUsage",
        category: "FOOT_SKILLS",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "score",
        lowerIsBetter: false,
        benchmarkValue: 7,
        acceptableRangeMin: 5,
        acceptableRangeMax: 10,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Foot Skill Benchmark",
        sourceReference: "AMS-BENCH-2026-FOOT-007",
        testProtocol: "Weak foot usage assessment on 0-10 scale",
        version: "2026.1"
    },


    // =========================================================
    // TACTICAL / COGNITIVE
    // =========================================================

    {
        metric: "offBallMovement",
        category: "TACTICAL",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "score",
        lowerIsBetter: false,
        benchmarkValue: 7,
        acceptableRangeMin: 5,
        acceptableRangeMax: 10,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Tactical Performance Benchmark",
        sourceReference: "AMS-BENCH-2026-TAC-002",
        testProtocol: "Coach-rated off-ball movement assessment on 0-10 scale",
        version: "2026.1"
    },

    {
        metric: "decisionMaking",
        category: "TACTICAL",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "score",
        lowerIsBetter: false,
        benchmarkValue: 7,
        acceptableRangeMin: 5,
        acceptableRangeMax: 10,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Tactical Performance Benchmark",
        sourceReference: "AMS-BENCH-2026-TAC-001",
        testProtocol: "Coach-rated decision making assessment on 0-10 scale",
        version: "2026.1"
    },

    {
        metric: "positionalDiscipline",
        category: "TACTICAL",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "score",
        lowerIsBetter: false,
        benchmarkValue: 7,
        acceptableRangeMin: 5,
        acceptableRangeMax: 10,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Tactical Performance Benchmark",
        sourceReference: "AMS-BENCH-2026-TAC-003",
        testProtocol: "Coach-rated positional discipline assessment on 0-10 scale",
        version: "2026.1"
    },

    {
        metric: "criticalThinking",
        category: "TACTICAL",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "score",
        lowerIsBetter: false,
        benchmarkValue: 7,
        acceptableRangeMin: 5,
        acceptableRangeMax: 10,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Tactical Performance Benchmark",
        sourceReference: "AMS-BENCH-2026-TAC-004",
        testProtocol: "Coach-rated critical thinking assessment on 0-10 scale",
        version: "2026.1"
    },


    // =========================================================
    // MATCH / PHYSICAL LOAD / RECOVERY
    // =========================================================

    {
        metric: "hsrDistance",
        category: "MATCH_LOAD",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "metres",
        lowerIsBetter: false,
        benchmarkValue: 500,
        acceptableRangeMin: 300,
        acceptableRangeMax: 800,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Match Load Benchmark",
        sourceReference: "AMS-BENCH-2026-LOAD-001",
        testProtocol: "High-speed running distance recorded during match performance",
        version: "2026.1"
    },

    {
        metric: "sprintCount1H",
        category: "MATCH_LOAD",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "count",
        lowerIsBetter: false,
        benchmarkValue: 8,
        acceptableRangeMin: 4,
        acceptableRangeMax: 15,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Match Load Benchmark",
        sourceReference: "AMS-BENCH-2026-LOAD-002",
        testProtocol: "Number of high-speed sprint actions recorded in first half",
        version: "2026.1"
    },

    {
        metric: "sprintCount2H",
        category: "MATCH_LOAD",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "count",
        lowerIsBetter: false,
        benchmarkValue: 7,
        acceptableRangeMin: 3,
        acceptableRangeMax: 14,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Match Load Benchmark",
        sourceReference: "AMS-BENCH-2026-LOAD-003",
        testProtocol: "Number of high-speed sprint actions recorded in second half",
        version: "2026.1"
    },

    {
        metric: "hrRecovery",
        category: "MATCH_LOAD",
        position: "ALL",
        ageGroup: "ALL",
        gender: "ALL",
        level: "COMPETITIVE",
        unit: "score",
        lowerIsBetter: false,
        benchmarkValue: 7,
        acceptableRangeMin: 5,
        acceptableRangeMax: 10,
        sourceType: "EXPERT_DEFINED",
        sourceName: "AMS Recovery Benchmark",
        sourceReference: "AMS-BENCH-2026-LOAD-004",
        testProtocol: "Heart-rate recovery assessment represented on a 0-10 scale",
        version: "2026.1"
    }

];


// =========================================================
// SEED FUNCTION
// =========================================================

async function seedBenchmarks() {
    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        // Development seed:
        // Clear previous benchmark records before inserting
        await Benchmark.deleteMany({});

        const inserted = await Benchmark.insertMany(benchmarks);

        console.log(
            `\n✅ ${inserted.length} benchmark records inserted\n`
        );

        inserted.forEach((benchmark) => {
            console.log(
                `${benchmark.metric} → ${benchmark.benchmarkValue} ${benchmark.unit}`
            );
        });

        console.log(
            `\n📊 Total benchmark coverage definitions: ${inserted.length}`
        );

        await mongoose.connection.close();

        console.log("\nBenchmark seeding completed successfully.");

    } catch (error) {

        console.error(
            "Benchmark seed error:",
            error
        );

        process.exit(1);
    }
}

seedBenchmarks();