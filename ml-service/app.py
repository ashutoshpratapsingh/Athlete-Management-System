from flask import Flask, request, jsonify

from models.performance_model import calculate_performance_score
from models.match_prediction_model import predict_match_performance
from models.position_analytics_model import (
    analyze_best_position,
    analyze_team_positions
)


app = Flask(__name__)


# ========================================
# Home
# ========================================

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "success": True,
        "message": "AMS ML Service is running"
    })


# ========================================
# Performance Analytics
# ========================================

@app.route("/api/performance/analyze", methods=["POST"])
def analyze_performance():

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "Request body is required"
            }), 400

        match_data = data.get(
            "matchPerformances",
            []
        )

        training_data = data.get(
            "trainingPerformances",
            []
        )

        result = calculate_performance_score(
            match_data,
            training_data
        )

        return jsonify({
            "success": True,
            "data": result
        }), 200

    except Exception as error:

        print(
            "Performance analysis error:",
            str(error)
        )

        return jsonify({
            "success": False,
            "message": "Failed to analyze performance",
            "error": str(error)
        }), 500


# ========================================
# Match Performance Prediction
# ========================================

@app.route("/api/performance/predict", methods=["POST"])
def predict_performance():

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "Request body is required"
            }), 400

        match_data = data.get(
            "matchPerformances",
            []
        )

        training_data = data.get(
            "trainingPerformances",
            []
        )

        fitness_status = data.get(
            "fitnessStatus",
            "FIT"
        )

        opponent = data.get(
            "opponent"
        )

        result = predict_match_performance(
            match_data,
            training_data,
            fitness_status,
            opponent
        )

        return jsonify({
            "success": True,
            "data": result
        }), 200

    except Exception as error:

        print(
            "Match prediction error:",
            str(error)
        )

        return jsonify({
            "success": False,
            "message": "Failed to predict match performance",
            "error": str(error)
        }), 500


# ========================================
# Individual Position Analytics
# ========================================

@app.route("/api/position/analyze", methods=["POST"])
def analyze_position():

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "Request body is required"
            }), 400


        athlete_data = data.get(
            "athleteData",
            {}
        )

        current_position = data.get(
            "currentPosition"
        )


        result = analyze_best_position(
            athlete_data,
            current_position
        )


        return jsonify({
            "success": True,
            "data": result
        }), 200


    except Exception as error:

        print(
            "Position analytics error:",
            str(error)
        )

        return jsonify({
            "success": False,
            "message": "Failed to analyze position",
            "error": str(error)
        }), 500


# ========================================
# Team Position Analytics
# ========================================

@app.route("/api/position/team-analyze", methods=["POST"])
def analyze_team_position():

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "Request body is required"
            }), 400


        athletes = data.get(
            "athletes",
            []
        )


        if not athletes:
            return jsonify({
                "success": False,
                "message": "Athlete data is required"
            }), 400


        result = analyze_team_positions(
            athletes
        )


        return jsonify({
            "success": True,
            "count": len(result),
            "data": result
        }), 200


    except Exception as error:

        print(
            "Team position analytics error:",
            str(error)
        )

        return jsonify({
            "success": False,
            "message": "Failed to analyze team positions",
            "error": str(error)
        }), 500


# ========================================
# Start ML Service
# ========================================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5001,
        debug=True
    )