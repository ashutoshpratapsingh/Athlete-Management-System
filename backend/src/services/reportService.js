const Assessment = require("../models/Assessment");
const MatchPerformance = require("../models/MatchPerformance");
const TrainingPerformance = require("../models/TrainingPerformance");
const InjuryRecord = require("../models/InjuryRecord");
const CoachEvaluation = require("../models/CoachEvaluation");

const {
    analyzePerformance
} = require("./mlService");


// ============================================================
// HELPERS
// ============================================================

const round = (value, decimals = 1) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return 0;
    }

    return Number(Number(value).toFixed(decimals));
};


const average = (values) => {
    const validValues = values
        .map(Number)
        .filter((value) => !Number.isNaN(value));

    if (validValues.length === 0) {
        return 0;
    }

    return (
        validValues.reduce((sum, value) => sum + value, 0) /
        validValues.length
    );
};


const unique = (items) => {
    return [...new Set(
        items
            .filter(Boolean)
            .map((item) => String(item).trim())
            .filter(Boolean)
    )];
};


// ============================================================
// ASSESSMENT SCORE HELPER
// ============================================================

// Reads assessment scores safely and converts them to 0-100.

const assessmentScore = (assessment, field) => {
    if (!assessment || !field) {
        return null;
    }

    const possibleValues = [
        assessment?.[field]?.score,
        assessment?.[field],

        assessment?.physical?.[field]?.score,
        assessment?.physical?.[field],

        assessment?.technical?.[field]?.score,
        assessment?.technical?.[field],

        assessment?.tactical?.[field]?.score,
        assessment?.tactical?.[field],

        assessment?.cognitive?.[field]?.score,
        assessment?.cognitive?.[field]
    ];

    const rawValue = possibleValues.find(
        (value) =>
            value !== undefined &&
            value !== null &&
            value !== "" &&
            !Number.isNaN(Number(value))
    );

    if (rawValue === undefined) {
        return null;
    }

    const numericValue = Number(rawValue);

    if (numericValue >= 0 && numericValue <= 10) {
        return round(numericValue * 10);
    }

    return round(
        Math.max(0, Math.min(100, numericValue))
    );
};

const scoreFromAssessment = (
    assessment,
    fields
) => {
    if (!assessment || !Array.isArray(fields)) {
        return 0;
    }

    const scores = fields
        .map((field) => assessmentScore(assessment, field))
        .filter(
            (value) =>
                value !== null &&
                value !== undefined &&
                !Number.isNaN(Number(value))
        );

    if (scores.length === 0) {
        return 0;
    }

    return round(average(scores));
};


const getLatest = (records, dateField) => {
    if (!records || records.length === 0) {
        return null;
    }

    return [...records].sort(
        (a, b) =>
            new Date(b[dateField]) -
            new Date(a[dateField])
    )[0];
};


// ============================================================
// COLLECT ATHLETE DATA
// ============================================================

const collectAthleteReportData = async (athleteId) => {
    const [
        assessments,
        matchPerformances,
        trainingPerformances,
        injuryRecords,
        coachEvaluations
    ] = await Promise.all([
        Assessment.find({
            athleteId
        }).sort({
            assessmentDate: -1
        }),

        MatchPerformance.find({
            athleteId
        }).sort({
            matchDate: -1
        }),

        TrainingPerformance.find({
            athleteId
        }).sort({
            trainingDate: -1
        }),

        InjuryRecord.find({
            athleteId
        }).sort({
            injuryDate: -1
        }),

        CoachEvaluation.find({
            athleteId
        }).sort({
            evaluationDate: -1
        })
    ]);

    return {
        assessments,
        matchPerformances,
        trainingPerformances,
        injuryRecords,
        coachEvaluations
    };
};


// ============================================================
// ML PERFORMANCE ANALYSIS
// ============================================================

