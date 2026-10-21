import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

const positionCoordinates = {
    GK: { left: "8%", top: "50%" },

    LB: { left: "22%", top: "76%" },
    CB1: { left: "22%", top: "40%" },
    CB2: { left: "22%", top: "60%" },
    RB: { left: "22%", top: "24%" },

    CM1: { left: "45%", top: "35%" },
    CM2: { left: "45%", top: "65%" },

    LW: { left: "68%", top: "78%" },
    RW: { left: "68%", top: "22%" },

    AM: { left: "75%", top: "50%" },
    ST: { left: "90%", top: "50%" }
};


function normalizePosition(position) {

    if (!position) {
        return "CM";
    }

    const value =
        position.toLowerCase();

    if (
        value === "goalkeeper" ||
        value === "gk"
    ) {
        return "GK";
    }

    if (
        value === "centre back" ||
        value === "center back" ||
        value === "cb"
    ) {
        return "CB";
    }

    if (
        value === "left back" ||
        value === "lb"
    ) {
        return "LB";
    }

    if (
        value === "right back" ||
        value === "rb"
    ) {
        return "RB";
    }

    if (
        value === "winger" ||
        value === "left winger" ||
        value === "right winger" ||
        value === "lw" ||
        value === "rw"
    ) {
        return "WINGER";
    }

    if (
        value === "attacking midfielder" ||
        value === "am"
    ) {
        return "AM";
    }

    if (
        value === "striker" ||
        value === "st" ||
        value === "forward"
    ) {
        return "ST";
    }

    if (
        value === "central midfielder" ||
        value === "cm" ||
        value === "midfielder"
    ) {
        return "CM";
    }

    return "CM";
}


