
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import DashboardLayout from "../components/layout/DashboardLayout";
import "../styles/athlete-dashboard.css";

/* =========================================================
   FALLBACK / SAMPLE DATA
   ========================================================= */

const weeklyPerformance = [
    { day: "MON", value: 64 },
    { day: "TUE", value: 76 },
    { day: "WED", value: 69 },
    { day: "THU", value: 88 },
    { day: "FRI", value: 80 },
    { day: "SAT", value: 94 },
    { day: "SUN", value: 72 }
];

const defaultPhysicalAttributes = [
    { label: "Strength", value: 82 },
    { label: "Speed", value: 88 },
    { label: "Endurance", value: 76 },
    { label: "Agility", value: 91 },
    { label: "Flexibility", value: 73 },
    { label: "Mobility", value: 84 }
];

/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */

/**
 * Extract an API payload that may be wrapped inside
 * data, result, or another object.
 */
const normalizeProfileResponse = (responseData) => {
    if (!responseData) {
        return null;
    }

    return responseData.data || responseData;
};

/**
 * Normalize assessments regardless of whether the backend
 * returns:
 *
 * { data: [...] }
 * { assessments: [...] }
 * [...]
 * { data: { assessments: [...] } }
 */
const normalizeAssessmentResponse = (responseData) => {
    if (!responseData) {
        return [];
    }

    let assessmentData = responseData;

    if (assessmentData.data !== undefined) {
        assessmentData = assessmentData.data;
    }

    if (
        assessmentData &&
        !Array.isArray(assessmentData) &&
        assessmentData.assessments !== undefined
    ) {
        assessmentData = assessmentData.assessments;
    }

    if (!assessmentData) {
        return [];
    }

    return Array.isArray(assessmentData)
        ? assessmentData
        : [assessmentData];
};

/**
 * Supports different assessment score formats:
 *
 * lowerBodyStrength: { score: 82 }
 * lowerBodyStrength: { value: 82 }
 * lowerBodyStrength: 82
 */
const getScore = (assessment, field) => {
    if (!assessment || !assessment[field]) {
        return null;
    }

    const rawScore =
        assessment[field].score ??
        assessment[field].value ??
        assessment[field];

    const score = Number(rawScore);

    if (!Number.isFinite(score)) {
        return null;
    }

    // If the score is already on a 0–100 scale,
    // keep it within the correct range.
    if (score > 10) {
        return Math.min(100, Math.max(0, Math.round(score)));
    }

    // If the score is on a 0–10 scale,
    // convert it to 0–100.
    return Math.min(
        100,
        Math.max(0, Math.round(score * 10))
    );
};

const calculateAverage = (values) => {
    const validValues = values.filter(
        (value) =>
            value !== null &&
            value !== undefined &&
            Number.isFinite(Number(value))
    );

    if (validValues.length === 0) {
        return 0;
    }

    const total = validValues.reduce(
        (sum, value) => sum + Number(value),
        0
    );

    return Math.round(total / validValues.length);
};
/**
 * Get the first available value from a list of fields.
 */
const getFirstAvailableScore = (assessment, fields) => {
    for (const field of fields) {
        const score = getScore(assessment, field);

        if (score > 0) {
            return score;
        }
    }

    return 0;
};

/**
 * Get the athlete ID from the profile or saved user.
 */
const getAthleteId = (athleteProfile, user) => {
    return (
        athleteProfile?.athlete?._id ||
        athleteProfile?.athlete?.id ||
        athleteProfile?._id ||
        athleteProfile?.id ||
        user?.athleteId ||
        null
    );
};

/* =========================================================
   ATHLETE DASHBOARD
   ========================================================= */