const generatePerformanceAnalysis = async (athleteId) => {
    const [
        matchPerformances,
        trainingPerformances
    ] = await Promise.all([
        MatchPerformance.find({
            athleteId
        }).sort({
            matchDate: -1
        }),

        TrainingPerformance.find({
            athleteId
        }).sort({
            trainingDate: -1
        })
    ]);

    const analysis = await analyzePerformance(
        matchPerformances,
        trainingPerformances
    );

    return {
        matchPerformances,
        trainingPerformances,
        performanceAnalysis: analysis?.data || {}
    };
};


// ============================================================
// PHYSICAL ANALYSIS
// ============================================================

const buildPhysicalAnalysis = (latestAssessment) => {
    if (!latestAssessment) {
        return {
            score: 0,
            metrics: {},
            summary: "No physical assessment data available."
        };
    }

    const physicalFields = [
        "lowerBodyStrength",
        "coreStrength",
        "sprint20m",
        "sprint50m",
        "agility505",
        "verticalJump",
        "aerobicCapacity"
    ];

    const metrics = {};

    physicalFields.forEach((field) => {
        const score = assessmentScore(
            latestAssessment,
            field
        );

        if (score !== null) {
            metrics[field] = score;
        }
    });

    const score = scoreFromAssessment(
        latestAssessment,
        physicalFields
    );

    let summary;

    if (score >= 85) {
        summary =
            "The athlete demonstrates a strong overall physical profile with good strength, speed, agility and conditioning.";
    } else if (score >= 70) {
        summary =
            "The athlete demonstrates a solid physical profile with some opportunities for further development.";
    } else {
        summary =
            "The physical profile indicates several areas that should receive additional conditioning and development focus.";
    }

    return {
        score,
        metrics,
        summary
    };
};


// ============================================================
// TECHNICAL ANALYSIS
// ============================================================

const buildTechnicalAnalysis = (latestAssessment) => {
    if (!latestAssessment) {
        return {
            score: 0,
            metrics: {},
            summary: "No technical assessment data available."
        };
    }

    const technicalFields = [
        "firstTouch",
        "shortPassing",
        "longPassing",
        "shootingPower",
        "shootingAccuracy",
        "dribbling",
        "crossing",
        "heading",
        "tackling",
        "rightFootPower",
        "rightFootPassing",
        "rightFootControl",
        "leftFootPower",
        "leftFootPassing",
        "leftFootControl",
        "weakFootUsage"
    ];

    const metrics = {};

    technicalFields.forEach((field) => {
        const score = assessmentScore(
            latestAssessment,
            field
        );

        if (score !== null) {
            metrics[field] = score;
        }
    });

    const score = scoreFromAssessment(
        latestAssessment,
        technicalFields
    );

    console.log(
    "TECHNICAL ASSESSMENT DATA:",
    technicalFields.map((field) => ({
        field,
        value: latestAssessment?.[field]
    }))
);

console.log("TECHNICAL SCORE:", score);

    let summary;

    if (score >= 85) {
        summary =
            "Technical ability is a major strength, with strong execution across the athlete's assessed football skills.";
    } else if (score >= 70) {
        summary =
            "The athlete demonstrates a good technical foundation with identifiable areas for refinement.";
    } else {
        summary =
            "Technical development should be a significant focus in the athlete's upcoming training cycle.";
    }

    return {
        score,
        metrics,
        summary
    };
};


// ============================================================
// TACTICAL / COGNITIVE ANALYSIS
// ============================================================

