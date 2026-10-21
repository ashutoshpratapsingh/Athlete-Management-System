
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import api from "../services/api";

function AdminDashboard() {
    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("ams_user") || "{}"
    );

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [eligibilityRecords, setEligibilityRecords] = useState([]);
    const [eligibilityLoading, setEligibilityLoading] = useState(true);
    const [eligibilityError, setEligibilityError] = useState("");

    const [pendingAssessments, setPendingAssessments] = useState([]);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewMessage, setReviewMessage] = useState("");

    useEffect(() => {
        const loadDashboardStats = async () => {
            try {
                const response = await api.get(
                    "/dashboard/stats"
                );

                setStats(response.data.data);
            } catch (error) {
                console.error(
                    "Dashboard stats error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Failed to load dashboard statistics"
                );
            } finally {
                setLoading(false);
            }
        };

        const loadPendingAssessments = async () => {
    try {
        const response = await api.get("/assessments/pending");

        setPendingAssessments(response.data.data || []);
    } catch (error) {
        console.error("Pending assessments error:", error);

        setError(
            error.response?.data?.message ||
            "Failed to load pending assessments"
        );
    }
};

    loadDashboardStats();
    loadPendingAssessments();
    loadEligibilityRecords();
    }, []);

    const totalAthletes = stats?.totalAthletes ?? 0;
    const activeAthletes = stats?.activeAthletes ?? 0;
    const totalAssessments = stats?.totalAssessments ?? 0;
    const totalMatches = stats?.totalMatches ?? 0;
    const totalTrainingSessions =
        stats?.totalTrainingSessions ?? 0;
    const totalInjuries = stats?.totalInjuries ?? 0;
    const totalAIReports = stats?.totalAIReports ?? 0;

    const inactiveAthletes = Math.max(
        totalAthletes - activeAthletes,
        0
    );

    const activePercentage =
        totalAthletes > 0
            ? Math.round(
                (activeAthletes / totalAthletes) * 100
            )
            : 0;

    const reviewAssessment = async (assessmentId, status) => {
    try {
        setReviewLoading(true);
        setReviewMessage("");

        await api.put(
            `/assessments/${assessmentId}/verification`,
            {
                verificationStatus: status
            }
        );

        setPendingAssessments((previousAssessments) =>
            previousAssessments.filter(
                (assessment) =>
                    assessment._id !== assessmentId
            )
        );

        setReviewMessage(
            `Assessment marked as ${status
                .replace("_", " ")
                .toLowerCase()}.`
        );

    } catch (error) {
        console.error(
            "Review assessment error:",
            error.response?.data || error
        );

        setReviewMessage(
            error.response?.data?.message ||
            "Failed to review assessment"
        );

    } finally {
        setReviewLoading(false);
    }
};


