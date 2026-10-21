const MatchPerformance = require("../models/MatchPerformance");
const TrainingPerformance = require("../models/TrainingPerformance");
const Athlete = require("../models/Athlete");
const Assessment = require("../models/Assessment");

const {
    analyzePerformance,
    predictMatchPerformance,
    analyzePosition,
    analyzeTeamPositions: analyzeTeamPositionsService
} = require("../services/mlService");

// Performance Analytics
const analyzeAthletePerformance = async (req, res) => {
    try {
        const athleteId = req.params.athleteId;

        const athlete = await Athlete.findById(athleteId);

        if (!athlete) {
            return res.status(404).json({
                success: false,
                message: "Athlete not found"
            });
        }

        const matchPerformances =
            await MatchPerformance.find({
                athleteId
            }).sort({ matchDate: -1 });

        const trainingPerformances =
            await TrainingPerformance.find({
                athleteId
            }).sort({ trainingDate: -1 });

        const analysis = await analyzePerformance(
            matchPerformances,
            trainingPerformances
        );

        res.status(200).json({
            success: true,
            athlete: {
                id: athlete._id,
                name: athlete.name,
                position: athlete.position
            },
            analysis: analysis.data
        });
    } catch (error) {
        console.error(
            "Athlete performance analysis error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to analyze athlete performance",
            error: error.message
        });
    }
};

// Match Performance Prediction
const predictAthleteMatchPerformance = async (req, res) => {
    try {
        const athleteId = req.params.athleteId;

        const {
            fitnessStatus,
            opponent
        } = req.body;

        const athlete = await Athlete.findById(athleteId);

        if (!athlete) {
            return res.status(404).json({
                success: false,
                message: "Athlete not found"
            });
        }

        const matchPerformances =
            await MatchPerformance.find({
                athleteId
            }).sort({ matchDate: -1 });

        const trainingPerformances =
            await TrainingPerformance.find({
                athleteId
            }).sort({ trainingDate: -1 });

        const prediction =
            await predictMatchPerformance(
                matchPerformances,
                trainingPerformances,
                fitnessStatus || "FIT",
                opponent || null
            );

        res.status(200).json({
            success: true,
            athlete: {
                id: athlete._id,
                name: athlete.name,
                position: athlete.position
            },
            prediction: prediction.data
        });
    } catch (error) {
        console.error(
            "Match performance prediction error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to predict match performance",
            error: error.message
        });
    }
};

// Individual Position Analytics
const analyzeAthletePosition = async (req, res) => {
    try {
        const athleteId = req.params.athleteId;

        const athlete = await Athlete.findById(athleteId);

        if (!athlete) {
            return res.status(404).json({
                success: false,
                message: "Athlete not found"
            });
        }

        const assessment =
            await Assessment.findOne({
                athleteId
            }).sort({ assessmentDate: -1 });

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message:
                    "No assessment data found for this athlete"
            });
        }

        const athleteData = {};

        const assessmentFields = [
            "lowerBodyStrength",
            "coreStrength",
            "sprint20m",
            "sprint50m",
            "agility505",
            "verticalJump",
            "aerobicCapacity",
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
            "weakFootUsage",
            "offBallMovement",
            "decisionMaking",
            "positionalDiscipline",
            "criticalThinking",
            "hsrDistance",
            "sprintCount1H",
            "sprintCount2H",
            "hrRecovery"
        ];

        assessmentFields.forEach((field) => {
            if (
                assessment[field] &&
                assessment[field].score !== undefined
            ) {
                athleteData[field] =
                    assessment[field].score;
            }
        });

        const analysis = await analyzePosition(
            athleteData,
            athlete.position
        );

        // Save ML position analysis to athlete profile
        if (analysis?.data) {
           athlete.bestPosition = analysis.data.bestPosition || athlete.bestPosition;
           athlete.secondaryPositions = analysis.data.secondaryPositions || [];
           await athlete.save();
        }

        res.status(200).json({
            success: true,
            athlete: {
                id: athlete._id,
                name: athlete.name,
                currentPosition: athlete.position
            },
            analysis: analysis.data
        });
    } catch (error) {
        console.error(
            "Athlete position analysis error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to analyze athlete position",
            error: error.message
        });
    }
};

// Team Position Analytics
const analyzeTeamPositions = async (req, res) => {
    try {
        const athletes = await Athlete.find({
            isActive: true
        }).sort({ name: 1 });

        if (athletes.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No active athletes found"
            });
        }

        const athleteData = [];

        const assessmentFields = [
            "lowerBodyStrength",
            "coreStrength",
            "sprint20m",
            "sprint50m",
            "agility505",
            "verticalJump",
            "aerobicCapacity",
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
            "weakFootUsage",
            "offBallMovement",
            "decisionMaking",
            "positionalDiscipline",
            "criticalThinking",
            "hsrDistance",
            "sprintCount1H",
            "sprintCount2H",
            "hrRecovery"
        ];

        for (const athlete of athletes) {
            const assessment =
                await Assessment.findOne({
                    athleteId: athlete._id
                }).sort({ assessmentDate: -1 });

            if (!assessment) {
                continue;
            }

            const assessmentData = {};

            assessmentFields.forEach((field) => {
                if (
                    assessment[field] &&
                    assessment[field].score !== undefined
                ) {
                    assessmentData[field] =
                        assessment[field].score;
                }
            });

            athleteData.push({
                athleteId: athlete._id,
                name: athlete.name,

                currentPosition:
                    athlete.position || null,

                bestPosition:
                    athlete.bestPosition || null,

                secondaryPositions:
                    athlete.secondaryPositions || [],

                athleteData: assessmentData
            });
        }

        if (athleteData.length === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "No athlete assessment data available"
            });
        }

        const analysis =
            await analyzeTeamPositionsService(
                athleteData
            );

        /*
         * ML service returns an array:
         *
         * [
         *   {
         *      position: "GK",
         *      bestPlayer: {
         *          athleteId,
         *          name,
         *          compatibilityScore,
         *          currentPosition
         *      }
         *   }
         * ]
         *
         * Add the athlete's database position information
         * to each bestPlayer returned by the ML model.
         */

        const enrichedAnalysis =
            Array.isArray(analysis.data)
                ? analysis.data.map((positionResult) => {

                      if (
                          !positionResult?.bestPlayer
                      ) {
                          return positionResult;
                      }

                      const bestPlayerId =
                          positionResult.bestPlayer
                              .athleteId;

                      const athlete =
                          athleteData.find(
                              (item) =>
                                  item.athleteId.toString() ===
                                  bestPlayerId.toString()
                          );

                      if (!athlete) {
                          return positionResult;
                      }

                      return {
                          ...positionResult,

                          bestPlayer: {
                              ...positionResult.bestPlayer,

                              currentPosition:
                                  athlete.currentPosition,

                              bestPosition:
                                  athlete.bestPosition,

                              secondaryPositions:
                                  athlete.secondaryPositions
                          }
                      };
                  })
                : [];

        res.status(200).json({
            success: true,
            athleteCount: athleteData.length,
            analysis: enrichedAnalysis
        });

    } catch (error) {
        console.error(
            "Team position analysis error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to analyze team positions",
            error: error.message
        });
    }
};

module.exports = {
    analyzeAthletePerformance,
    predictAthleteMatchPerformance,
    analyzeAthletePosition,
    analyzeTeamPositions
};