const buildTacticalAnalysis = (latestAssessment) => {
    if (!latestAssessment) {
        return {
            score: 0,
            metrics: {},
            summary: "No tactical or cognitive assessment data available."
        };
    }

    const tacticalFields = [
        "offBallMovement",
        "decisionMaking",
        "positionalDiscipline",
        "criticalThinking"
    ];

    const metrics = {};

    tacticalFields.forEach((field) => {
        const score = assessmentScore(
            latestAssessment,
            field
        );

        if (score !== null) {
            metrics[field] = score;
        }
    });

    const score = scoreFromAssessment(
        latestAssessment,
        tacticalFields
    );

    console.log(
    "TACTICAL ASSESSMENT DATA:",
    tacticalFields.map((field) => ({
        field,
        value: latestAssessment?.[field]
    }))
);

console.log("TACTICAL SCORE:", score);

    let summary;

    if (score >= 85) {
        summary =
            "The athlete demonstrates strong tactical awareness, decision-making and positional understanding.";
    } else if (score >= 70) {
        summary =
            "The athlete shows a good tactical foundation with opportunities to improve consistency and decision-making.";
    } else {
        summary =
            "Tactical and cognitive development should receive additional attention during training.";
    }

    return {
        score,
        metrics,
        summary
    };
};


// ============================================================
// RECOVERY ANALYSIS
// ============================================================

const buildRecoveryAnalysis = (
    latestAssessment,
    trainingPerformances
) => {
    const hrRecovery = assessmentScore(
        latestAssessment,
        "hrRecovery"
    );

    const fitnessRatings = trainingPerformances
        .map((item) => item.fitnessRating)
        .filter((value) => value !== undefined && value !== null);

    const averageFitness = round(
        average(fitnessRatings)
    );

    const recoveryComponents = [];

    if (hrRecovery !== null) {
        recoveryComponents.push(hrRecovery);
    }

    if (averageFitness > 0) {
        recoveryComponents.push(
            averageFitness * 10
        );
    }

    const score = round(
        average(recoveryComponents)
    );

    let status = "Insufficient Data";

    if (score >= 85) {
        status = "Excellent";
    } else if (score >= 70) {
        status = "Good";
    } else if (score > 0) {
        status = "Needs Attention";
    }

    return {
        score,
        status,
        hrRecovery:
            hrRecovery !== null
                ? hrRecovery
                : null,
        averageFitness
    };
};


// ============================================================
// MATCH ANALYSIS
// ============================================================

const buildMatchAnalysis = (matches) => {
    if (!matches || matches.length === 0) {
        return {
            averageRating: 0,
            recentAverageRating: 0,
            bestRating: 0,
            lowestRating: 0,
            totalMatches: 0,
            totalGoals: 0,
            totalAssists: 0,
            totalMinutes: 0,
            consistency: 0,
            trend: "Insufficient Data"
        };
    }

    const ratings = matches
        .map((match) => Number(match.performanceRating))
        .filter((rating) => !Number.isNaN(rating));

    const recentRatings = ratings.slice(0, 5);

    const averageRating = round(
        average(ratings)
    );

    const recentAverageRating = round(
        average(recentRatings)
    );

    const bestRating = round(
        Math.max(...ratings)
    );

    const lowestRating = round(
        Math.min(...ratings)
    );

    const totalGoals = matches.reduce(
        (sum, match) =>
            sum + Number(match.goals || 0),
        0
    );

    const totalAssists = matches.reduce(
        (sum, match) =>
            sum + Number(match.assists || 0),
        0
    );

    const totalMinutes = matches.reduce(
        (sum, match) =>
            sum + Number(match.minutesPlayed || 0),
        0
    );

    let consistency = 0;

    if (ratings.length > 1) {
        const mean = average(ratings);

        const variance = average(
            ratings.map(
                (rating) =>
                    Math.pow(rating - mean, 2)
            )
        );

        const standardDeviation = Math.sqrt(
            variance
        );

        consistency = round(
            Math.max(
                0,
                Math.min(
                    100,
                    100 -
                        standardDeviation * 30
                )
            )
        );
    } else {
        consistency = 100;
    }

    let trend = "Stable";

    if (recentAverageRating > averageRating + 0.25) {
        trend = "Improving";
    } else if (
        recentAverageRating <
        averageRating - 0.25
    ) {
        trend = "Declining";
    }

    return {
        averageRating,
        recentAverageRating,
        bestRating,
        lowestRating,
        totalMatches: matches.length,
        totalGoals,
        totalAssists,
        totalMinutes,
        consistency,
        trend
    };
};