const loadEligibilityRecords = async () => {
    try {
        setEligibilityLoading(true);
        setEligibilityError("");

        const response = await api.get("/researcher/athletes");
        const result = response.data?.data ?? response.data;

        setEligibilityRecords(
            Array.isArray(result) ? result : result?.athletes ?? []
        );
    } catch (error) {
        console.error("Admin eligibility records error:", error);
        setEligibilityError(
            error.response?.data?.message ||
            "Unable to load athlete eligibility records."
        );
    } finally {
        setEligibilityLoading(false);
    }
};

    return (
        <DashboardLayout>
            <div className="dashboard-header">
                <div>
                    <span className="dashboard-eyebrow">
                        ADMINISTRATION
                    </span>

                    <h1>Admin Command Center</h1>

                    <p>
                        Welcome back,{" "}
                        {user.name || "Admin"}.
                        Manage your AMS platform from one
                        centralized workspace.
                    </p>
                </div>

                <div className="dashboard-date">
                    ADMIN
                </div>
            </div>

            {error && (
                <div className="dashboard-error">
                    {error}
                </div>
            )}

            <div className="admin-dashboard-main">
                {/* ADMIN HERO */}

                <section className="admin-hero-panel">
                    <div className="admin-hero-content">
                        <div>
                            <span className="admin-hero-label">
                                <span className="admin-status-dot" />
                                AMS PLATFORM CONTROL
                            </span>

                            <h2>
                                Your platform,
                                under control.
                            </h2>

                            <p>
                                Monitor athlete operations,
                                system records, reports,
                                and administrative activity
                                from one place.
                            </p>
                        </div>

                        <div className="admin-hero-badge">
                            <strong>
                                {loading
                                    ? "—"
                                    : `${activePercentage}%`}
                            </strong>

                            <span>
                                ACTIVE ATHLETES
                            </span>
                        </div>
                    </div>
                </section>

                {/* OVERVIEW CARDS */}

                <div className="dashboard-grid">
                    <div className="stat-card admin-stat-card">
                        <div className="admin-stat-top">
                            <span>
                                Total Athletes
                            </span>

                            <div className="admin-stat-icon">
                                ♙
                            </div>
                        </div>

                        <strong>
                            {loading
                                ? "—"
                                : totalAthletes}
                        </strong>

                        <small>
                            Registered athlete records
                        </small>
                    </div>

                    <div className="stat-card admin-stat-card">
                        <div className="admin-stat-top">
                            <span>
                                Active Athletes
                            </span>

                            <div className="admin-stat-icon">
                                ✓
                            </div>
                        </div>

                        <strong>
                            {loading
                                ? "—"
                                : activeAthletes}
                        </strong>

                        <small>
                            Currently active athletes
                        </small>
                    </div>

                    <div className="stat-card admin-stat-card">
                        <div className="admin-stat-top">
                            <span>
                                Assessments
                            </span>

                            <div className="admin-stat-icon">
                                ◫
                            </div>
                        </div>

                        <strong>
                            {loading
                                ? "—"
                                : totalAssessments}
                        </strong>

                        <small>
                            Athlete assessment records
                        </small>
                    </div>

                    <div className="stat-card admin-stat-card">
                        <div className="admin-stat-top">
                            <span>
                                AI Reports
                            </span>

                            <div className="admin-stat-icon">
                                ✦
                            </div>
                        </div>

                        <strong>
                            {loading
                                ? "—"
                                : totalAIReports}
                        </strong>

                        <small>
                            Generated performance reports
                        </small>
                    </div>
                </div>

                <div
    className="management-item"
    onClick={() =>
        navigate("/admin/verification")
    }
>
    <span className="management-icon">
        ✓
    </span>

    <div>
        <strong>
            Data Verification
        </strong>

        <p>
            Verify and validate athlete
            assessment data.
        </p>
    </div>

    <span className="management-arrow">
        →
    </span>
</div>


{/* RESEARCHER ELIGIBILITY OVERVIEW */}
<section className="dashboard-panel">
    <div className="panel-header">
        <div>
            <span className="panel-eyebrow">
                RESEARCHER EVALUATIONS
            </span>
            <h2>Athlete Eligibility Overview</h2>
            <p>Eligibility decisions recorded by the Researcher.</p>
        </div>

        <button
            type="button"
            onClick={loadEligibilityRecords}
            disabled={eligibilityLoading}
        >
            {eligibilityLoading ? "Loading..." : "Refresh"}
        </button>
    </div>

    {eligibilityError && (
        <div className="dashboard-error">{eligibilityError}</div>
    )}

    {eligibilityLoading ? (
        <p>Loading eligibility records...</p>
    ) : eligibilityRecords.length === 0 ? (
        <p>No athlete eligibility records found.</p>
    ) : (
        <div className="admin-management-list">
            {eligibilityRecords.map((item) => {
                const athlete = item.athleteId &&
                    typeof item.athleteId === "object"
                    ? item.athleteId
                    : item;

                const eligibility =
                    item.eligibility ??
                    item.eligibilityRecord ??
                    item;

                const status =
                    eligibility.status || "INSUFFICIENT_DATA";

                return (
                    <div
                        key={athlete._id || item._id}
                        className="admin-management-item"
                    >
                        <div className="admin-management-info">
                            <strong>
                                {athlete.name || "Unnamed Athlete"}
                            </strong>

                            <small>
                                Position: {athlete.position || "Not recorded"}
                            </small>

                            <small>
                                Eligibility: {status.replaceAll("_", " ")}
                            </small>

                            <small>
                                Reason: {eligibility.reason ||
                                    "No evaluation reason recorded"}
                            </small>

                            <small>
                                Researcher remarks:{" "}
                                {eligibility.researcherRemarks || "None"}
                            </small>
                        </div>
                    </div>
                );
            })}
        </div>
    )}
</section>

{/* ASSESSMENT VERIFICATION */}

<section className="dashboard-panel">
    <div className="panel-header">
        <div>
            <span className="panel-eyebrow">
                DATA VERIFICATION
            </span>

            <h2>
                Pending Assessments
            </h2>
        </div>

        <span className="panel-badge">
            {pendingAssessments.length} PENDING
        </span>
    </div>

    {reviewMessage && (
        <div className="dashboard-success">
            {reviewMessage}
        </div>
    )}

    {pendingAssessments.length === 0 ? (
        <p>
            No assessments are waiting for verification.
        </p>
    ) : (
        <div className="admin-management-list">
            {pendingAssessments.map((assessment) => (
                <div
                    key={assessment._id}
                    className="admin-management-item"
                >
<div className="admin-management-info">
    <strong>
        Athlete Assessment
    </strong>

    <small>
        Assessment Date:{" "}
        {new Date(
            assessment.assessmentDate
        ).toLocaleDateString()}
    </small>

    <small>
        Status:{" "}
        {assessment.verificationStatus}
    </small>

    <small>
        Source:{" "}
        {assessment.dataSource || "Not specified"}
    </small>

    {assessment.benchmarkValidation && (
        <div className="benchmark-validation-summary">

            <div className="benchmark-validation-title">
                Benchmark Validation
            </div>

            <div className="benchmark-validation-grid">

                <div>
                    <span>Coverage</span>
                    <strong>
                        {assessment.benchmarkValidation
                            .benchmarkCoverage ?? 0}%
                    </strong>
                </div>

                <div>
                    <span>Metrics Checked</span>
                    <strong>
                        {assessment.benchmarkValidation
                            .metricsChecked ?? 0}
                    </strong>
                </div>

                <div>
                    <span>Benchmarks Found</span>
                    <strong>
                        {assessment.benchmarkValidation
                            .metricsWithBenchmark ?? 0}
                    </strong>
                </div>

                <div>
                    <span>Anomalies</span>
                    <strong>
                        {assessment.benchmarkValidation
                            .anomaliesDetected ?? 0}
                    </strong>
                </div>

            </div>

            <div
                className={
                    assessment.benchmarkValidation
                        .overallStatus === "PASS"
                        ? "benchmark-status pass"
                        : "benchmark-status review"
                }
            >
                {assessment.benchmarkValidation.overallStatus === "PASS"
                    ? "✓ Benchmark Validation Passed"
                    : "⚠ Needs Benchmark Review"}
            </div>

        </div>
    )}
</div>

                    <div className="assessment-review-actions">
                        <button
                            type="button"
                            disabled={reviewLoading}
                            onClick={() =>
                                reviewAssessment(
                                    assessment._id,
                                    "VERIFIED"
                                )
                            }
                        >
                            Verify
                        </button>

                        <button
                            type="button"
                            disabled={reviewLoading}
                            onClick={() =>
                                reviewAssessment(
                                    assessment._id,
                                    "NEEDS_REVIEW"
                                )
                            }
                        >
                            Review Again
                        </button>

                        <button
                            type="button"
                            disabled={reviewLoading}
                            onClick={() =>
                                reviewAssessment(
                                    assessment._id,
                                    "REJECTED"
                                )
                            }
                        >
                            Reject
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )}
</section>

                {/* COMMAND CENTER */}

                <div className="admin-command-grid">
                    <section className="dashboard-panel admin-command-panel">
                        <div className="panel-header">
                            <div>
                                <span className="panel-eyebrow">
                                    ADMIN OPERATIONS
                                </span>

                                <h2>
                                    Management Center
                                </h2>
                            </div>

                            <span className="panel-badge">
                                ADMIN ONLY
                            </span>
                        </div>

                        <div className="admin-management-list">
                            <button
                                type="button"
                                className="admin-management-item"
                                onClick={() =>
                                    navigate("/athletes")
                                }
                            >
                                <span className="admin-management-icon">
                                    ♙
                                </span>

                                <span className="admin-management-info">
                                    <strong>
                                        Athlete Management
                                    </strong>

                                    <small>
                                        Review and manage
                                        registered athletes.
                                    </small>
                                </span>

                                <span className="admin-management-arrow">
                                    →
                                </span>
                            </button>

                            <button
                                type="button"
                                className="admin-management-item"
                                onClick={() =>
                                    navigate("/admin/users")
                                }
                            >
                                <span className="admin-management-icon">
                                    ⚙
                                </span>

                                <span className="admin-management-info">
                                    <strong>
                                        User & Role Management
                                    </strong>

                                    <small>
                                        Manage platform users
                                        and access roles.
                                    </small>
                                </span>

                                <span className="admin-management-arrow">
                                    →
                                </span>
                            </button>

                            <button
    type="button"
    className="admin-management-item"
    onClick={() =>
        navigate("/admin/payments")
    }
>
    <span className="admin-management-icon">
        ₹
    </span>

    <span className="admin-management-info">
        <strong>
            Payment Management
        </strong>

        <small>
            View athletes who paid
            for premium AI reports.
        </small>
    </span>

    <span className="admin-management-arrow">
        →
    </span>
</button>

                            <button
                                type="button"
                                className="admin-management-item"
                                onClick={() =>
                                    navigate("/assessments")
                                }
                            >
                                <span className="admin-management-icon">
                                    ◫
                                </span>

                                <span className="admin-management-info">
                                    <strong>
                                        Assessment Management
                                    </strong>

                                    <small>
                                        Review athlete
                                        assessment records.
                                    </small>
                                </span>

                                <span className="admin-management-arrow">
                                    →
                                </span>
                            </button>

                            <button
                                type="button"
                                className="admin-management-item"
                                onClick={() =>
                                    navigate("/reports")
                                }
                            >
                                <span className="admin-management-icon">
                                    ✦
                                </span>

                                <span className="admin-management-info">
                                    <strong>
                                        AI Report Center
                                    </strong>

                                    <small>
                                        Access athlete
                                        performance reports.
                                    </small>
                                </span>

                                <span className="admin-management-arrow">
                                    →
                                </span>
                            </button>
                        </div>
                    </section>

                    {/* SYSTEM HEALTH */}

                    <section className="dashboard-panel admin-command-panel">
                        <div className="panel-header">
                            <div>
                                <span className="panel-eyebrow">
                                    PLATFORM MONITORING
                                </span>

                                <h2>
                                    System Overview
                                </h2>
                            </div>

                            <span className="panel-badge">
                                OVERVIEW
                            </span>
                        </div>

                        <div className="admin-health-list">
                            <div className="admin-health-row">
                                <div className="admin-health-info">
                                    <strong>
                                        Athlete Records
                                    </strong>

                                    <span>
                                        Registered platform data
                                    </span>
                                </div>

                                <span className="admin-health-status">
                                    Available
                                </span>
                            </div>

                            <div className="admin-health-row">
                                <div className="admin-health-info">
                                    <strong>
                                        Performance Records
                                    </strong>

                                    <span>
                                        Match and training data
                                    </span>
                                </div>

                                <span className="admin-health-status">
                                    Available
                                </span>
                            </div>

                            <div className="admin-health-row">
                                <div className="admin-health-info">
                                    <strong>
                                        Assessment Records
                                    </strong>

                                    <span>
                                        Athlete assessment data
                                    </span>
                                </div>

                                <span className="admin-health-status">
                                    Available
                                </span>
                            </div>

                            <div className="admin-health-row">
                                <div className="admin-health-info">
                                    <strong>
                                        Data Validation
                                    </strong>

                                    <span>
                                        Detailed validation
                                        integration pending
                                    </span>
                                </div>

                                <span className="admin-health-status">
                                    Planned
                                </span>
                            </div>
                        </div>
                    </section>
                </div>

                {/* ACTIVITY SUMMARY */}

                <section className="dashboard-panel">
                    <div className="panel-header">
                        <div>
                            <span className="panel-eyebrow">
                                PLATFORM ACTIVITY
                            </span>

                            <h2>
                                Operational Summary
                            </h2>
                        </div>

                        <span className="panel-badge">
                            LIVE STATS
                        </span>
                    </div>

                    <div className="admin-summary-grid">
                        <div className="admin-summary-item">
                            <span>
                                Inactive Athletes
                            </span>

                            <strong>
                                {loading
                                    ? "—"
                                    : inactiveAthletes}
                            </strong>
                        </div>

                        <div className="admin-summary-item">
                            <span>
                                Match Records
                            </span>

                            <strong>
                                {loading
                                    ? "—"
                                    : totalMatches}
                            </strong>
                        </div>

                        <div className="admin-summary-item">
                            <span>
                                Training Sessions
                            </span>

                            <strong>
                                {loading
                                    ? "—"
                                    : totalTrainingSessions}
                            </strong>
                        </div>

                        <div className="admin-summary-item">
                            <span>
                                Injury Records
                            </span>

                            <strong>
                                {loading
                                    ? "—"
                                    : totalInjuries}
                            </strong>
                        </div>
                    </div>
                </section>

                {/* QUICK ACTIONS */}

                <section className="dashboard-panel">
                    <div className="panel-header">
                        <div>
                            <span className="panel-eyebrow">
                                QUICK ACCESS
                            </span>

                            <h2>
                                Administrative Shortcuts
                            </h2>
                        </div>
                    </div>

                    <div className="quick-actions">
                        <button
                            type="button"
                            onClick={() =>
                                navigate("/analytics")
                            }
                        >
                            <span>◈</span>
                            Open Platform Analytics
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/athletes")
                            }
                        >
                            <span>♧</span>
                            Review Athlete Records
                        </button>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}

export default AdminDashboard;