function CoachDashboard() {

    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("ams_user") || "{}"
    );

    const token =
        localStorage.getItem("ams_token");


    /* ================================
       ATHLETE STATE
    ================================= */

    const [athletes, setAthletes] =
        useState([]);

    const [selectedPlayers, setSelectedPlayers] =
        useState([]);

    const [selectedPlayerId, setSelectedPlayerId] =
        useState("");


    /* ================================
       PLAYER PERFORMANCE STATE
    ================================= */

    const [playerPerformance, setPlayerPerformance] =
        useState(null);

    const [loadingPerformance, setLoadingPerformance] =
        useState(false);


    /* ================================
       SQUAD STATE
    ================================= */

    const [searchTerm, setSearchTerm] =
        useState("");

    const [showSquadSelector, setShowSquadSelector] =
        useState(false);


    /* ================================
       PAGE STATE
    ================================= */

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    /* ================================
       LOAD ATHLETES
    ================================= */

    useEffect(() => {

        loadAthletes();

    }, []);


    const loadAthletes = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await axios.get(
                    `${API_URL}/athletes`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            const data =
                response.data.data || [];

            setAthletes(data);


            /*
             * Only active athletes are
             * initially placed on the field.
             *
             * Even if AMS eventually has
             * 1000+ athletes, only 11 appear
             * on the field.
             */

            const activePlayers =
                data.filter(
                    (athlete) =>
                        athlete.isActive !== false
                );

            const initialSquad =
                activePlayers.slice(0, 11);

            setSelectedPlayers(
                initialSquad
            );


            if (
                initialSquad.length > 0
            ) {

                setSelectedPlayerId(
                    initialSquad[0]._id
                );

            }

        } catch (error) {

            console.error(
                "Failed to load athletes:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load athletes"
            );

        } finally {

            setLoading(false);

        }

    };


    /* ================================
       SELECTED PLAYER
    ================================= */

    const selectedPlayer =
        selectedPlayers.find(
            (player) =>
                player._id ===
                selectedPlayerId
        ) ||
        selectedPlayers[0] ||
        null;


    /* ================================
       LOAD PLAYER PERFORMANCE
    ================================= */

    useEffect(() => {

        if (
            selectedPlayerId
        ) {

            loadPlayerPerformance(
                selectedPlayerId
            );

        } else {

            setPlayerPerformance(
                null
            );

        }

    }, [selectedPlayerId]);


    const loadPlayerPerformance =
        async (athleteId) => {

            try {

                setLoadingPerformance(
                    true
                );

                const config = {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                };


                const [
                    matchResponse,
                    trainingResponse,
                    mlResponse
                ] = await Promise.all([

                    axios.get(
                        `${API_URL}/match-performances/athlete/${athleteId}`,
                        config
                    ),

                    axios.get(
                        `${API_URL}/training-performances/athlete/${athleteId}`,
                        config
                    ),

                    axios.post(
                        `${API_URL}/ml/performance/${athleteId}`,
                        {},
                        config
                    )

                ]);


                setPlayerPerformance({

                    matches:
                        matchResponse.data.data ||
                        [],

                    training:
                        trainingResponse.data.data ||
                        [],

                    ml:
                        mlResponse.data.analysis ||
                        {}

                });

            } catch (error) {

                console.error(
                    "Failed to load player performance:",
                    error
                );

                setPlayerPerformance(
                    null
                );

            } finally {

                setLoadingPerformance(
                    false
                );

            }

        };


    /* ================================
       SEARCH
    ================================= */

    const filteredAthletes =
        useMemo(() => {

            const search =
                searchTerm
                    .trim()
                    .toLowerCase();

            if (!search) {

                return athletes;

            }

            return athletes.filter(
                (athlete) =>
                    athlete.name
                        ?.toLowerCase()
                        .includes(search) ||

                    athlete.position
                        ?.toLowerCase()
                        .includes(search) ||

                    athlete.club
                        ?.toLowerCase()
                        .includes(search)
            );

        }, [
            athletes,
            searchTerm
        ]);


    /* ================================
       SQUAD SELECTION
    ================================= */

    const togglePlayer =
        (athlete) => {

            const exists =
                selectedPlayers.some(
                    (player) =>
                        player._id ===
                        athlete._id
                );


            if (exists) {

                const updated =
                    selectedPlayers.filter(
                        (player) =>
                            player._id !==
                            athlete._id
                    );

                setSelectedPlayers(
                    updated
                );


                if (
                    selectedPlayerId ===
                    athlete._id
                ) {

                    setSelectedPlayerId(
                        updated[0]?._id ||
                        ""
                    );

                }

                return;

            }


            if (
                selectedPlayers.length >=
                11
            ) {

                return;

            }


            setSelectedPlayers([
                ...selectedPlayers,
                athlete
            ]);

        };


    /* ================================
       FIELD POSITION
    ================================= */

    const getPlayerCoordinates =
        (player, index) => {

            const position =
                normalizePosition(
                    player.position
                );


            const playersAtPosition =
                selectedPlayers.filter(
                    (item) =>
                        normalizePosition(
                            item.position
                        ) === position
                );


            const positionIndex =
                playersAtPosition.findIndex(
                    (item) =>
                        item._id ===
                        player._id
                );


            if (
                position === "GK"
            ) {

                return positionCoordinates.GK;

            }


            if (
                position === "ST"
            ) {

                return {

                    ...positionCoordinates.ST,

                    top:
                        playersAtPosition.length ===
                        1

                            ? "50%"

                            : positionIndex ===
                              0

                            ? "38%"

                            : "62%"

                };

            }


            if (
                position ===
                "WINGER"
            ) {

                return positionIndex %
                    2 ===
                    0

                    ? positionCoordinates.LW

                    : positionCoordinates.RW;

            }


            if (
                position === "CM"
            ) {

                return positionIndex %
                    2 ===
                    0

                    ? positionCoordinates.CM1

                    : positionCoordinates.CM2;

            }


            if (
                position === "CB"
            ) {

                return positionIndex %
                    2 ===
                    0

                    ? positionCoordinates.CB1

                    : positionCoordinates.CB2;

            }


            if (
                position === "LB"
            ) {

                return positionCoordinates.LB;

            }


            if (
                position === "RB"
            ) {

                return positionCoordinates.RB;

            }


            if (
                position === "AM"
            ) {

                return positionCoordinates.AM;

            }


            return {

                left:
                    `${25 + index * 6}%`,

                top: "50%"

            };

        };


    /* ================================
       RENDER
    ================================= */

    return (

        <DashboardLayout>


            {/* ============================
                HEADER
            ============================= */}

            <div className="dashboard-header">

                <div>

                    <span className="dashboard-eyebrow">
                        PERFORMANCE MANAGEMENT
                    </span>

                    <h1>
                        Welcome Coach!
                    </h1>

                    <p>
                        Monitor your squad,
                        sessions and athlete
                        performance from one
                        place.
                    </p>

                </div>


                <div className="dashboard-date">

                    {user.name ||
                        "COACH"}

                </div>

            </div>


            {/* ERROR */}

            {error && (

                <div className="dashboard-error">

                    {error}

                </div>

            )}


            {/* ============================
                MAIN DASHBOARD
            ============================= */}

            <div className="coach-dashboard-main">


                {/* ========================
                    FIELD OVERVIEW
                ========================= */}

                <section className="dashboard-panel field-overview-panel">


                    <div className="panel-header">

                        <div>

                            <span className="panel-eyebrow">
                                TEAM MANAGEMENT
                            </span>

                            <h2>
                                Field Overview
                            </h2>

                        </div>


                        <div className="field-controls">

                            <span className="field-control">
                                Football Field
                            </span>

                            <span className="field-control">

                                {
                                    selectedPlayers.length
                                }

                                / 11 Players

                            </span>

                        </div>

                    </div>


                    {/* FIELD */}

                    <div className="football-field">

                        <div className="field-line field-halfway" />

                        <div className="field-line field-center-circle" />

                        <div className="field-line field-center-dot" />

                        <div className="field-box field-left-box" />

                        <div className="field-box field-right-box" />

                        <div className="field-goal field-left-goal" />

                        <div className="field-goal field-right-goal" />


                        {loading ? (

                            <div className="field-loading">

                                Loading squad...

                            </div>

                        ) : selectedPlayers.length === 0 ? (

                            <div className="field-loading">

                                No players selected

                            </div>

                        ) : (

                            selectedPlayers.map(
                                (player, index) => {

                                    const coordinates =
                                        getPlayerCoordinates(
                                            player,
                                            index
                                        );


                                    const isSelected =
                                        selectedPlayerId ===
                                        player._id;


                                    return (

                                        <button
                                            key={
                                                player._id
                                            }
                                            type="button"
                                            className={
                                                isSelected
                                                    ? "field-player active"
                                                    : "field-player"
                                            }
                                            style={{
                                                left:
                                                    coordinates.left,
                                                top:
                                                    coordinates.top
                                            }}
                                            onClick={() =>
                                                setSelectedPlayerId(
                                                    player._id
                                                )
                                            }
                                        >

                                            <span className="field-player-dot">

                                                {player.name
                                                    ?.charAt(
                                                        0
                                                    )
                                                    .toUpperCase()}

                                            </span>


                                            <span className="field-player-name">

                                                {player.name}

                                            </span>


                                            <span className="field-player-position">

                                                {player.position ||
                                                    "CM"}

                                            </span>

                                        </button>

                                    );

                                }
                            )

                        )}

                    </div>


                    {/* FIELD FOOTER */}

                    <div className="field-footer">

                        <div>

                            <strong>
                                Match / Training Squad
                            </strong>

                            <span>
                                Select up to 11 athletes
                                for the field view.
                            </span>

                        </div>


                        <button
                            type="button"
                            className="primary-button"
                            onClick={() =>
                                setShowSquadSelector(
                                    !showSquadSelector
                                )
                            }
                        >

                            {showSquadSelector
                                ? "Close Squad"
                                : "Select Squad"}

                        </button>

                    </div>


                    {/* SQUAD SELECTOR */}

                    {showSquadSelector && (

                        <div className="squad-selector">


                            <div className="squad-selector-header">

                                <div>

                                    <span className="panel-eyebrow">
                                        ATHLETE SELECTION
                                    </span>

                                    <h3>
                                        Choose Players
                                    </h3>

                                </div>


                                <strong>

                                    {
                                        selectedPlayers.length
                                    }

                                    /11

                                </strong>

                            </div>


                            <input
                                className="squad-search"
                                type="text"
                                placeholder="Search athlete, position or club..."
                                value={
                                    searchTerm
                                }
                                onChange={(event) =>
                                    setSearchTerm(
                                        event.target.value
                                    )
                                }
                            />


                            <div className="squad-player-list">

                                {filteredAthletes.map(
                                    (athlete) => {

                                        const selected =
                                            selectedPlayers.some(
                                                (player) =>
                                                    player._id ===
                                                    athlete._id
                                            );


                                        return (

                                            <button
                                                key={
                                                    athlete._id
                                                }
                                                type="button"
                                                className={
                                                    selected
                                                        ? "squad-player selected"
                                                        : "squad-player"
                                                }
                                                onClick={() =>
                                                    togglePlayer(
                                                        athlete
                                                    )
                                                }
                                            >

                                                <span className="squad-player-avatar">

                                                    {athlete.name
                                                        ?.charAt(
                                                            0
                                                        )
                                                        .toUpperCase()}

                                                </span>


                                                <span className="squad-player-info">

                                                    <strong>
                                                        {
                                                            athlete.name
                                                        }
                                                    </strong>

                                                    <small>

                                                        {
                                                            athlete.position ||
                                                            "Position not set"
                                                        }

                                                        {athlete.club
                                                            ? ` · ${athlete.club}`
                                                            : ""}

                                                    </small>

                                                </span>


                                                <span className="squad-player-check">

                                                    {selected
                                                        ? "✓"
                                                        : "+"}

                                                </span>

                                            </button>

                                        );

                                    }
                                )}

                            </div>

                        </div>

                    )}

                </section>


                {/* ========================
                    PLAYER STATS
                ========================= */}

                <section className="dashboard-panel player-stats-panel">


                    <div className="panel-header">

                        <div>

                            <span className="panel-eyebrow">
                                SELECTED PLAYER
                            </span>

                            <h2>
                                Player's Stats
                            </h2>

                        </div>

                    </div>


                    {selectedPlayer ? (

                        <div className="selected-player-card">


                            {/* PLAYER */}

                            <div className="selected-player-avatar">

                                {selectedPlayer.name
                                    ?.charAt(
                                        0
                                    )
                                    .toUpperCase()}

                            </div>


                            <h3>
                                {selectedPlayer.name}
                            </h3>


                            <span className="selected-player-position">

                                {selectedPlayer.position ||
                                    "Position not set"}

                            </span>


                            {/* BASIC INFORMATION */}

                            <div className="player-basic-grid">


                                <div>

                                    <span>
                                        AGE
                                    </span>

                                    <strong>
                                        {selectedPlayer.age ??
                                            "—"}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        CLUB
                                    </span>

                                    <strong>
                                        {selectedPlayer.club ||
                                            "—"}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        BEST POSITION
                                    </span>

                                    <strong>
                                        {selectedPlayer.bestPosition ||
                                            selectedPlayer.position ||
                                            "—"}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        STATUS
                                    </span>

                                    <strong>

                                        {selectedPlayer.isActive !==
                                        false
                                            ? "Active"
                                            : "Inactive"}

                                    </strong>

                                </div>

                            </div>


                            {/* =====================
                                PERFORMANCE
                            ====================== */}

                            <div className="player-performance-summary">


                                <div className="performance-main-score">

                                    <span>
                                        OVERALL PERFORMANCE
                                    </span>


                                    <strong>

                                        {loadingPerformance
                                            ? "..."
                                            : playerPerformance?.ml
                                                  ?.overallScore !==
                                              undefined

                                            ? Number(
                                                  playerPerformance
                                                      .ml
                                                      .overallScore
                                              ).toFixed(1)

                                            : "—"}

                                    </strong>


                                    <small>
                                        / 100
                                    </small>

                                </div>


                                <div className="performance-mini-grid">


                                    <div>

                                        <span>
                                            MATCH
                                        </span>

                                        <strong>

                                            {loadingPerformance
                                                ? "..."
                                                : playerPerformance?.ml
                                                      ?.matchScore !==
                                                  undefined

                                                ? Number(
                                                      playerPerformance
                                                          .ml
                                                          .matchScore
                                                  ).toFixed(1)

                                                : "—"}

                                        </strong>

                                        <small>
                                            / 100
                                        </small>

                                    </div>


                                    <div>

                                        <span>
                                            TRAINING
                                        </span>

                                        <strong>

                                            {loadingPerformance
                                                ? "..."
                                                : playerPerformance?.ml
                                                      ?.trainingScore !==
                                                  undefined

                                                ? Number(
                                                      playerPerformance
                                                          .ml
                                                          .trainingScore
                                                  ).toFixed(1)

                                                : "—"}

                                        </strong>

                                        <small>
                                            / 100
                                        </small>

                                    </div>

                                </div>


                                {/* TREND */}

                                <div className="performance-trend">

                                    <span>
                                        CURRENT TREND
                                    </span>

                                    <strong>

                                        {loadingPerformance
                                            ? "Loading..."
                                            : playerPerformance?.ml
                                                  ?.trend ||
                                              "—"}

                                    </strong>

                                </div>


                                {/* RECORD COUNTS */}

                                <div className="performance-records">


                                    <div>

                                        <span>
                                            MATCH RECORDS
                                        </span>

                                        <strong>

                                            {
                                                playerPerformance
                                                    ?.matches
                                                    ?.length ||
                                                0
                                            }

                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            TRAINING SESSIONS
                                        </span>

                                        <strong>

                                            {
                                                playerPerformance
                                                    ?.training
                                                    ?.length ||
                                                0
                                            }

                                        </strong>

                                    </div>

                                </div>

                            </div>


                            {/* ACTIONS */}

                            <div className="player-dashboard-actions">


                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            `/athletes/${selectedPlayer._id}`
                                        )
                                    }
                                >

                                    View Full Profile

                                </button>


                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            `/analytics`
                                        )
                                    }
                                >

                                    Performance Analytics

                                </button>

                            </div>

                        </div>

                    ) : (

                        <div className="empty-analytics">

                            <div className="analytics-icon">
                                ◉
                            </div>

                            <h3>
                                Select a player
                            </h3>

                            <p>
                                Click a player on the
                                field to view their
                                information.
                            </p>

                        </div>

                    )}

                </section>

            </div>


            {/* ============================
                QUICK STATS
            ============================= */}

            <div className="dashboard-grid coach-quick-stats">


                <div className="stat-card">

                    <span>
                        Total Athletes
                    </span>

                    <strong>
                        {athletes.length}
                    </strong>

                    <small>
                        Registered in AMS
                    </small>

                </div>


                <div className="stat-card">

                    <span>
                        Active Athletes
                    </span>

                    <strong>

                        {
                            athletes.filter(
                                (athlete) =>
                                    athlete.isActive !==
                                    false
                            ).length
                        }

                    </strong>

                    <small>
                        Available for selection
                    </small>

                </div>


                <div className="stat-card">

                    <span>
                        Current Squad
                    </span>

                    <strong>
                        {selectedPlayers.length}
                    </strong>

                    <small>
                        Players on field
                    </small>

                </div>


                <div className="stat-card">

                    <span>
                        Squad Capacity
                    </span>

                    <strong>
                        11
                    </strong>

                    <small>
                        Maximum field players
                    </small>

                </div>

            </div>

        </DashboardLayout>
    );
}

export default CoachDashboard;