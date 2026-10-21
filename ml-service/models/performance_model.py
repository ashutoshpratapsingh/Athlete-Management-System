import pandas as pd
import numpy as np


def calculate_performance_score(match_data, training_data):
    """
    Calculate an overall performance score using
    match and training performance data.

    Also identifies specific strengths and areas
    that need improvement from available metrics.
    """

    match_df = pd.DataFrame(match_data)
    training_df = pd.DataFrame(training_data)

    # -----------------------------
    # Match Performance
    # -----------------------------

    match_score = 0

    if not match_df.empty:
        ratings = pd.to_numeric(
            match_df.get("performanceRating"),
            errors="coerce"
        ).dropna()

        if not ratings.empty:
            match_score = ratings.mean() * 10

    # -----------------------------
    # Training Performance
    # -----------------------------

    training_score = 0

    if not training_df.empty:
        fitness_ratings = pd.to_numeric(
            training_df.get("fitnessRating"),
            errors="coerce"
        ).dropna()

        coach_ratings = pd.to_numeric(
            training_df.get("coachRating"),
            errors="coerce"
        ).dropna()

        scores = []

        if not fitness_ratings.empty:
            scores.append(fitness_ratings.mean())

        if not coach_ratings.empty:
            scores.append(coach_ratings.mean())

        if scores:
            training_score = np.mean(scores) * 10

    # -----------------------------
    # Overall Score
    # -----------------------------

    available_scores = [
        score
        for score in [match_score, training_score]
        if score > 0
    ]

    if available_scores:
        overall_score = round(
            np.mean(available_scores),
            2
        )
    else:
        overall_score = 0

    # -----------------------------
    # Strengths & Weaknesses
    # -----------------------------

    strengths = []
    weaknesses = []

    # Match performance
    if match_score >= 80:
        strengths.append("Excellent match performance")
    elif match_score >= 70:
        strengths.append("Strong match performance")
    elif match_score > 0 and match_score < 60:
        weaknesses.append(
            "Match performance needs improvement"
        )

    # Training performance
    if training_score >= 80:
        strengths.append("Excellent training performance")
    elif training_score >= 70:
        strengths.append("Good training performance")
    elif training_score > 0 and training_score < 60:
        weaknesses.append(
            "Training performance needs improvement"
        )

    # Fitness rating
    if not training_df.empty:
        fitness_ratings = pd.to_numeric(
            training_df.get("fitnessRating"),
            errors="coerce"
        ).dropna()

        if not fitness_ratings.empty:
            average_fitness = fitness_ratings.mean()

            if average_fitness >= 8:
                strengths.append("Strong training fitness")
            elif average_fitness < 7:
                weaknesses.append(
                    "Training fitness needs improvement"
                )

    # Coach rating
    if not training_df.empty:
        coach_ratings = pd.to_numeric(
            training_df.get("coachRating"),
            errors="coerce"
        ).dropna()

        if not coach_ratings.empty:
            average_coach_rating = coach_ratings.mean()

            if average_coach_rating >= 8:
                strengths.append("Strong coach evaluation")
            elif average_coach_rating < 7:
                weaknesses.append(
                    "Coach evaluation indicates room for improvement"
                )

    # Passing accuracy
    if not training_df.empty:
        passing_accuracy = pd.to_numeric(
            training_df.get("passingAccuracy"),
            errors="coerce"
        ).dropna()

        if not passing_accuracy.empty:
            average_passing = passing_accuracy.mean()

            if average_passing >= 85:
                strengths.append("High passing accuracy")
            elif average_passing < 75:
                weaknesses.append(
                    "Passing accuracy needs improvement"
                )

    # Shooting accuracy
    if not training_df.empty:
        shooting_accuracy = pd.to_numeric(
            training_df.get("shootingAccuracy"),
            errors="coerce"
        ).dropna()

        if not shooting_accuracy.empty:
            average_shooting = shooting_accuracy.mean()

            if average_shooting >= 85:
                strengths.append("High shooting accuracy")
            elif average_shooting < 75:
                weaknesses.append(
                    "Shooting accuracy needs improvement"
                )

    # Workload / intensity
    if not training_df.empty:
        intensity = pd.to_numeric(
            training_df.get("intensity"),
            errors="coerce"
        ).dropna()

        if not intensity.empty:
            average_intensity = intensity.mean()

            if average_intensity >= 8:
                strengths.append("Strong training intensity")
            elif average_intensity < 6:
                weaknesses.append(
                    "Training intensity could be improved"
                )

    # Overall performance
    if overall_score >= 85:
        strengths.append("Excellent overall performance")
    elif overall_score >= 70:
        strengths.append("Good overall performance")
    elif overall_score > 0 and overall_score < 60:
        weaknesses.append(
            "Overall performance requires improvement"
        )

    # Remove duplicate messages
    strengths = list(dict.fromkeys(strengths))
    weaknesses = list(dict.fromkeys(weaknesses))

    # -----------------------------
    # Performance Trend
    # -----------------------------

    trend = "Insufficient data"

    if not match_df.empty:
        ratings = pd.to_numeric(
            match_df.get("performanceRating"),
            errors="coerce"
        ).dropna()

        if len(ratings) >= 2:

            recent = ratings.iloc[:3].mean()

            if len(ratings) > 3:
                previous = ratings.iloc[3:].mean()
            else:
                previous = ratings.iloc[-1]

            if recent > previous + 0.3:
                trend = "Improving"
            elif recent < previous - 0.3:
                trend = "Declining"
            else:
                trend = "Stable"

    # -----------------------------
    # Return Analysis
    # -----------------------------

    return {
        "overallScore": overall_score,
        "matchScore": round(match_score, 2),
        "trainingScore": round(training_score, 2),
        "strengths": strengths,
        "weaknesses": weaknesses,
        "trend": trend
    }