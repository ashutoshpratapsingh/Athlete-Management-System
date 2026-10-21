import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/analytics.css";
import DashboardLayout from "../components/layout/DashboardLayout";

function Analytics() {
    const [analysis, setAnalysis] = useState([]);
    const [athleteCount, setAthleteCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadTeamPositionAnalytics = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.post(
                "/ml/position/team"
            );

            console.log(
                "TEAM POSITION ANALYTICS:",
                response.data
            );

            /*
             * Actual backend response:
             *
             * {
             *   success: true,
             *   athleteCount: 5,
             *   analysis: [...]
             * }
             */

            const result = response.data;

            if (!result || result.success !== true) {
                throw new Error(
                    result?.message ||
                    "Team position analytics failed"
                );
            }

            if (!Array.isArray(result.analysis)) {
                throw new Error(
                    "Invalid analysis data received from ML service"
                );
            }

            setAthleteCount(
                result.athleteCount || 0
            );

            setAnalysis(result.analysis);

        } catch (error) {
            console.error(
                "Team position analytics error:",
                error
            );

            setError(
                error.response?.data?.message ||
                error.message ||
                "Failed to load team position analytics"
            );

            setAnalysis([]);
            setAthleteCount(0);

        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadTeamPositionAnalytics();
    }, []);


    return (
        <DashboardLayout>
        <div className="analytics-page">

            {/* ========================================
                PAGE HEADER
            ======================================== */}

            <div className="analytics-page-header">

                <div>

                    <span className="analytics-eyebrow">
                        TEAM ANALYTICS
                    </span>

                    <h1>
                        Position Analytics
                    </h1>

                    <p>
                        Identify the best-suited player
                        for each playing position.
                    </p>

                </div>


                <button
                    className="analytics-refresh-button"
                    onClick={loadTeamPositionAnalytics}
                    disabled={loading}
                >
                    {loading
                        ? "Analyzing..."
                        : "Refresh Analysis"}
                </button>

            </div>


            {/* ========================================
                LOADING STATE
            ======================================== */}

            {loading && (

                <div className="analytics-state-card">

                    <div className="analytics-loader">
                        Analyzing team positions...
                    </div>

                    <p>
                        The ML model is evaluating the
                        latest assessment data of active
                        athletes.
                    </p>

                </div>

            )}


            {/* ========================================
                ERROR STATE
            ======================================== */}

            {!loading && error && (

                <div className="analytics-state-card analytics-error-card">

                    <strong>
                        Unable to load analytics
                    </strong>

                    <p>
                        {error}
                    </p>

                    <button
                        className="analytics-retry-button"
                        onClick={loadTeamPositionAnalytics}
                    >
                        Try Again
                    </button>

                </div>

            )}


            {/* ========================================
                SUCCESSFUL ANALYSIS
            ======================================== */}

            {!loading &&
                !error &&
                analysis.length > 0 && (

                    <>

                        {/* ========================================
                            SUMMARY CARDS
                        ======================================== */}

                        <div className="analytics-summary-grid">

                            {/* Athletes */}

                            <div className="analytics-summary-card">

                                <span>
                                    ATHLETES ANALYZED
                                </span>

                                <strong>
                                    {athleteCount}
                                </strong>

                                <small>
                                    Active athletes
                                </small>

                            </div>


                            {/* Positions */}

                            <div className="analytics-summary-card">

                                <span>
                                    POSITIONS ANALYZED
                                </span>

                                <strong>
                                    {analysis.length}
                                </strong>

                                <small>
                                    Recommended positions
                                </small>

                            </div>


                            {/* ML Status */}

                            <div className="analytics-summary-card">

                                <span>
                                    ML ANALYSIS
                                </span>

                                <strong>
                                    Ready
                                </strong>

                                <small>
                                    Position compatibility calculated
                                </small>

                            </div>

                        </div>


                        {/* ========================================
                            POSITION ANALYTICS TABLE
                        ======================================== */}

                        <section className="analytics-section">

                            <div className="analytics-section-header">

                                <div>

                                    <span className="analytics-eyebrow">
                                        POSITION ANALYTICS
                                    </span>

                                    <h2>
                                        Best Player by Position
                                    </h2>

                                </div>

                            </div>


                            <div className="position-table-wrapper">

                                <table className="position-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                Position
                                            </th>

                                            <th>
                                                Best Player
                                            </th>

                                            <th>
                                                Compatibility
                                            </th>

                                            <th>
                                                Current Position
                                            </th>

                                            <th>
                                                Secondary Position
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {analysis.map(
                                            (item, index) => {

                                                const position =
                                                    item?.position ||
                                                    "—";


                                                const bestPlayer =
                                                    item?.bestPlayer ||
                                                    {};


                                                const playerName =
                                                    bestPlayer?.name ||
                                                    "—";


                                                const score =
                                                    Number(
                                                        bestPlayer?.compatibilityScore
                                                    ) || 0;


                                                const currentPosition =
                                                    bestPlayer?.currentPosition ||
                                                    "—";


                                                const secondaryPosition =
                                                    bestPlayer?.secondaryPosition ||
                                                    (
                                                        Array.isArray(
                                                            bestPlayer?.secondaryPositions
                                                        )
                                                            ? bestPlayer.secondaryPositions.join(
                                                                  ", "
                                                              )
                                                            : bestPlayer?.secondaryPositions
                                                    ) ||
                                                    "—";


                                                return (

                                                    <tr
                                                        key={
                                                            `${position}-${index}`
                                                        }
                                                    >

                                                        {/* Position */}

                                                        <td>

                                                            <span className="position-badge">
                                                                {position}
                                                            </span>

                                                        </td>


                                                        {/* Player */}

                                                        <td>

                                                            <strong>
                                                                {playerName}
                                                            </strong>

                                                        </td>


                                                        {/* Compatibility */}

                                                        <td>

                                                            <div className="compatibility-cell">

                                                                <div className="compatibility-bar">

                                                                    <div
                                                                        className="compatibility-fill"
                                                                        style={{
                                                                            width: `${Math.min(
                                                                                100,
                                                                                Math.max(
                                                                                    0,
                                                                                    score
                                                                                )
                                                                            )}%`
                                                                        }}
                                                                    />

                                                                </div>


                                                                <span>
                                                                    {score.toFixed(
                                                                        2
                                                                    )}
                                                                    %
                                                                </span>

                                                            </div>

                                                        </td>


                                                        {/* Current Position */}

                                                        <td>
                                                            {currentPosition}
                                                        </td>


                                                        {/* Secondary Position */}

                                                        <td>
                                                            {secondaryPosition}
                                                        </td>

                                                    </tr>

                                                );
                                            }
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </section>


                        {/* ========================================
                            TEAM INSIGHT
                        ======================================== */}

                        <section className="analytics-section">

                            <div className="analytics-section-header">

                                <div>

                                    <span className="analytics-eyebrow">
                                        TEAM INSIGHT
                                    </span>

                                    <h2>
                                        Position Analysis Summary
                                    </h2>

                                </div>

                            </div>


                            <div className="analytics-summary-text">

                                The ML model analyzed{" "}

                                <strong>
                                    {athleteCount}
                                </strong>{" "}

                                active athletes across{" "}

                                <strong>
                                    {analysis.length}
                                </strong>{" "}

                                playing positions and
                                calculated the compatibility
                                of each athlete for every
                                recommended position.

                            </div>

                        </section>

                    </>

                )}


            {/* ========================================
                EMPTY STATE
            ======================================== */}

            {!loading &&
                !error &&
                analysis.length === 0 && (

                    <div className="analytics-state-card">

                        <strong>
                            No position recommendations available
                        </strong>

                        <p>
                            The ML service did not return
                            any position analysis.
                        </p>

                        <button
                            className="analytics-retry-button"
                            onClick={loadTeamPositionAnalytics}
                        >
                            Run Analysis Again
                        </button>

                    </div>

                )}

        </div>
        </DashboardLayout>
    );
}

export default Analytics;