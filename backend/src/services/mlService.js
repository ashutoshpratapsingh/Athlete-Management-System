const axios = require("axios");

const ML_SERVICE_URL = "http://127.0.0.1:5001";


// ========================================
// Performance Analytics
// ========================================

const analyzePerformance = async (
    matchPerformances,
    trainingPerformances,
    assessment
) => {
    try {
        const response = await axios.post(
            `${ML_SERVICE_URL}/api/performance/analyze`,
            {
                matchPerformances,
                trainingPerformances,
                assessment
            }
        );

        return response.data;

    } catch (error) {
        console.error(
            "Performance Analytics ML error:",
            error.response?.data || error.message
        );

        throw new Error(
            "Performance Analytics service is unavailable"
        );
    }
};


// ========================================
// Match Performance Prediction
// ========================================

const predictMatchPerformance = async (
    matchPerformances,
    trainingPerformances,
    fitnessStatus,
    opponent
) => {
    try {
        const response = await axios.post(
            `${ML_SERVICE_URL}/api/performance/predict`,
            {
                matchPerformances,
                trainingPerformances,
                fitnessStatus,
                opponent
            }
        );

        return response.data;

    } catch (error) {
        console.error(
            "Match Prediction ML error:",
            error.response?.data || error.message
        );

        throw new Error(
            "Match Prediction service is unavailable"
        );
    }
};


// ========================================
// Individual Position Analytics
// ========================================

const analyzePosition = async (
    athleteData,
    currentPosition
) => {
    try {
        const response = await axios.post(
            `${ML_SERVICE_URL}/api/position/analyze`,
            {
                athleteData,
                currentPosition
            }
        );

        return response.data;

    } catch (error) {
        console.error(
            "Position Analytics ML error:",
            error.response?.data || error.message
        );

        throw new Error(
            "Position Analytics service is unavailable"
        );
    }
};


// ========================================
// Team Position Analytics
// ========================================

const analyzeTeamPositions = async (
    athletes
) => {
    try {
        const response = await axios.post(
            `${ML_SERVICE_URL}/api/position/team-analyze`,
            {
                athletes
            }
        );

        return response.data;

    } catch (error) {
        console.error(
            "Team Position Analytics ML error:",
            error.response?.data || error.message
        );

        throw new Error(
            "Team Position Analytics service is unavailable"
        );
    }
};


module.exports = {
    analyzePerformance,
    predictMatchPerformance,
    analyzePosition,
    analyzeTeamPositions
};