// ============================================================
// TRAINING ANALYSIS
// ============================================================

const buildTrainingAnalysis = (training) => {
    if (!training || training.length === 0) {
        return {
            totalSessions: 0,
            averageWorkload: 0,
            averageIntensity: 0,
            averageFitnessRating: 0,
            averageCoachRating: 0,
            averagePassingAccuracy: 0,
            averageShootingAccuracy: 0,
            trainingLoadStatus: "Insufficient Data"
        };
    }

    const averageWorkload = round(
        average(
            training.map(
                (item) => item.workload
            )
        )
    );

    const averageIntensity = round(
        average(
            training.map(
                (item) => item.intensity
            )
        )
    );

    const averageFitnessRating = round(
        average(
            training.map(
                (item) => item.fitnessRating
            )
        )
    );

    const averageCoachRating = round(
        average(
            training.map(
                (item) => item.coachRating
            )
        )
    );

    const averagePassingAccuracy = round(
        average(
            training.map(
                (item) => item.passingAccuracy
            )
        )
    );

    const averageShootingAccuracy = round(
        average(
            training.map(
                (item) => item.shootingAccuracy
            )
        )
    );

    let trainingLoadStatus = "Balanced";

    if (averageIntensity >= 8.5) {
        trainingLoadStatus = "High Load";
    } else if (averageIntensity <= 5) {
        trainingLoadStatus = "Low Load";
    }

    return {
        totalSessions: training.length,
        averageWorkload,
        averageIntensity,
        averageFitnessRating,
        averageCoachRating,
        averagePassingAccuracy,
        averageShootingAccuracy,
        trainingLoadStatus
    };
};


// ============================================================
// INJURY RISK
// ============================================================

const buildInjuryAnalysis = (injuries) => {
    if (!injuries || injuries.length === 0) {
        return {
            risk: "Low",
            activeInjuries: 0,
            totalInjuries: 0,
            severeInjuries: 0,
            summary:
                "No recorded injury history is currently available."
        };
    }

    const activeInjuries = injuries.filter(
        (injury) =>
            injury.recoveryStatus !== "Recovered"
    );

    const severeInjuries = injuries.filter(
        (injury) =>
            injury.severity === "Severe"
    );

    let risk = "Low";

    if (
        severeInjuries.length > 0 ||
        activeInjuries.length >= 2
    ) {
        risk = "High";
    } else if (
        activeInjuries.length === 1 ||
        injuries.length >= 3
    ) {
        risk = "Moderate";
    }

    let summary;

    if (risk === "High") {
        summary =
            "The athlete has injury-related factors that require close monitoring and appropriate recovery management.";
    } else if (risk === "Moderate") {
        summary =
            "The athlete has some injury-related considerations that should be monitored during training and recovery.";
    } else {
        summary =
            "Current recorded injury history indicates a relatively low injury-risk profile.";
    }

    return {
        risk,
        activeInjuries: activeInjuries.length,
        totalInjuries: injuries.length,
        severeInjuries: severeInjuries.length,
        summary
    };
};


// ============================================================
// STRENGTHS & WEAKNESSES
// ============================================================

