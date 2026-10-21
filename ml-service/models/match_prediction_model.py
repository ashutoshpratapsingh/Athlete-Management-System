import pandas as pd
import numpy as np


def predict_match_performance(
    match_data,
    training_data,
    fitness_status="FIT",
    opponent=None
):
    """
    Predict an athlete's likely performance
    in an upcoming match using recent match form,
    training performance, fitness status and opponent.
    """

    match_df = pd.DataFrame(match_data)
    training_df = pd.DataFrame(training_data)

    # --------------------------------
    # Recent Match Performance
    # --------------------------------

    recent_rating = 0

    if not match_df.empty:
        ratings = pd.to_numeric(
            match_df.get("performanceRating"),
            errors="coerce"
        ).dropna()

        if not ratings.empty:
            recent_ratings = ratings.iloc[:5]
            recent_rating = recent_ratings.mean()

    # --------------------------------
    # Training Performance
    # --------------------------------

    training_rating = 0

    if not training_df.empty:
        fitness = pd.to_numeric(
            training_df.get("fitnessRating"),
            errors="coerce"
        ).dropna()

        coach = pd.to_numeric(
            training_df.get("coachRating"),
            errors="coerce"
        ).dropna()

        values = []

        if not fitness.empty:
            values.append(fitness.mean())

        if not coach.empty:
            values.append(coach.mean())

        if values:
            training_rating = np.mean(values)

    # --------------------------------
    # Base Prediction
    # --------------------------------

    scores = []

    if recent_rating > 0:
        scores.append(recent_rating)

    if training_rating > 0:
        scores.append(training_rating)

    if scores:
        predicted_rating = np.mean(scores)
    else:
        predicted_rating = 0

    # --------------------------------
    # Recent Form Adjustment
    # --------------------------------

    form_adjustment = 0

    if recent_rating >= 8:
        form_adjustment = 0.3
    elif recent_rating >= 7:
        form_adjustment = 0.15
    elif recent_rating > 0 and recent_rating < 6:
        form_adjustment = -0.3

    predicted_rating += form_adjustment

    # --------------------------------
    # Opponent Adjustment
    # --------------------------------
    #
    # At this stage we do not have
    # historical opponent-specific data.
    #
    # Therefore opponent is used only
    # as a contextual input, not as a
    # fabricated historical statistic.
    #
    # This keeps the prediction honest
    # until real opponent history exists.

    opponent_context = (
        opponent.strip()
        if isinstance(opponent, str) and opponent.strip()
        else None
    )

    # --------------------------------
    # Fitness Adjustment
    # --------------------------------

    normalized_fitness = (
        fitness_status.upper().strip()
        if isinstance(fitness_status, str)
        else "FIT"
    )

    if normalized_fitness == "FIT":
        fitness_adjustment = 0

    elif normalized_fitness == "LIMITED":
        fitness_adjustment = -0.5

    elif normalized_fitness == "INJURED":
        fitness_adjustment = -2

    else:
        fitness_adjustment = 0

    predicted_rating += fitness_adjustment

    # --------------------------------
    # Training Readiness Adjustment
    # --------------------------------

    if training_rating >= 8:
        predicted_rating += 0.2

    elif training_rating > 0 and training_rating < 6:
        predicted_rating -= 0.2

    # --------------------------------
    # Keep Rating Between 0 and 10
    # --------------------------------

    predicted_rating = max(
        0,
        min(10, predicted_rating)
    )

    predicted_rating = round(
        predicted_rating,
        2
    )

    # --------------------------------
    # Contribution Probability
    # --------------------------------

    contribution_probability = round(
        (predicted_rating / 10) * 100,
        2
    )

    # --------------------------------
    # Match Readiness
    # --------------------------------

    if normalized_fitness == "INJURED":
        match_readiness = "Not Ready"

    elif normalized_fitness == "LIMITED":
        match_readiness = "Partially Ready"

    elif predicted_rating >= 8:
        match_readiness = "Highly Ready"

    elif predicted_rating >= 6:
        match_readiness = "Ready"

    else:
        match_readiness = "Needs Improvement"

    # --------------------------------
    # Prediction Confidence
    # --------------------------------

    data_sources = 0

    if recent_rating > 0:
        data_sources += 1

    if training_rating > 0:
        data_sources += 1

    if data_sources == 2:
        prediction_confidence = "High"

    elif data_sources == 1:
        prediction_confidence = "Moderate"

    else:
        prediction_confidence = "Low"

    # --------------------------------
    # Prediction Factors
    # --------------------------------

    factors = []

    if recent_rating >= 7:
        factors.append("Strong recent match form")
    elif recent_rating > 0 and recent_rating < 6:
        factors.append("Recent match form needs improvement")

    if training_rating >= 8:
        factors.append("Strong training performance")
    elif training_rating > 0 and training_rating < 6:
        factors.append("Training performance needs improvement")

    if normalized_fitness == "FIT":
        factors.append("Athlete is fully fit")

    elif normalized_fitness == "LIMITED":
        factors.append("Limited fitness may affect performance")

    elif normalized_fitness == "INJURED":
        factors.append("Current injury significantly affects readiness")

    if opponent_context:
        factors.append(
            f"Prediction prepared for {opponent_context}"
        )

    # --------------------------------
    # Return Prediction
    # --------------------------------

    return {
        "opponent": opponent_context,
        "predictedPerformanceRating": predicted_rating,
        "contributionProbability": contribution_probability,
        "matchReadiness": match_readiness,
        "recentFormRating": round(recent_rating, 2),
        "trainingRating": round(training_rating, 2),
        "predictionConfidence": prediction_confidence,
        "predictionFactors": factors
    }