function AthleteDashboard() {
    const navigate = useNavigate();

    const [user] = useState(() => {
        try {
            return JSON.parse(
                localStorage.getItem("ams_user") || "{}"
            );
        } catch (error) {
            console.error("Unable to parse saved user:", error);
            return {};
        }
    });

    const [athleteProfile, setAthleteProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [profileError, setProfileError] = useState("");

    const [assessments, setAssessments] = useState([]);
    const [loadingAssessments, setLoadingAssessments] = useState(true);
    const [assessmentError, setAssessmentError] = useState("");

    /* =====================================================
       FETCH ATHLETE PROFILE
       ===================================================== */

    useEffect(() => {
        let isMounted = true;

        const fetchAthleteProfile = async () => {
            try {
                setLoadingProfile(true);
                setProfileError("");

                const response = await api.get("/athletes/me");

                console.log(
                    "Athlete API response:",
                    response.data
                );

                const profileData = normalizeProfileResponse(
                    response.data
                );

                console.log(
                    "Normalized athlete profile:",
                    profileData
                );

                if (isMounted) {
                    setAthleteProfile(profileData);
                }
            } catch (error) {
                console.error(
                    "Failed to fetch athlete profile:",
                    error
                );

                if (isMounted) {
                    setProfileError(
                        error.response?.data?.message ||
                        error.message ||
                        "Unable to load athlete profile"
                    );
                }
            } finally {
                if (isMounted) {
                    setLoadingProfile(false);
                }
            }
        };

        fetchAthleteProfile();

        return () => {
            isMounted = false;
        };
    }, []);

    /* =====================================================
       FETCH ATHLETE ASSESSMENTS
       ===================================================== */

    useEffect(() => {
        let isMounted = true;

        const fetchAssessments = async () => {
            try {
                setLoadingAssessments(true);
                setAssessmentError("");

                const response = await api.get("/assessments/me");

                console.log(
                    "Assessments API response:",
                    response.data
                );

                const normalizedAssessments =
                    normalizeAssessmentResponse(response.data);

                console.log(
                    "Normalized assessments:",
                    normalizedAssessments
                );

                if (isMounted) {
                    setAssessments(normalizedAssessments);
                }
            } catch (error) {
                console.error(
                    "Failed to fetch assessments:",
                    error
                );

                if (isMounted) {
                    setAssessmentError(
                        error.response?.data?.message ||
                        error.message ||
                        "Unable to load assessments"
                    );

                    setAssessments([]);
                }
            } finally {
                if (isMounted) {
                    setLoadingAssessments(false);
                }
            }
        };

        fetchAssessments();

        return () => {
            isMounted = false;
        };
    }, []);

    /* =====================================================
       DERIVED DATA
       ===================================================== */

    const athlete = athleteProfile?.athlete || athleteProfile;

    const athleteName =
        athlete?.name ||
        athleteProfile?.user?.name ||
        user?.name ||
        "Athlete";

    const latestAssessment =
        assessments.length > 0
            ? assessments[0]
            : null;

    const physicalAttributes = [
    {
        label: "Strength",
        value: latestAssessment
            ? calculateAverage([
                getScore(latestAssessment, "lowerBodyStrength"),
                getScore(latestAssessment, "coreStrength")
            ])
            : 0
    },
    {
        label: "Speed",
        value: latestAssessment
            ? calculateAverage([
                getScore(latestAssessment, "sprint20m"),
                getScore(latestAssessment, "sprint50m")
            ])
            : 0
    },
    {
        label: "Endurance",
        value: latestAssessment
            ? getScore(latestAssessment, "aerobicCapacity") || 0
            : 0
    },
    {
        label: "Agility",
        value: latestAssessment
            ? getScore(latestAssessment, "agility505") || 0
            : 0
    },
    
{
    label: "Flexibility",
    value: latestAssessment
        ? getFirstAvailableScore(latestAssessment, [
            "flexibility",
            "flexibilityScore"
        ])
        : 0
},
{
    label: "Mobility",
    value: latestAssessment
        ? getFirstAvailableScore(latestAssessment, [
            "mobility",
            "mobilityScore"
        ])
        : 0
}
];

    const athleteId = getAthleteId(
        athleteProfile,
        user
    );

    /* =====================================================
       LIVE PERFORMANCE METRICS
       ===================================================== */

    const overallPerformance = latestAssessment
        ? calculateAverage([
            getScore(
                latestAssessment,
                "lowerBodyStrength"
            ),
            getScore(
                latestAssessment,
                "coreStrength"
            ),
            getScore(
                latestAssessment,
                "sprint20m"
            ),
            getScore(
                latestAssessment,
                "sprint50m"
            ),
            getScore(
                latestAssessment,
                "agility505"
            ),
            getScore(
                latestAssessment,
                "aerobicCapacity"
            )
        ])
        : 0;

    const fitnessScore = latestAssessment
        ? calculateAverage([
            getScore(
                latestAssessment,
                "lowerBodyStrength"
            ),
            getScore(
                latestAssessment,
                "coreStrength"
            ),
            getScore(
                latestAssessment,
                "aerobicCapacity"
            )
        ])
        : 0;

    const matchReadiness = latestAssessment
        ? calculateAverage([
            getScore(
                latestAssessment,
                "agility505"
            ),
            getScore(
                latestAssessment,
                "offBallMovement"
            ),
            getScore(
                latestAssessment,
                "decisionMaking"
            ),
            getScore(
                latestAssessment,
                "positionalDiscipline"
            )
        ])
        : 0;

    const trainingConsistency = latestAssessment
        ? calculateAverage([
            getScore(
                latestAssessment,
                "hrRecovery"
            ),
            getScore(
                latestAssessment,
                "aerobicCapacity"
            )
        ])
        : 0;

    const livePerformanceMetrics = [
        {
            label: "Overall Performance",
            value: overallPerformance,
            suffix: "/100",
            change: latestAssessment
                ? "Updated"
                : "Pending",
            description: latestAssessment
                ? "Based on latest assessment"
                : "No assessment available",
            icon: "◈",
            tone: "green"
        },
        {
            label: "Fitness Score",
            value: fitnessScore,
            suffix: "/100",
            change: latestAssessment
                ? "Updated"
                : "Pending",
            description: "Physical fitness assessment",
            icon: "✦",
            tone: "blue"
        },
        {
            label: "Match Readiness",
            value: matchReadiness,
            suffix: "%",
            change: latestAssessment
                ? "Updated"
                : "Pending",
            description: "Calculated from assessment parameters",
            icon: "◉",
            tone: "purple"
        },
        {
            label: "Training Consistency",
            value: trainingConsistency,
            suffix: "%",
            change: latestAssessment
                ? "Updated"
                : "Pending",
            description: "Based on available assessment data",
            icon: "▦",
            tone: "orange"
        }
    ];

    /* =====================================================
       NAVIGATION
       ===================================================== */

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleViewMyProfile = () => {
        if (!athleteId) {
            console.error(
                "Athlete ID is missing:",
                {
                    athleteProfile,
                    user
                }
            );

            alert("Athlete ID not found.");
            return;
        }

        console.log(
            "Opening athlete profile:",
            athleteId
        );

        navigate(`/athletes/${athleteId}`);
    };

    /* =====================================================
       RENDER
       ===================================================== */

    return (
        <DashboardLayout>
            <div className="athlete-dashboard-main">

                {/* =================================================
                    HEADER
                ================================================= */}

                <section className="athlete-welcome-header">
                    <div className="athlete-welcome-content">

                        <div className="athlete-breadcrumb">
                            ATHLETE CENTER
                            <span>/</span>
                            OVERVIEW
                        </div>

                        <div className="athlete-profile-heading">

                            <div className="athlete-avatar">
                                {athleteName
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div>
                                <div className="athlete-name-row">
                                    <h1>{athleteName}</h1>

                                    <span className="athlete-active-badge">
                                        <span className="athlete-active-dot" />

                                        {loadingProfile
                                            ? "Loading"
                                            : athlete?.isActive
                                                ? "Active"
                                                : "Inactive"}
                                    </span>
                                </div>

                                <p>
                                    Your personal performance and
                                    development center
                                </p>

                                <div className="athlete-profile-meta">
                                    <span>
                                        {athlete?.position ||
                                            "ATHLETE"}
                                    </span>

                                    <span>•</span>

                                    <span>
                                        {athlete?.club ||
                                            "AMS PERFORMANCE PROFILE"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="athlete-header-actions">

                        <div className="athlete-date-box">
                            <span>PROFILE STATUS</span>

                            <strong>
                                {loadingProfile
                                    ? "Loading"
                                    : athlete?.isActive
                                        ? "Active"
                                        : "Inactive"}
                            </strong>

                            <small>
                                {loadingProfile
                                    ? "Loading profile..."
                                    : profileError
                                        ? "Profile unavailable"
                                        : "Account verified"}
                            </small>
                        </div>

                        <button
                            type="button"
                            className="athlete-outline-button"
                            onClick={handleViewMyProfile}
                        >
                            View Profile
                            <span>↗</span>
                        </button>
                    </div>
                </section>

                {/* =================================================
                    ERROR INFORMATION
                ================================================= */}

                {profileError && (
                    <div className="athlete-error-message">
                        {profileError}
                    </div>
                )}

                {assessmentError && (
                    <div className="athlete-error-message">
                        {assessmentError}
                    </div>
                )}

                {/* =================================================
                    PERFORMANCE METRICS
                ================================================= */}

                <section className="athlete-metrics-grid">

                    {livePerformanceMetrics.map((metric) => (
                        <article
                            className={`athlete-metric-card ${metric.tone}`}
                            key={metric.label}
                        >
                            <div className="athlete-metric-top">
                                <span className="athlete-metric-label">
                                    {metric.label}
                                </span>

                                <span className="athlete-metric-icon">
                                    {metric.icon}
                                </span>
                            </div>

                            <div className="athlete-metric-value">
                                {loadingAssessments
                                    ? "..."
                                    : metric.value}

                                <small>
                                    {metric.suffix}
                                </small>
                            </div>

                            <div className="athlete-metric-bottom">
                                <span className="athlete-metric-change">
                                    ↗ {metric.change}
                                </span>

                                <span className="athlete-metric-period">
                                    This cycle
                                </span>
                            </div>

                            <p>
                                {metric.description}
                            </p>
                        </article>
                    ))}

                </section>

                {/* =================================================
                    MAIN ANALYTICS AREA
                ================================================= */}

                <section className="athlete-main-grid">

                    <article className="athlete-panel performance-trend-panel">

                        <div className="athlete-panel-header">
                            <div>
                                <span className="athlete-panel-eyebrow">
                                    PERFORMANCE ANALYTICS
                                </span>

                                <h2>
                                    Performance Overview
                                </h2>

                                <p>
                                    Your weekly performance activity
                                </p>
                            </div>

                            <span className="athlete-panel-status">
                                7 DAYS
                            </span>
                        </div>

                        <div className="athlete-chart-summary">
                            <div>
                                <strong>79.4</strong>
                                <span>Average score</span>
                            </div>

                            <div>
                                <strong className="positive-value">
                                    +12.8%
                                </strong>

                                <span>
                                    Growth this week
                                </span>
                            </div>
                        </div>

                        <div className="athlete-bar-chart">
                            {weeklyPerformance.map((item) => (
                                <div
                                    className="athlete-chart-column"
                                    key={item.day}
                                >
                                    <div className="athlete-chart-value">
                                        {item.value}
                                    </div>

                                    <div className="athlete-chart-track">
                                        <div
                                            className="athlete-chart-bar"
                                            style={{
                                                height: `${item.value}%`
                                            }}
                                        />
                                    </div>

                                    <span>
                                        {item.day}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="athlete-chart-footer">
                            <span>
                                <i className="chart-legend-dot" />
                                Performance activity
                            </span>

                            <span>
                                Sample visualization
                            </span>
                        </div>
                    </article>

                    {/* READINESS CARD */}

                    <article className="athlete-panel readiness-panel">

                        <div className="athlete-panel-header">
                            <div>
                                <span className="athlete-panel-eyebrow">
                                    ATHLETE CONDITION
                                </span>

                                <h2>
                                    Current Readiness
                                </h2>

                                <p>
                                    Estimated performance condition
                                </p>
                            </div>
                        </div>

                        <div className="readiness-score-container">
                            <div className="readiness-ring">
                                <div className="readiness-ring-inner">
                                    <strong>
                                        {matchReadiness || 91}
                                    </strong>

                                    <span>
                                        /100
                                    </span>
                                </div>
                            </div>

                            <div className="readiness-status">
                                <span className="readiness-status-dot" />
                                {matchReadiness >= 70
                                    ? "Good condition"
                                    : "Needs monitoring"}
                            </div>
                        </div>

                        <div className="readiness-details">
                            <div>
                                <span>Fitness</span>
                                <strong>
                                    {fitnessScore || 86}%
                                </strong>
                            </div>

                            <div>
                                <span>Recovery</span>
                                <strong>82%</strong>
                            </div>

                            <div>
                                <span>Workload</span>
                                <strong>Moderate</strong>
                            </div>
                        </div>

                        <button
                            className="athlete-secondary-button"
                            onClick={() =>
                                handleNavigation("/analytics")
                            }
                        >
                            View Detailed Analytics
                            <span>→</span>
                        </button>
                    </article>

                </section>

                {/* =================================================
                    PHYSICAL ATTRIBUTES
                ================================================= */}

                <section className="athlete-panel attributes-panel">

                    <div className="athlete-panel-header">
                        <div>
                            <span className="athlete-panel-eyebrow">
                                PERFORMANCE BREAKDOWN
                            </span>

                            <h2>
                                Physical Attributes
                            </h2>

                            <p>
                                Overview of your key performance parameters
                            </p>
                        </div>

                        <span className="athlete-panel-status">
                            6 PARAMETERS
                        </span>
                    </div>

                    <div className="physical-attributes-grid">
                        {physicalAttributes.map((attribute) => (
                            <div
                                className="physical-attribute"
                                key={attribute.label}
                            >
                                <div className="physical-attribute-heading">
                                    <span>
                                        {attribute.label}
                                    </span>

                                    <strong>
                                        {loadingAssessments
                                            ? "..."
                                            : attribute.value}
                                    </strong>
                                </div>

                                <div className="attribute-progress-track">
                                    <div
                                        className="attribute-progress-value"
                                        style={{
                                            width: `${attribute.value}%`
                                        }}
                                    />
                                </div>

                                <span className="attribute-scale">
                                    Performance index
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* =================================================
                    LOWER CONTENT
                ================================================= */}

                <section className="athlete-lower-grid">

                    {/* TRAINING OVERVIEW */}

                    <article className="athlete-panel training-panel">

                        <div className="athlete-panel-header">
                            <div>
                                <span className="athlete-panel-eyebrow">
                                    TRAINING ACTIVITY
                                </span>

                                <h2>
                                    Training Overview
                                </h2>
                            </div>

                            <span className="athlete-panel-status">
                                RECENT
                            </span>
                        </div>

                        <div className="training-stat-row">
                            <div className="training-stat-icon">
                                ◈
                            </div>

                            <div className="training-stat-content">
                                <span>Total Sessions</span>
                                <strong>18</strong>
                                <small>
                                    Current training cycle
                                </small>
                            </div>

                            <span className="training-stat-trend">
                                +3
                            </span>
                        </div>

                        <div className="training-stat-row">
                            <div className="training-stat-icon">
                                ◷
                            </div>

                            <div className="training-stat-content">
                                <span>Training Hours</span>
                                <strong>24.5</strong>
                                <small>
                                    Hours completed
                                </small>
                            </div>

                            <span className="training-stat-trend">
                                +8%
                            </span>
                        </div>

                        <div className="training-stat-row">
                            <div className="training-stat-icon">
                                ✦
                            </div>

                            <div className="training-stat-content">
                                <span>Consistency</span>
                                <strong>
                                    {trainingConsistency || 78}%
                                </strong>

                                <small>
                                    Training adherence
                                </small>
                            </div>

                            <span className="training-stat-trend">
                                Good
                            </span>
                        </div>

                    </article>

                    {/* RECOVERY */}

                    <article className="athlete-panel recovery-panel">

                        <div className="athlete-panel-header">
                            <div>
                                <span className="athlete-panel-eyebrow">
                                    RECOVERY MONITOR
                                </span>

                                <h2>
                                    Recovery & Wellness
                                </h2>
                            </div>

                            <span className="athlete-panel-status">
                                MONITOR
                            </span>
                        </div>

                        <div className="recovery-highlight">
                            <div className="recovery-icon">
                                ♡
                            </div>

                            <div>
                                <strong>
                                    Recovery status
                                </strong>

                                <span>
                                    Continue monitoring your workload
                                </span>
                            </div>
                        </div>

                        <div className="recovery-list">
                            <div>
                                <span>Recovery score</span>
                                <strong>82%</strong>
                            </div>

                            <div>
                                <span>Injury records</span>
                                <strong>Available</strong>
                            </div>

                            <div>
                                <span>Recommendation</span>
                                <strong>Rest & mobility</strong>
                            </div>
                        </div>

                        <button
                            className="athlete-secondary-button"
                            onClick={handleViewMyProfile}
                        >
                            View Recovery Information
                            <span>→</span>
                        </button>
                    </article>

                </section>

                {/* =================================================
                    PREMIUM AI REPORT
                ================================================= */}

                <section className="athlete-premium-report">

                    <div className="premium-report-decoration" />

                    <div className="premium-report-icon">
                        ✦
                    </div>

                    <div className="premium-report-content">
                        <span className="premium-report-eyebrow">
                            AI-POWERED PERFORMANCE INTELLIGENCE
                        </span>

                        <h2>
                            Unlock Your Detailed AI Performance Report
                        </h2>

                        <p>
                            Get personalized insights into your strengths,
                            weaknesses, training recommendations, nutrition
                            guidance and recovery strategies.
                        </p>

                        <div className="premium-report-features">
                            <span>✓ Performance insights</span>
                            <span>✓ Training recommendations</span>
                            <span>✓ Recovery guidance</span>
                            <span>✓ Nutrition suggestions</span>
                        </div>
                    </div>

                    <div className="premium-report-action">
                        <span className="premium-report-price">
                            ₹49
                            <small> / report</small>
                        </span>

                        <button
                            className="premium-report-button"
                            onClick={() =>
                                handleNavigation("/reports")
                            }
                        >
                            Explore AI Report
                            <span>↗</span>
                        </button>

                        <small>
                            Secure premium access
                        </small>
                    </div>
                </section>

                {/* =================================================
                    QUICK ACTIONS
                ================================================= */}

                <section className="athlete-panel quick-actions-panel">

                    <div className="athlete-panel-header">
                        <div>
                            <span className="athlete-panel-eyebrow">
                                ATHLETE TOOLS
                            </span>

                            <h2>
                                Quick Actions
                            </h2>

                            <p>
                                Access your important performance modules
                            </p>
                        </div>
                    </div>

                    <div className="athlete-quick-actions">

                        <button onClick={handleViewMyProfile}>
                            <span className="quick-action-icon">
                                ◉
                            </span>

                            <span className="quick-action-content">
                                <strong>My Profile</strong>
                                <small>
                                    View athlete information
                                </small>
                            </span>

                            <span className="quick-action-arrow">
                                →
                            </span>
                        </button>

                        <button
                            onClick={() =>
                                handleNavigation("/assessments")
                            }
                        >
                            <span className="quick-action-icon">
                                ▦
                            </span>

                            <span className="quick-action-content">
                                <strong>My Assessments</strong>
                                <small>
                                    Review fitness assessments
                                </small>
                            </span>

                            <span className="quick-action-arrow">
                                →
                            </span>
                        </button>

                        <button
                            onClick={() =>
                                handleNavigation("/reports")
                            }
                        >
                            <span className="quick-action-icon">
                                ✦
                            </span>

                            <span className="quick-action-content">
                                <strong>AI Reports</strong>
                                <small>
                                    View available AI reports
                                </small>
                            </span>

                            <span className="quick-action-arrow">
                                →
                            </span>
                        </button>

                    </div>
                </section>

            </div>
        </DashboardLayout>
    );
}

export default AthleteDashboard;