const buildAssessmentInsights = (latestAssessment) => {
    if (!latestAssessment) {
        return {
            strengths: [],
            weaknesses: []
        };
    }

    const labels = {
        lowerBodyStrength: "Lower-body strength",
        coreStrength: "Core strength",
        sprint20m: "20m sprint performance",
        sprint50m: "50m sprint performance",
        agility505: "Agility",
        verticalJump: "Explosive power",
        aerobicCapacity: "Aerobic capacity",
        firstTouch: "First touch",
        shortPassing: "Short passing",
        longPassing: "Long passing",
        shootingPower: "Shooting power",
        shootingAccuracy: "Shooting accuracy",
        dribbling: "Dribbling",
        crossing: "Crossing",
        heading: "Heading",
        tackling: "Tackling",
        rightFootPower: "Right-foot power",
        rightFootPassing: "Right-foot passing",
        rightFootControl: "Right-foot control",
        leftFootPower: "Left-foot power",
        leftFootPassing: "Left-foot passing",
        leftFootControl: "Left-foot control",
        weakFootUsage: "Weak-foot usage",
        offBallMovement: "Off-ball movement",
        decisionMaking: "Decision making",
        positionalDiscipline: "Positional discipline",
        criticalThinking: "Critical thinking",
        hsrDistance: "High-speed running",
        sprintCount1H: "First-half sprint capacity",
        sprintCount2H: "Second-half sprint capacity",
        hrRecovery: "Heart-rate recovery"
    };

    const strengths = [];
    const weaknesses = [];

    Object.keys(labels).forEach((field) => {
        const score = assessmentScore(
            latestAssessment,
            field
        );

        if (score === null) {
            return;
        }

        if (score >= 85) {
            strengths.push(
                `${labels[field]} (${round(score)}/100)`
            );
        } else if (score < 65) {
            weaknesses.push(
                `${labels[field]} (${round(score)}/100)`
            );
        }
    });

    return {
        strengths,
        weaknesses
    };
};


// ============================================================
// RECOMMENDATIONS
// ============================================================

const buildRecommendations = ({
    latestAssessment,
    trainingAnalysis,
    injuryAnalysis,
    technicalAnalysis,
    physicalAnalysis,
    tacticalAnalysis
}) => {
    const trainingRecommendations = [];
    const nutritionRecommendations = [];
    const recoveryRecommendations = [];

    const shootingAccuracy = assessmentScore(
        latestAssessment,
        "shootingAccuracy"
    );

    const passing = assessmentScore(
        latestAssessment,
        "shortPassing"
    );

    const aerobicCapacity = assessmentScore(
        latestAssessment,
        "aerobicCapacity"
    );

    const decisionMaking = assessmentScore(
        latestAssessment,
        "decisionMaking"
    );

    const agility = assessmentScore(
        latestAssessment,
        "agility505"
    );

    const hrRecovery = assessmentScore(
        latestAssessment,
        "hrRecovery"
    );


    // Training

    if (
        shootingAccuracy !== null &&
        shootingAccuracy < 75
    ) {
        trainingRecommendations.push(
            "Prioritize finishing and shooting-accuracy drills, including pressure-based finishing and weak-foot repetitions."
        );
    }

    if (
        passing !== null &&
        passing < 75
    ) {
        trainingRecommendations.push(
            "Include additional short-passing and combination-play exercises to improve passing consistency."
        );
    }

    if (
        aerobicCapacity !== null &&
        aerobicCapacity < 75
    ) {
        trainingRecommendations.push(
            "Increase progressive aerobic conditioning while controlling total training load."
        );
    }

    if (
        agility !== null &&
        agility < 75
    ) {
        trainingRecommendations.push(
            "Add change-of-direction and agility drills to improve movement efficiency."
        );
    }

    if (
        decisionMaking !== null &&
        decisionMaking < 75
    ) {
        trainingRecommendations.push(
            "Use small-sided games and decision-making drills to improve tactical responses under pressure."
        );
    }

    if (
        trainingAnalysis.averageIntensity >= 8.5
    ) {
        trainingRecommendations.push(
            "Balance high-intensity sessions with lower-intensity recovery work to manage training load."
        );
    }

    if (trainingRecommendations.length === 0) {
        trainingRecommendations.push(
            "Maintain the current training structure while progressively increasing challenge and match-specific intensity."
        );
    }


    // Nutrition

    nutritionRecommendations.push(
        "Maintain consistent hydration throughout training and match days."
    );

    nutritionRecommendations.push(
        "Prioritize adequate protein intake across meals to support muscle recovery and adaptation."
    );

    if (
        trainingAnalysis.averageIntensity >= 7
    ) {
        nutritionRecommendations.push(
            "Increase carbohydrate availability around demanding training and match sessions to support performance."
        );
    } else {
        nutritionRecommendations.push(
            "Maintain a balanced intake of carbohydrates, protein, healthy fats, fruits and vegetables."
        );
    }

    nutritionRecommendations.push(
        "Use a balanced post-training meal or recovery snack combining protein and carbohydrates."
    );


    // Recovery

    if (
        injuryAnalysis.risk === "High"
    ) {
        recoveryRecommendations.push(
            "Prioritize structured recovery and ensure current injuries are appropriately monitored before increasing training load."
        );
    }

    if (
        hrRecovery !== null &&
        hrRecovery < 75
    ) {
        recoveryRecommendations.push(
            "Monitor heart-rate recovery and include additional low-intensity recovery sessions when required."
        );
    }

    if (
        trainingAnalysis.averageIntensity >= 8.5
    ) {
        recoveryRecommendations.push(
            "Schedule adequate recovery following high-intensity sessions and avoid unnecessary consecutive high-load days."
        );
    }

    recoveryRecommendations.push(
        "Maintain consistent sleep and include mobility work as part of the recovery routine."
    );

    recoveryRecommendations.push(
        "Track fatigue, soreness and perceived exertion regularly to identify early signs of excessive load."
    );


    return {
        trainingRecommendations: unique(
            trainingRecommendations
        ),
        nutritionRecommendations: unique(
            nutritionRecommendations
        ),
        recoveryRecommendations: unique(
            recoveryRecommendations
        )
    };
};


