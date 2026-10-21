import pandas as pd


# ========================================
# Position Requirements
# ========================================

POSITION_REQUIREMENTS = {

    "GK": {
        "verticalJump": 0.15,
        "aerobicCapacity": 0.10,
        "decisionMaking": 0.20,
        "positionalDiscipline": 0.20,
        "criticalThinking": 0.15,
        "rightFootControl": 0.10,
        "leftFootControl": 0.10
    },

    "CB": {
        "lowerBodyStrength": 0.15,
        "aerobicCapacity": 0.10,
        "heading": 0.15,
        "tackling": 0.20,
        "positionalDiscipline": 0.20,
        "decisionMaking": 0.10,
        "longPassing": 0.10
    },

    "FB": {
        "sprint20m": 0.15,
        "agility505": 0.15,
        "aerobicCapacity": 0.15,
        "crossing": 0.15,
        "tackling": 0.10,
        "offBallMovement": 0.15,
        "positionalDiscipline": 0.15
    },

    "CM": {
        "aerobicCapacity": 0.15,
        "shortPassing": 0.15,
        "longPassing": 0.10,
        "firstTouch": 0.10,
        "decisionMaking": 0.20,
        "criticalThinking": 0.15,
        "offBallMovement": 0.15
    },

    "AM": {
        "firstTouch": 0.15,
        "shortPassing": 0.15,
        "dribbling": 0.15,
        "shootingAccuracy": 0.10,
        "decisionMaking": 0.20,
        "offBallMovement": 0.15,
        "criticalThinking": 0.10
    },

    "Winger": {
        "sprint20m": 0.15,
        "agility505": 0.15,
        "dribbling": 0.20,
        "crossing": 0.15,
        "offBallMovement": 0.15,
        "shootingAccuracy": 0.10,
        "weakFootUsage": 0.10
    },

    "ST": {
        "shootingPower": 0.15,
        "shootingAccuracy": 0.20,
        "dribbling": 0.10,
        "heading": 0.10,
        "offBallMovement": 0.15,
        "decisionMaking": 0.15,
        "lowerBodyStrength": 0.15
    }
}


# ========================================
# Single Athlete Position Compatibility
# ========================================

def calculate_position_compatibility(
    athlete_data,
    position
):
    """
    Calculate how suitable an athlete is
    for a particular football position.
    """

    requirements = POSITION_REQUIREMENTS.get(position)

    if not requirements:
        return 0


    weighted_scores = []
    total_weight = 0


    for attribute, weight in requirements.items():

        value = athlete_data.get(attribute)

        if value is None:
            continue

        try:
            value = float(value)
        except (ValueError, TypeError):
            continue


        # Keep score between 0 and 100
        value = max(0, min(100, value))


        weighted_scores.append(
            value * weight
        )

        total_weight += weight


    if total_weight == 0:
        return 0


    # Normalize when some attributes are missing
    score = sum(weighted_scores) / total_weight


    return round(score, 2)


# ========================================
# Analyze One Athlete
# ========================================

def analyze_best_position(
    athlete_data,
    current_position=None
):
    """
    Determine the best-suited position
    and secondary positions for one athlete.

    Rules:
    - Highest compatibility score = Best Position
    - Other positions with score >= 75 = Secondary Positions
    - All position scores are returned for the compatibility profile
    """

    position_scores = {}

    # Calculate compatibility for every position
    for position in POSITION_REQUIREMENTS:

        score = calculate_position_compatibility(
            athlete_data,
            position
        )

        position_scores[position] = score

    # Sort positions from highest compatibility to lowest
    sorted_positions = sorted(
        position_scores.items(),
        key=lambda item: item[1],
        reverse=True
    )

    if not sorted_positions:
        return {
            "bestPosition": None,
            "compatibilityScore": 0,
            "secondaryPositions": [],
            "positionScores": {},
            "currentPosition": current_position
        }

    # ----------------------------------------
    # Best Position
    # ----------------------------------------

    best_position = sorted_positions[0][0]
    best_score = sorted_positions[0][1]

    # ----------------------------------------
    # Secondary Positions
    # ----------------------------------------
    # Any other position with compatibility
    # of 75% or higher is considered suitable
    # as a secondary position.

    secondary_positions = [
        position
        for position, score in sorted_positions[1:]
        if score >= 75
    ]

    return {
        "bestPosition": best_position,
        "compatibilityScore": best_score,
        "secondaryPositions": secondary_positions,
        "positionScores": position_scores,
        "currentPosition": current_position
    }


# ========================================
# Team Position Analytics
# ========================================

def analyze_team_positions(athletes):
    """
    Compare multiple athletes and identify
    the best player for each position.
    """

    if not athletes:
        return []


    position_results = []


    for position in POSITION_REQUIREMENTS:

        player_scores = []


        for athlete in athletes:

            athlete_data = athlete.get(
                "athleteData",
                {}
            )

            score = calculate_position_compatibility(
                athlete_data,
                position
            )


            if score > 0:

                player_scores.append({
                    "athleteId": athlete.get("athleteId"),
                    "name": athlete.get("name"),
                    "currentPosition": athlete.get(
                        "currentPosition"
                    ),
                    "compatibilityScore": score
                })


        # Highest compatibility first
        player_scores.sort(
            key=lambda player:
            player["compatibilityScore"],
            reverse=True
        )


        if player_scores:

            best_player = player_scores[0]

            position_results.append({
                "position": position,
                "bestPlayer": best_player,
                "rankedPlayers": player_scores
            })


    return position_results