// ============================================================
// MAIN PREMIUM REPORT BUILDER
// ============================================================

const buildPremiumReport = ({
    athlete,
    reportData,
    performanceAnalysis
}) => {
    const latestAssessment = getLatest(
        reportData.assessments,
        "assessmentDate"
    );

    const latestCoachEvaluation = getLatest(
        reportData.coachEvaluations,
        "evaluationDate"
    );

    const physicalAnalysis =
        buildPhysicalAnalysis(
            latestAssessment
        );

    const technicalAnalysis =
        buildTechnicalAnalysis(
            latestAssessment
        );

    const tacticalAnalysis =
        buildTacticalAnalysis(
            latestAssessment
        );

    const recoveryAnalysis =
        buildRecoveryAnalysis(
            latestAssessment,
            reportData.trainingPerformances
        );

    const matchAnalysis =
        buildMatchAnalysis(
            reportData.matchPerformances
        );

    const trainingAnalysis =
        buildTrainingAnalysis(
            reportData.trainingPerformances
        );

    const injuryAnalysis =
        buildInjuryAnalysis(
            reportData.injuryRecords
        );

    const assessmentInsights =
        buildAssessmentInsights(
            latestAssessment
        );

    const mlStrengths =
        Array.isArray(
            performanceAnalysis?.strengths
        )
            ? performanceAnalysis.strengths
            : [];

    const mlWeaknesses =
        Array.isArray(
            performanceAnalysis?.weaknesses
        )
            ? performanceAnalysis.weaknesses
            : [];

    const coachStrengths =
        Array.isArray(
            latestCoachEvaluation?.strengths
        )
            ? latestCoachEvaluation.strengths
            : [];

    const coachWeaknesses =
        Array.isArray(
            latestCoachEvaluation?.weaknesses
        )
            ? latestCoachEvaluation.weaknesses
            : [];


    const strengths = unique([
        ...mlStrengths,
        ...coachStrengths,
        ...assessmentInsights.strengths
    ]).slice(0, 8);


    const weaknesses = unique([
        ...mlWeaknesses,
        ...coachWeaknesses,
        ...assessmentInsights.weaknesses
    ]).slice(0, 8);


    // --------------------------------------------------------
    // Overall score
    // --------------------------------------------------------

    const mlScore =
        Number(
            performanceAnalysis?.overallScore
        );

    let overallScore;

    if (
        !Number.isNaN(mlScore) &&
        mlScore > 0
    ) {
        overallScore = round(
            mlScore
        );
    } else {
        const componentScores = [
            physicalAnalysis.score,
            technicalAnalysis.score,
            tacticalAnalysis.score,
            matchAnalysis.averageRating * 10,
            trainingAnalysis.averageFitnessRating * 10
        ].filter(
            (score) => score > 0
        );

        overallScore = round(
            average(componentScores)
        );
    }


    // --------------------------------------------------------
    // AI summary
    // --------------------------------------------------------

    const performanceTrend =
        performanceAnalysis?.trend ||
        matchAnalysis.trend ||
        "Stable";

    let aiSummary =
        `${athlete.name} currently has an overall performance score of ${overallScore}/100. `;

    aiSummary +=
        `The athlete's performance trend is ${performanceTrend.toLowerCase()}. `;

    if (physicalAnalysis.score > 0) {
        aiSummary +=
            `Physical performance is rated at ${physicalAnalysis.score}/100, `;
    }

    if (technicalAnalysis.score > 0) {
        aiSummary +=
            `while technical performance is rated at ${technicalAnalysis.score}/100. `;
    }

    if (tacticalAnalysis.score > 0) {
        aiSummary +=
            `Tactical and cognitive performance is rated at ${tacticalAnalysis.score}/100. `;
    }

    if (strengths.length > 0) {
        aiSummary +=
            `Key strengths include ${strengths.slice(0, 3).join(", ")}. `;
    }

    if (weaknesses.length > 0) {
        aiSummary +=
            `The main development priorities are ${weaknesses.slice(0, 3).join(", ")}. `;
    }

    aiSummary +=
        `The current injury-risk assessment is ${injuryAnalysis.risk.toLowerCase()}.`;


    // --------------------------------------------------------
    // Recommendations
    // --------------------------------------------------------

    const recommendations =
        buildRecommendations({
            latestAssessment,
            trainingAnalysis,
            injuryAnalysis,
            technicalAnalysis,
            physicalAnalysis,
            tacticalAnalysis
        });


    // --------------------------------------------------------
    // Return complete premium report
    // --------------------------------------------------------

    return {
        reportType: "FULL",

        overallScore,

        performanceTrend,

        scores: {
            physical: physicalAnalysis.score,
            technical: technicalAnalysis.score,
            tactical: tacticalAnalysis.score,
            match: round(
                matchAnalysis.averageRating * 10
            ),
            training: round(
                trainingAnalysis.averageFitnessRating * 10
            ),
            recovery: recoveryAnalysis.score
        },

        physicalAnalysis,

        technicalAnalysis,

        tacticalAnalysis,

        recoveryAnalysis,

        matchAnalysis,

        trainingAnalysis,

        injuryAnalysis,

        positionAnalysis: {
            currentPosition:
                athlete.position || null,

            bestPosition:
                athlete.bestPosition || null,

            secondaryPositions:
                athlete.secondaryPositions || []
        },

        coachAssessment: latestCoachEvaluation
            ? {
                  technical:
                      latestCoachEvaluation.technicalRating,
                  tactical:
                      latestCoachEvaluation.tacticalRating,
                  physical:
                      latestCoachEvaluation.physicalRating,
                  mental:
                      latestCoachEvaluation.mentalRating,
                  discipline:
                      latestCoachEvaluation.disciplineRating,
                  overall:
                      latestCoachEvaluation.overallRating,
                  comments:
                      latestCoachEvaluation.comments || null
              }
            : null,

        strengths,

        weaknesses,

        trainingRecommendations:
            recommendations.trainingRecommendations,

        nutritionRecommendations:
            recommendations.nutritionRecommendations,

        recoveryRecommendations:
            recommendations.recoveryRecommendations,

        aiSummary
    };
};


module.exports = {
    collectAthleteReportData,
    generatePerformanceAnalysis,
    buildPremiumReport
};