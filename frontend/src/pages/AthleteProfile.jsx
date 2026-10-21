import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";
import api from "../services/api";

import "../styles/athleteProfile.css";
import "../styles/aiReport.css";

import html2pdf from "html2pdf.js";

const formatNumber = (value, digits = 1) => {
    const n = Number(value);
    return Number.isFinite(n) ? n.toFixed(digits) : "—";
};

function AthleteProfile() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [athlete, setAthlete] = useState(null);

    const [assessments, setAssessments] = useState([]);
    const [matches, setMatches] = useState([]);
    const [training, setTraining] = useState([]);
    const [injuries, setInjuries] = useState([]);
    const [coachEvaluations, setCoachEvaluations] = useState([]);
    const [performanceAnalytics, setPerformanceAnalytics] = useState(null);
    const [matchPrediction, setMatchPrediction] = useState(null);
    const [positionAnalytics, setPositionAnalytics] = useState(null);
    const [aiReport, setAiReport] = useState(null);

    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentError, setPaymentError] = useState("");
    const [reportId, setReportId] = useState(null);
    const [isPaid, setIsPaid] = useState(false);

    const storedUser = JSON.parse(
        localStorage.getItem("ams_user") || "{}"
    );

    const userRole = String(
        storedUser.role || ""
    ).toUpperCase();

    const canViewFullReport =
        userRole === "ADMIN" ||
        userRole === "COACH" ||
        isPaid;

    const [activeTab, setActiveTab] = useState("overview");

    const [loading, setLoading] = useState(true);
    const [assessmentLoading, setAssessmentLoading] = useState(false);
    const [matchLoading, setMatchLoading] = useState(false);
    const [trainingLoading, setTrainingLoading] = useState(false);
    const [injuryLoading, setInjuryLoading] = useState(false);
    const [coachEvaluationLoading, setCoachEvaluationLoading] = useState(false);
    const [performanceAnalyticsLoading, setPerformanceAnalyticsLoading] = useState(false);
    const [matchPredictionLoading, setMatchPredictionLoading] = useState(false);
    const [positionAnalyticsLoading, setPositionAnalyticsLoading] = useState(false);
    const [aiReportLoading, setAiReportLoading] = useState(false);

    const [error, setError] = useState("");
    const [assessmentError, setAssessmentError] = useState("");
    const [matchError, setMatchError] = useState("");
    const [trainingError, setTrainingError] = useState("");
    const [injuryError, setInjuryError] = useState("");
    const [coachEvaluationError, setCoachEvaluationError] = useState("");
    const [performanceAnalyticsError, setPerformanceAnalyticsError] = useState("");
    const [matchPredictionError, setMatchPredictionError] = useState("");
    const [positionAnalyticsError, setPositionAnalyticsError] = useState("");
    const [aiReportError, setAiReportError] = useState("");

    useEffect(() => {
        const loadAthlete = async () => {
            try {
                const response = await api.get(
                    `/athletes/${id}`
                );

                setAthlete(response.data.data);
            } catch (error) {
                console.error(
                    "Athlete profile error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Failed to load athlete profile"
                );
            } finally {
                setLoading(false);
            }
        };

        loadAthlete();
    }, [id]);

    const loadAssessments = async () => {
        setAssessmentLoading(true);
        setAssessmentError("");

        try {
            const response = await api.get(
                `/assessments/athlete/${id}`
            );

            setAssessments(response.data.data || []);
        } catch (error) {
            console.error(
                "Assessment loading error:",
                error
            );

            setAssessmentError(
                error.response?.data?.message ||
                "Failed to load assessments"
            );
        } finally {
            setAssessmentLoading(false);
        }
    };

    const loadMatches = async () => {
        setMatchLoading(true);
        setMatchError("");

        try {
            const response = await api.get(
                `/match-performances/athlete/${id}`
            );

            setMatches(response.data.data || []);
        } catch (error) {
            console.error(
                "Match loading error:",
                error
            );

            setMatchError(
                error.response?.data?.message ||
                "Failed to load match performances"
            );
        } finally {
            setMatchLoading(false);
        }
    };

    const loadTraining = async () => {
    setTrainingLoading(true);
    setTrainingError("");

    try {
        const response = await api.get(
            `/training-performances/athlete/${id}`
        );

        setTraining(response.data.data || []);
    } catch (error) {
        console.error(
            "Training loading error:",
            error
        );

        setTrainingError(
            error.response?.data?.message ||
            "Failed to load training performances"
        );
    } finally {
        setTrainingLoading(false);
    }
  };

  const loadInjuries = async () => {
    setInjuryLoading(true);
    setInjuryError("");

    try {
        const response = await api.get(
            `/injury-records/athlete/${id}`
        );

        setInjuries(response.data.data || []);
    } catch (error) {
        console.error(
            "Injury loading error:",
            error
        );

        setInjuryError(
            error.response?.data?.message ||
            "Failed to load injury records"
        );
    } finally {
        setInjuryLoading(false);
    }
};

    const loadCoachEvaluations = async () => {
        setCoachEvaluationLoading(true);
        setCoachEvaluationError("");

        try {
            const response = await api.get(
                `/coach-evaluations/athlete/${id}`
            );

            setCoachEvaluations(response.data.data || []);
        } catch (error) {
            console.error(
                "Coach evaluation loading error:",
                error
            );

            setCoachEvaluationError(
                error.response?.data?.message ||
                "Failed to load coach evaluations"
            );
        } finally {
            setCoachEvaluationLoading(false);
        }
    };

    const loadPerformanceAnalytics = async () => {
        setPerformanceAnalyticsLoading(true);
        setPerformanceAnalyticsError("");

        try {
            const response = await api.post(
                `/ml/performance/${id}`
            );

            setPerformanceAnalytics(response.data.analysis || null);
        } catch (error) {
            console.error(
                "Performance analytics loading error:",
                error
            );

            setPerformanceAnalyticsError(
                error.response?.data?.message ||
                "Failed to load performance analytics"
            );
        } finally {
            setPerformanceAnalyticsLoading(false);
        }
    };

    const loadPositionAnalytics = async () => {
        setPositionAnalyticsLoading(true);
        setPositionAnalyticsError("");

        try {
            const response = await api.post(
                `/ml/position/${id}`
            );

            setPositionAnalytics(response.data.analysis || null);
        } catch (error) {
            console.error(
                "Position analytics loading error:",
                error
            );

            setPositionAnalyticsError(
                error.response?.data?.message ||
                "Failed to load position analytics"
            );
        } finally {
            setPositionAnalyticsLoading(false);
        }
    };

    const generateAIReport = async () => {
        setAiReportLoading(true);
        setAiReportError("");

        try {
            const [
                reportResponse,
                assessmentsResponse,
                matchesResponse,
                trainingResponse,
                injuriesResponse,
                coachResponse,
                predictionResponse,
                positionResponse
            ] = await Promise.all([
                api.post(`/reports/generate/${id}`),
                api.get(`/assessments/athlete/${id}`),
                api.get(`/match-performances/athlete/${id}`),
                api.get(`/training-performances/athlete/${id}`),
                api.get(`/injury-records/athlete/${id}`),
                api.get(`/coach-evaluations/athlete/${id}`),
                api.post(`/ml/match-prediction/${id}`, {
                    fitnessStatus: "FIT",
                    opponent: "Upcoming Match"
                }),
                api.post(`/ml/position/${id}`)
            ]);

            const reportData = reportResponse.data.data || {};

            const detailed = reportData.detailedAnalysis || {};

            const generatedReport = reportData.report || {};

            setReportId(
                generatedReport._id ||
                reportData._id ||
                generatedReport.id ||
                null
            );

            setIsPaid(Boolean(generatedReport.isPaid));

            setAssessments(assessmentsResponse.data.data || []);
            setMatches(matchesResponse.data.data || []);
            setTraining(trainingResponse.data.data || []);
            setInjuries(injuriesResponse.data.data || []);
            setCoachEvaluations(coachResponse.data.data || []);

            setAiReport({
                ...detailed,
                ...(reportResponse.data.data?.report || {}),
                athleteName: athlete?.name || reportResponse.data.data?.report?.athleteName,
                currentPosition: athlete?.position || reportResponse.data.data?.report?.currentPosition,
                matchHistory: matchesResponse.data.data || [],
                trainingHistory: trainingResponse.data.data || [],
                assessmentHistory: assessmentsResponse.data.data || [],
                injuryHistory: injuriesResponse.data.data || [],
                coachHistory: coachResponse.data.data || [],
                matchPrediction: predictionResponse.data.data || null,
                positionAnalytics: positionResponse.data.data || positionResponse.data.analysis || null
            });
        } catch (error) {
            console.error(
                "AI report generation error:",
                error
            );

            setAiReportError(
                error.response?.data?.message ||
                "Failed to generate AI report"
            );
        } finally {
            setAiReportLoading(false);
        }
    };

    const handlePayment = async () => {
    if (!reportId) {
        setPaymentError(
            "Report ID is missing. Please generate the report again."
        );
        return;
    }

    if (!window.Razorpay) {
        setPaymentError(
            "Razorpay checkout could not be loaded. Please refresh the page."
        );
        return;
    }

    setPaymentLoading(true);
    setPaymentError("");

    try {
        // 1. Create a Razorpay order through our backend
        const orderResponse = await api.post(
            `/payments/athlete/${id}`,
            {
                reportId
            }
        );

        const orderData = orderResponse.data.data;

        if (!orderData?.orderId) {
            throw new Error("Invalid payment order response.");
        }

        // 2. Configure Razorpay checkout
        const options = {
            key: orderData.keyId,

            amount: orderData.amount,
            currency: orderData.currency || "INR",

            name: "AMS - Athlete Management System",
            description: "Premium AI Athlete Performance Report",

            order_id: orderData.orderId,

            handler: async function (response) {
    try {
        const verifyResponse = await api.post(
            "/payments/verify",
            {
                razorpay_order_id:
                    response.razorpay_order_id,

                razorpay_payment_id:
                    response.razorpay_payment_id,

                razorpay_signature:
                    response.razorpay_signature,

                paymentId: orderData.paymentId
            }
        );

        if (verifyResponse.data.success) {
            setIsPaid(true);
            setPaymentLoading(false);

            await generateAIReport();

            alert(
                "Payment successful! Your premium report is now available."
            );
        } else {
            setPaymentLoading(false);

            setPaymentError(
                "Payment verification failed."
            );
        }

    } catch (verificationError) {
        console.error(
            "Payment verification error:",
            verificationError
        );

        setPaymentLoading(false);

        setPaymentError(
            verificationError.response?.data?.message ||
            "Payment verification failed."
        );
    }
},

            prefill: {
                name: athlete?.name || "",
                email: ""
            },

            theme: {
                color: "#0ea5a4"
            },

            modal: {
                ondismiss: function () {
                    setPaymentLoading(false);
                }
            }
        };

        const razorpay = new window.Razorpay(options);

        razorpay.on("payment.failed", function (response) {
            console.error(
                "Razorpay payment failed:",
                response.error
            );

            setPaymentError(
                response.error?.description ||
                "Payment failed. Please try again."
            );

            setPaymentLoading(false);
        });

        razorpay.open();
    } catch (error) {
        console.error("Payment creation error:", error);

        setPaymentError(
            error.response?.data?.message ||
            error.message ||
            "Unable to start payment."
        );

        setPaymentLoading(false);
    }
};

    const predictMatchPerformance = async (
        fitnessStatus,
        opponent
    ) => {
        setMatchPredictionLoading(true);
        setMatchPredictionError("");

        try {
            const response = await api.post(
                `/ml/match-prediction/${id}`,
                {
                    fitnessStatus,
                    opponent: opponent || null
                }
            );

            setMatchPrediction(response.data.prediction || null);
        } catch (error) {
            console.error(
                "Match prediction error:",
                error
            );

            setMatchPredictionError(
                error.response?.data?.message ||
                "Failed to predict match performance"
            );
        } finally {
            setMatchPredictionLoading(false);
        }
    };

    const handleTabChange = (tab) => {
    setActiveTab(tab);

    if (
        tab === "assessments" &&
        assessments.length === 0
    ) {
        loadAssessments();
    }

    if (
        tab === "matches" &&
        matches.length === 0
    ) {
        loadMatches();
    }

    if (
        tab === "training" &&
        training.length === 0
    ) {
        loadTraining();
    }

    if (
        tab === "injuries" &&
        injuries.length === 0
    ) {
        loadInjuries();
    }

    if (
        tab === "coach" &&
        coachEvaluations.length === 0
    ) {
        loadCoachEvaluations();
    }

    if (
        tab === "analytics" &&
        !performanceAnalytics &&
        !performanceAnalyticsLoading
    ) {
        loadPerformanceAnalytics();
    }

    if (
        tab === "analytics" &&
        !positionAnalytics &&
        !positionAnalyticsLoading
    ) {
        loadPositionAnalytics();
    }

   };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="profile-loading">
                    Loading athlete profile...
                </div>
            </DashboardLayout>
        );
    }

    if (error || !athlete) {
        return (
            <DashboardLayout>
                <div className="profile-error">
                    {error || "Athlete not found"}

                    <button
                        onClick={() =>
                            navigate("/athletes")
                        }
                    >
                        Back to Athletes
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>

            <button
                className="back-button"
                onClick={() => navigate("/athletes")}
            >
                ← Back to Athletes
            </button>

            <div className="profile-header">

                <div className="profile-identity">

                    <div className="profile-avatar">
                        {athlete.name
                            ?.charAt(0)
                            .toUpperCase()}
                    </div>

                    <div>
                        <div className="profile-title-row">

                            <h1>
                                {athlete.name}
                            </h1>

                            <span
                                className={
                                    athlete.isActive
                                        ? "status-badge active"
                                        : "status-badge inactive"
                                }
                            >
                                {athlete.isActive
                                    ? "Active"
                                    : "Inactive"}
                            </span>

                        </div>

                        <p>
                            {athlete.position ||
                                "Position not specified"}
                            {" • "}
                            {athlete.club ||
                                "Club not specified"}
                        </p>
                    </div>

                </div>

                <div className="profile-id">
                    {athlete.externalId ||
                        "No external ID"}
                </div>

            </div>

            <div className="profile-tabs">

                <button
                    className={
                        activeTab === "overview"
                            ? "profile-tab active"
                            : "profile-tab"
                    }
                    onClick={() =>
                        handleTabChange("overview")
                    }
                >
                    Overview
                </button>

                <button
                    className={
                        activeTab === "assessments"
                            ? "profile-tab active"
                            : "profile-tab"
                    }
                    onClick={() =>
                        handleTabChange("assessments")
                    }
                >
                    Assessments
                </button>

                <button
                    className={
                        activeTab === "matches"
                            ? "profile-tab active"
                            : "profile-tab"
                    }
                    onClick={() =>
                        handleTabChange("matches")
                    }
                >
                    Matches
                </button>

                <button
                    className={
                        activeTab === "training"
                            ? "profile-tab active"
                            : "profile-tab"
                    }
                    onClick={() =>
                        handleTabChange("training")
                    }
                >
                    Training
                </button>

                <button
                    className={
                        activeTab === "injuries"
                            ? "profile-tab active"
                            : "profile-tab"
                    }
                    onClick={() =>
                        handleTabChange("injuries")
                    }
                >
                    Injuries
                </button>

                <button
                    className={
                        activeTab === "coach"
                            ? "profile-tab active"
                            : "profile-tab"
                    }
                    onClick={() =>
                        handleTabChange("coach")
                    }
                >
                    Coach Evaluation
                </button>

                <button
                    className={
                        activeTab === "analytics"
                            ? "profile-tab active"
                            : "profile-tab"
                    }
                    onClick={() =>
                        handleTabChange("analytics")
                    }
                >
                    Analytics
                </button>

                <button
                    className={
                        activeTab === "report"
                            ? "profile-tab active"
                            : "profile-tab"
                    }
                    onClick={() =>
                        handleTabChange("report")
                    }
                >
                    AI Report
                </button>

            </div>

            {activeTab === "overview" && (
                <section className="profile-panel">

                    <div className="profile-panel-header">
                        <div>
                            <span className="dashboard-eyebrow">
                                ATHLETE INFORMATION
                            </span>

                            <h2>
                                Profile Overview
                            </h2>
                        </div>
                    </div>

                    <div className="profile-info-grid">

                        <div className="profile-info-item">
                            <span>Full Name</span>
                            <strong>
                                {athlete.name || "—"}
                            </strong>
                        </div>

                        <div className="profile-info-item">
                            <span>Age</span>
                            <strong>
                                {athlete.age ?? "—"}
                            </strong>
                        </div>

                        <div className="profile-info-item">
                            <span>Current Position</span>
                            <strong>
                                {athlete.position || "—"}
                            </strong>
                        </div>

                        <div className="profile-info-item">
                            <span>Best Position</span>
                            <strong>
                                {athlete.bestPosition || "—"}
                            </strong>
                        </div>

                        <div className="profile-info-item">
                            <span>Secondary Positions</span>
                            <strong>
                                {athlete.secondaryPositions?.length
                                    ? athlete.secondaryPositions.join(
                                        ", "
                                    )
                                    : "—"}
                            </strong>
                        </div>

                        <div className="profile-info-item">
                            <span>Club</span>
                            <strong>
                                {athlete.club || "—"}
                            </strong>
                        </div>

                        <div className="profile-info-item">
                            <span>Blood Group</span>
                            <strong>
                                {athlete.bloodGroup || "—"}
                            </strong>
                        </div>

                        <div className="profile-info-item">
                            <span>Assessment Date</span>
                            <strong>
                                {athlete.assessmentDate
                                    ? new Date(
                                        athlete.assessmentDate
                                    ).toLocaleDateString()
                                    : "—"}
                            </strong>
                        </div>

                    </div>

                </section>
            )}

            {activeTab === "assessments" && (
                <AssessmentsTab
                    assessments={assessments}
                    loading={assessmentLoading}
                    error={assessmentError}
                />
            )}

            {activeTab === "matches" && (
                <MatchesTab
                    matches={matches}
                    loading={matchLoading}
                    error={matchError}
                />
            )}

            {activeTab === "training" && (
               <TrainingTab
                   training={training}
                   loading={trainingLoading}
                   error={trainingError}
               />
            )}

            {activeTab === "injuries" && (
               <InjuriesTab
                   injuries={injuries}
                   loading={injuryLoading}
                   error={injuryError}
               />
            )}

            {activeTab === "coach" && (
               <CoachEvaluationTab
                   evaluations={coachEvaluations}
                   loading={coachEvaluationLoading}
                   error={coachEvaluationError}
               />
            )}

            {activeTab === "analytics" && (
                <PerformanceAnalyticsTab
                    analytics={performanceAnalytics}
                    loading={performanceAnalyticsLoading}
                    error={performanceAnalyticsError}
                    onRefresh={loadPerformanceAnalytics}
                    matchPrediction={matchPrediction}
                    matchPredictionLoading={matchPredictionLoading}
                    matchPredictionError={matchPredictionError}
                    onPredict={predictMatchPerformance}
                    positionAnalytics={positionAnalytics}
                    positionAnalyticsLoading={positionAnalyticsLoading}
                    positionAnalyticsError={positionAnalyticsError}
                />
            )}

            {activeTab === "report" && (
                <AIReportTab
                    report={aiReport}
                    loading={aiReportLoading}
                    error={aiReportError}
                    onGenerate={generateAIReport}
                    onPayment={handlePayment}
                    paymentLoading={paymentLoading}
                    paymentError={paymentError}
                    isPaid={isPaid}
                    canViewFullReport={canViewFullReport}
                    athlete={athlete}
                />
            )}

        </DashboardLayout>
    );
}

function AIReportTab({
    report,
    loading,
    error,
    onGenerate,
    onPayment,
    paymentLoading,
    paymentError,
    isPaid,
    canViewFullReport,
    athlete
}) {
    const [activeSection, setActiveSection] = useState("overview");

    if (loading) {
        return (
            <section className="profile-panel">
                <div className="ai-report-loading-screen">
                    <div className="ai-report-loader-ring" />
                    <span className="dashboard-eyebrow">AI REPORT ENGINE</span>
                    <h2>Building the athlete intelligence report</h2>
                    <p>
                        Combining assessment, match, training, injury,
                        coach and ML data into one premium report.
                    </p>
                    <div className="ai-report-loading-steps">
                        <span>✓ Assessment analysis</span>
                        <span>✓ Match history</span>
                        <span>✓ Training load</span>
                        <span>✓ ML insights</span>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="profile-panel">
                <div className="profile-error">{error}</div>
                <button type="button" className="ai-report-primary-button" onClick={onGenerate}>
                    Try Again
                </button>
            </section>
        );
    }

    if (!report) {
        return (
            <section className="profile-panel">
                <div className="ai-report-empty">
                    <div className="ai-report-empty-icon">✦</div>
                    <span className="dashboard-eyebrow">PREMIUM ATHLETE INTELLIGENCE</span>
                    <h2>Turn performance data into a game plan.</h2>
                    <p>
                        Generate a detailed athlete report covering performance,
                        assessment, match trends, training, recovery, position
                        suitability and personalized development priorities.
                    </p>
                    <button type="button" className="ai-report-primary-button" onClick={onGenerate}>
                        Generate Premium Report
                    </button>
                </div>
            </section>
        );
    }

    // 🔒 Premium report payment protection
if (!canViewFullReport) {
    return (
        <section className="profile-panel ai-report-panel">
            <div className="ai-report-empty">
                <div className="ai-report-empty-icon">🔒</div>

                <span className="dashboard-eyebrow">
                    PREMIUM REPORT LOCKED
                </span>

                <h2>Unlock Your AI Performance Report</h2>

                <p>
                    Your basic athlete information is available.
                    Pay ₹49 to unlock your detailed AI-powered report,
                    performance analysis, training recommendations,
                    recovery insights and personalized development plan.
                </p>

                {paymentError && (
                    <div className="profile-error">
                        {paymentError}
                    </div>
                )}

                <button
                    type="button"
                    className="ai-report-primary-button"
                    onClick={onPayment}
                    disabled={paymentLoading}
                >
                    {paymentLoading
                        ? "Processing Payment..."
                        : "Pay ₹49 & Unlock Report"}
                </button>
            </div>
        </section>
    );
}

    const score = Number(report.overallScore || 0);
    const scores = report.scores || {};
    const strengths = report.strengths || [];
    const weaknesses = report.weaknesses || [];
    const matchAnalysis = report.matchAnalysis || {};
    const trainingAnalysis = report.trainingAnalysis || {};
    const physicalAnalysis = report.physicalAnalysis || {};
    const technicalAnalysis = report.technicalAnalysis || {};
    const tacticalAnalysis = report.tacticalAnalysis || {};
    const recoveryAnalysis = report.recoveryAnalysis || {};
    const injuryAnalysis = report.injuryAnalysis || {};
    const positionAnalysis = report.positionAnalysis || {};
    const positionAnalytics = report.positionAnalytics || {};

    const secondaryPositions =
        positionAnalytics.secondaryPositions ||
        positionAnalysis.secondaryPositions ||
        report.secondaryPositions ||
        [];

    const coachAssessment = report.coachAssessment || null;
    const prediction = report.matchPrediction || null;
    const matchHistory = [...(report.matchHistory || [])].sort(
        (a, b) => new Date(a.matchDate || 0) - new Date(b.matchDate || 0)
    );
    const trainingHistory = [...(report.trainingHistory || [])].sort(
        (a, b) => new Date(a.trainingDate || 0) - new Date(b.trainingDate || 0)
    );
    const latestAssessment = report.assessmentHistory?.[0] || null;

    const radarItems = [
        ["Physical", scores.physical],
        ["Technical", scores.technical],
        ["Tactical", scores.tactical],
        ["Match", scores.match],
        ["Training", scores.training],
        ["Recovery", scores.recovery]
    ];

    const sectionLabels = [
        ["overview", "Overview"],
        ["assessment", "Assessment"],
        ["matches", "Match Trends"],
        ["training", "Training"],
        ["position", "Position"],
        ["recovery", "Injury & Recovery"],
        ["plan", "4-Week Plan"]
    ];

    const latest = (value, fallback = "—") =>
        value === undefined || value === null || value === "" ? fallback : value;

    const number = (value, digits = 1) => {
        const n = Number(value);
        return Number.isFinite(n) ? n.toFixed(digits) : "—";
    };

    const getMetricValue = (metric) => {
        if (typeof metric === "number") return metric;
        if (!metric || typeof metric !== "object") return null;
        return metric.score ?? metric.value ?? metric.rating ?? metric.result;
    };

    const metricEntries = (section) => {
        const source = section?.metrics || section?.attributes || section?.details || section;
        if (!source || typeof source !== "object" || Array.isArray(source)) return [];
        return Object.entries(source)
            .filter(([key, value]) => {
                if (["score", "interpretation", "summary", "analysis", "recommendations"].includes(key)) return false;
                return getMetricValue(value) !== null;
            })
            .slice(0, 14);
    };

    const buildPlan = () => {
        const priority = weaknesses.length ? weaknesses[0] : "overall performance consistency";
        return [
            {
                week: "01",
                title: "Foundation",
                focus: "Movement quality + technical control",
                detail: `Build a strong base around ${priority.toLowerCase()}. Keep intensity controlled and prioritize clean execution.`
            },
            {
                week: "02",
                title: "Development",
                focus: "Position-specific intensity",
                detail: "Increase football-specific intensity while maintaining passing, movement and decision-making quality."
            },
            {
                week: "03",
                title: "Performance",
                focus: "Match simulation",
                detail: "Use higher-intensity match scenarios, repeated actions and position-specific decision making."
            },
            {
                week: "04",
                title: "Peak & Review",
                focus: "Sharpness + recovery",
                detail: "Reduce unnecessary volume, preserve intensity, maximize recovery and reassess the key development areas."
            }
        ];
    };

const downloadCompleteReport = () => {
    const reportElement = document.getElementById("ams-pdf-report");

    if (!reportElement || !reportElement.innerText.trim()) {
        alert("Report content not found.");
        return;
    }

    window.print();
};

    return (
        <section
            className="profile-panel ai-report-panel"
            id="ai-report-pdf-content"
        >
            <div className="ai-report-topbar">
                <div>
                    <span className="dashboard-eyebrow">PREMIUM AI PERFORMANCE REPORT</span>
                    <h2>Athlete Intelligence</h2>
                    <p>Data-backed performance analysis and a personalized development roadmap.</p>
                </div>
                <button type="button" className="ai-report-secondary-button" onClick={onGenerate}>
                    ↻ Regenerate Report
                </button>

{report && (
    <button
        type="button"
        className="prediction-button"
        onClick={downloadCompleteReport}
    >
        Download Complete Report (PDF)
    </button>
)}
            </div>

            
{/* Dedicated PDF document — separate from dashboard UI */}
<div
    id="ams-pdf-report"
    style={{
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: "760px",
    padding: "36px",
    background: "#ffffff",
    color: "#172033",
    fontFamily: "Arial, sans-serif",
    fontSize: "12px",
    lineHeight: 1.6,
    boxSizing: "border-box",
    zIndex: -1
}}
>
    <header style={{
        borderBottom: "3px solid #0e9f9a",
        paddingBottom: "18px",
        marginBottom: "24px"
    }}>
        <div style={{
            color: "#0e8f8a",
            fontSize: "11px",
            fontWeight: "bold",
            letterSpacing: "2px"
        }}>
            AMS · ATHLETE MANAGEMENT SYSTEM
        </div>

        <h1 style={{ fontSize: "28px", margin: "8px 0" }}>
            Athlete Performance Report
        </h1>

        <h2 style={{ fontSize: "20px", margin: "0" }}>
            {report.athleteName || athlete?.name || "Athlete"}
        </h2>

        <p>
            Position: {report.currentPosition || athlete?.position || "—"}
            {" | "}
            Club: {athlete?.club || "—"}
        </p>

        <p>
            Report generated: {new Date().toLocaleDateString("en-IN")}
        </p>
    </header>

    <section className="pdf-card">
        <h2 className="pdf-section-title">1. Executive Summary</h2>

        <div style={{
            background: "#f0fdfa",
            border: "1px solid #b8e8e3",
            padding: "18px",
            borderRadius: "8px",
            marginBottom: "18px"
        }}>
            <div style={{ fontSize: "11px", color: "#52616b" }}>
                OVERALL PERFORMANCE SCORE
            </div>
            <div style={{
                fontSize: "34px",
                fontWeight: "bold",
                color: "#087f78"
            }}>
                {number(score)} / 100
            </div>
            <p>
                Performance trend: {latest(report.performanceTrend, "—")}
            </p>
            <p>
                Injury risk: {latest(injuryAnalysis.risk || report.injuryRisk, "—")}
            </p>
        </div>

        <p>{report.aiSummary || "No AI summary is available in the generated report."}</p>

        <h3>Performance Scores</h3>

        <table style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "20px"
        }}>
            <thead>
                <tr style={{ background: "#edf2f7" }}>
                    <th style={{ padding: "9px", textAlign: "left" }}>Category</th>
                    <th style={{ padding: "9px", textAlign: "right" }}>Score</th>
                </tr>
            </thead>
            <tbody>
                {radarItems.map(([label, value]) => (
                    <tr key={label}>
                        <td style={{ padding: "8px", borderBottom: "1px solid #e2e8f0" }}>
                            {label}
                        </td>
                        <td style={{
                            padding: "8px",
                            textAlign: "right",
                            borderBottom: "1px solid #e2e8f0"
                        }}>
                            {number(value)} / 100
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>

        <h3>Identified Strengths</h3>
        <ul>
            {(strengths.length ? strengths : ["No strengths recorded"]).map((item, index) => (
                <li key={index}>{String(item)}</li>
            ))}
        </ul>

        <h3>Development Priorities</h3>
        <ul>
            {(weaknesses.length ? weaknesses : ["No development priorities recorded"]).map((item, index) => (
                <li key={index}>{String(item)}</li>
            ))}
        </ul>
    </section>

    <section className="pdf-card" style={{ marginTop: "28px" }}>
        <h2 className="pdf-section-title">2. Assessment Analysis</h2>

        {[
            ["Physical Assessment", physicalAnalysis],
            ["Technical Assessment", technicalAnalysis],
            ["Tactical Assessment", tacticalAnalysis]
        ].map(([title, section]) => (
            <div key={title} style={{
                border: "1px solid #dce4ec",
                borderRadius: "6px",
                padding: "14px",
                marginBottom: "14px"
            }}>
                <h3 style={{ marginTop: 0 }}>{title}</h3>

                <p>
                    Score: {number(section?.score)} / 100
                </p>

                {section?.interpretation && <p>{section.interpretation}</p>}
                {section?.summary && <p>{section.summary}</p>}

                {metricEntries(section).length > 0 && (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <tbody>
                            {metricEntries(section).map(([key, value]) => (
                                <tr key={key}>
                                    <td style={{
                                        padding: "6px",
                                        borderBottom: "1px solid #e2e8f0"
                                    }}>
                                        {key.replace(/([A-Z])/g, " $1")}
                                    </td>
                                    <td style={{
                                        padding: "6px",
                                        textAlign: "right",
                                        borderBottom: "1px solid #e2e8f0"
                                    }}>
                                        {String(
                                            typeof value === "object"
                                                ? getMetricValue(value) ?? "—"
                                                : value
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        ))}

        {coachAssessment && (
            <div>
                <h3>Coach Evaluation</h3>
                <p>{coachAssessment.comments || "No coach comments recorded."}</p>
                <p>
                    Technical: {latest(coachAssessment.technicalRating)}
                    {" | "}Tactical: {latest(coachAssessment.tacticalRating)}
                    {" | "}Physical: {latest(coachAssessment.physicalRating)}
                    {" | "}Mental: {latest(coachAssessment.mentalRating)}
                </p>
            </div>
        )}
    </section>

    <section className="pdf-card" style={{ marginTop: "28px" }}>
        <h2 className="pdf-section-title">3. Match Performance Analysis</h2>

        <p>
            Matches analysed: {latest(matchAnalysis.totalMatches, matchHistory.length)}
        </p>
        <p>
            Average rating: {number(matchAnalysis.averageRating)} / 10
            {" | "}Recent average: {number(matchAnalysis.recentAverage)} / 10
        </p>
        <p>
            Goals: {latest(matchAnalysis.goals, 0)}
            {" | "}Assists: {latest(matchAnalysis.assists, 0)}
            {" | "}Minutes played: {latest(matchAnalysis.minutesPlayed, 0)}
        </p>

        <h3>Match History</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
                <tr style={{ background: "#edf2f7" }}>
                    <th style={{ padding: "8px", textAlign: "left" }}>Date</th>
                    <th style={{ padding: "8px", textAlign: "left" }}>Opponent</th>
                    <th style={{ padding: "8px", textAlign: "right" }}>Rating</th>
                </tr>
            </thead>
            <tbody>
                {matchHistory.map((match, index) => (
                    <tr key={match._id || index}>
                        <td style={{ padding: "7px", borderBottom: "1px solid #e2e8f0" }}>
                            {match.matchDate
                                ? new Date(match.matchDate).toLocaleDateString("en-IN")
                                : "—"}
                        </td>
                        <td style={{ padding: "7px", borderBottom: "1px solid #e2e8f0" }}>
                            {match.opponent || "—"}
                        </td>
                        <td style={{ padding: "7px", textAlign: "right", borderBottom: "1px solid #e2e8f0" }}>
                            {number(match.performanceRating)} / 10
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>

        {prediction && (
            <>
                <h3>Match Prediction</h3>
                <p>
                    Predicted rating: {number(prediction.predictedRating)} / 10
                    {" | "}Readiness: {latest(prediction.matchReadiness)}
                    {" | "}Confidence: {latest(prediction.predictionConfidence)}
                </p>
            </>
        )}
    </section>

    <section className="pdf-card" style={{ marginTop: "28px" }}>
        <h2 className="pdf-section-title">4. Training Analysis</h2>

        <p>
            Sessions analysed: {latest(trainingAnalysis.sessionCount, trainingHistory.length)}
        </p>
        <p>
            Average workload: {number(trainingAnalysis.averageWorkload)}
            {" | "}Average intensity: {number(trainingAnalysis.averageIntensity)} / 10
        </p>
        <p>
            Fitness rating: {number(trainingAnalysis.averageFitnessRating)} / 10
            {" | "}Coach rating: {number(trainingAnalysis.averageCoachRating)} / 10
        </p>

        <h3>Training History</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
                <tr style={{ background: "#edf2f7" }}>
                    <th style={{ padding: "8px", textAlign: "left" }}>Date</th>
                    <th style={{ padding: "8px", textAlign: "left" }}>Session</th>
                    <th style={{ padding: "8px", textAlign: "right" }}>Fitness</th>
                </tr>
            </thead>
            <tbody>
                {trainingHistory.map((session, index) => (
                    <tr key={session._id || index}>
                        <td style={{ padding: "7px", borderBottom: "1px solid #e2e8f0" }}>
                            {session.trainingDate
                                ? new Date(session.trainingDate).toLocaleDateString("en-IN")
                                : "—"}
                        </td>
                        <td style={{ padding: "7px", borderBottom: "1px solid #e2e8f0" }}>
                            {session.sessionType || session.trainingType || session.activity || "Training session"}
                        </td>
                        <td style={{ padding: "7px", textAlign: "right", borderBottom: "1px solid #e2e8f0" }}>
                            {number(session.fitnessRating)} / 10
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </section>

    <section className="pdf-card" style={{ marginTop: "28px" }}>
        <h2 className="pdf-section-title">5. Position Analysis</h2>

        <p>
            Current position: {latest(positionAnalysis.currentPosition || report.currentPosition)}
        </p>
        <p>
            Recommended best position: {latest(positionAnalysis.bestPosition)}
        </p>

        {positionAnalysis.summary && <p>{positionAnalysis.summary}</p>}

        {secondaryPositions.length > 0 && (
            <p>Secondary positions: {secondaryPositions.join(", ")}</p>
        )}

        <h3>Position Insights</h3>
        {metricEntries(positionAnalysis).length > 0 ? (
            <ul>
                {metricEntries(positionAnalysis).map(([key, value]) => (
                    <li key={key}>
                        {key}: {String(
                            typeof value === "object"
                                ? getMetricValue(value) ?? "—"
                                : value
                        )}
                    </li>
                ))}
            </ul>
        ) : (
            <p>Additional position metrics are not available.</p>
        )}
    </section>

    <section className="pdf-card" style={{ marginTop: "28px" }}>
        <h2 className="pdf-section-title">6. Injury & Recovery</h2>

        <p>
            Injury risk: {latest(injuryAnalysis.risk || report.injuryRisk)}
        </p>

        {recoveryAnalysis.summary && <p>{recoveryAnalysis.summary}</p>}
        {injuryAnalysis.summary && <p>{injuryAnalysis.summary}</p>}

        <h3>Recorded Injury History</h3>

        {report.injuryHistory?.length ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ background: "#edf2f7" }}>
                        <th style={{ padding: "8px", textAlign: "left" }}>Date</th>
                        <th style={{ padding: "8px", textAlign: "left" }}>Injury</th>
                        <th style={{ padding: "8px", textAlign: "left" }}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {report.injuryHistory.map((injury, index) => (
                        <tr key={injury._id || index}>
                            <td style={{ padding: "7px", borderBottom: "1px solid #e2e8f0" }}>
                                {injury.injuryDate
                                    ? new Date(injury.injuryDate).toLocaleDateString("en-IN")
                                    : injury.date
                                        ? new Date(injury.date).toLocaleDateString("en-IN")
                                        : "—"}
                            </td>
                            <td style={{ padding: "7px", borderBottom: "1px solid #e2e8f0" }}>
                                {injury.injuryType || injury.type || injury.description || "—"}
                            </td>
                            <td style={{ padding: "7px", borderBottom: "1px solid #e2e8f0" }}>
                                {injury.status || injury.recoveryStatus || "—"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        ) : (
            <p>No injury history is available in the report data.</p>
        )}

        {Array.isArray(recoveryAnalysis.recommendations) &&
            recoveryAnalysis.recommendations.length > 0 && (
                <>
                    <h3>Recovery Recommendations</h3>
                    <ul>
                        {recoveryAnalysis.recommendations.map((item, index) => (
                            <li key={index}>{String(item)}</li>
                        ))}
                    </ul>
                </>
            )}
    </section>

    <section className="pdf-card" style={{ marginTop: "28px" }}>
        <h2 className="pdf-section-title">7. Four-Week Development Plan</h2>

        {buildPlan().map((week) => (
            <div key={week.week} style={{
                borderLeft: "4px solid #0e9f9a",
                padding: "10px 14px",
                marginBottom: "14px",
                background: "#f8fafc"
            }}>
                <h3 style={{ margin: "0 0 4px" }}>
                    Week {week.week}: {week.title}
                </h3>
                <strong>{week.focus}</strong>
                <p style={{ marginBottom: 0 }}>{week.detail}</p>
            </div>
        ))}
    </section>

    <footer style={{
        marginTop: "30px",
        paddingTop: "12px",
        borderTop: "1px solid #cbd5e1",
        color: "#64748b",
        fontSize: "10px"
    }}>
        Generated by AMS — Athlete Management System.
        This report reflects the data available in the system at the time of generation.
    </footer>
</div>
{/* End dedicated PDF document */}

            <div className="ai-report-hero">
                <div className="ai-report-hero-copy">
                    <span className="ai-report-kicker">EXECUTIVE PERFORMANCE SUMMARY</span>
                    <h1>{report.athleteName || "Athlete Performance Report"}</h1>
                    <p>
                        {report.currentPosition || positionAnalysis.currentPosition || "Athlete"}
                        {positionAnalysis.bestPosition ? ` • Best position: ${positionAnalysis.bestPosition}` : ""}
                    </p>
                    <div className="ai-report-pills">
                        <span>{report.performanceTrend || "Stable"}</span>
                        <span>{latest(injuryAnalysis.risk || report.injuryRisk, "Low")} injury risk</span>
                        <span>{matchHistory.length} matches analysed</span>
                    </div>
                </div>

                <div className="ai-report-score-orbit">
                    <div className="ai-report-score-ring" style={{ "--score": `${Math.max(0, Math.min(score, 100)) * 3.6}deg` }}>
                        <div>
                            <strong>{number(score)}</strong>
                            <span>/ 100</span>
                        </div>
                    </div>
                    <small>OVERALL PERFORMANCE</small>
                </div>
            </div>

            <div className="ai-report-nav">
                {sectionLabels.map(([key, label]) => (
                    <button
                        key={key}
                        type="button"
                        className={activeSection === key ? "active" : ""}
                        onClick={() => setActiveSection(key)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {activeSection === "overview" && (
                <div className="ai-report-section-stack">
                    <div className="ai-report-score-grid">
                        <ReportScoreCard label="Physical" value={scores.physical} />
                        <ReportScoreCard label="Technical" value={scores.technical} />
                        <ReportScoreCard label="Tactical / Cognitive" value={scores.tactical} />
                        <ReportScoreCard label="Match" value={scores.match} />
                        <ReportScoreCard label="Training" value={scores.training} />
                        <ReportScoreCard label="Recovery" value={scores.recovery} />
                    </div>

                    <div className="ai-report-two-column">
                        <div className="ai-report-card ai-report-radar-card">
                            <ReportSectionHeading eyebrow="PERFORMANCE PROFILE" title="Athlete capability map" />
                            <RadarProfile items={radarItems} />
                        </div>
                        <div className="ai-report-card">
                            <ReportSectionHeading eyebrow="AI INTERPRETATION" title="What the numbers say" />
                            <p className="ai-report-prose">
                                {report.aiSummary || "The report engine did not return a narrative summary."}
                            </p>
                            <div className="ai-report-mini-stats">
                                <MiniStat label="Form" value={latest(report.performanceTrend, "Stable")} />
                                <MiniStat label="Best position" value={latest(positionAnalysis.bestPosition, "—")} />
                                <MiniStat label="Assessment" value={latest(latestAssessment?.assessmentDate, "—")} />
                            </div>
                        </div>
                    </div>

                    <div className="ai-report-two-column">
                        <InsightCard title="Strengths" icon="↗" items={strengths} tone="positive" />
                        <InsightCard title="Development priorities" icon="↘" items={weaknesses} tone="warning" />
                    </div>
                </div>
            )}

            {activeSection === "assessment" && (
                <div className="ai-report-section-stack">
                    <ReportSectionHeading eyebrow="STANDARDIZED ASSESSMENT" title="Physical, technical & tactical profile" />
                    <AssessmentPanel title="Physical assessment" section={physicalAnalysis} assessment={latestAssessment} />
                    <AssessmentPanel title="Technical assessment" section={technicalAnalysis} assessment={latestAssessment} />
                    <AssessmentPanel title="Tactical & cognitive assessment" section={tacticalAnalysis} assessment={latestAssessment} />
                    {coachAssessment && (
                        <div className="ai-report-card">
                            <ReportSectionHeading eyebrow="COACH INPUT" title="Coach evaluation" />
                            <div className="ai-report-score-grid compact">
                                <ReportScoreCard label="Technical" value={coachAssessment.technicalRating} scale={10} />
                                <ReportScoreCard label="Tactical" value={coachAssessment.tacticalRating} scale={10} />
                                <ReportScoreCard label="Physical" value={coachAssessment.physicalRating} scale={10} />
                                <ReportScoreCard label="Mental" value={coachAssessment.mentalRating} scale={10} />
                                <ReportScoreCard label="Discipline" value={coachAssessment.disciplineRating} scale={10} />
                                <ReportScoreCard label="Overall" value={coachAssessment.overallRating} scale={10} />
                            </div>
                            {coachAssessment.comments && <p className="ai-report-prose">{coachAssessment.comments}</p>}
                        </div>
                    )}
                </div>
            )}

            {activeSection === "matches" && (
                <div className="ai-report-section-stack">
                    <div className="ai-report-two-column">
                        <div className="ai-report-card">
                            <ReportSectionHeading eyebrow="MATCH INTELLIGENCE" title="Performance trend" />
                            <MatchTrendChart matches={matchHistory} />
                        </div>
                        <div className="ai-report-card">
                            <ReportSectionHeading eyebrow="MATCH SNAPSHOT" title="25-game profile" />
                            <div className="ai-report-stat-list">
                                <MetricRow label="Matches analysed" value={latest(matchAnalysis.totalMatches, matchHistory.length)} />
                                <MetricRow label="Average rating" value={`${number(matchAnalysis.averageRating)}/10`} />
                                <MetricRow label="Recent 5 average" value={`${number(matchAnalysis.recentAverage)}/10`} />
                                <MetricRow label="Best rating" value={`${number(matchAnalysis.bestRating)}/10`} />
                                <MetricRow label="Lowest rating" value={`${number(matchAnalysis.lowestRating)}/10`} />
                                <MetricRow label="Goals" value={latest(matchAnalysis.goals, 0)} />
                                <MetricRow label="Assists" value={latest(matchAnalysis.assists, 0)} />
                                <MetricRow label="Minutes" value={latest(matchAnalysis.minutesPlayed, 0)} />
                                <MetricRow label="Consistency" value={latest(matchAnalysis.consistency, "—")} />
                            </div>
                        </div>
                    </div>

                    <div className="ai-report-card">
                        <ReportSectionHeading eyebrow="MATCH-BY-MATCH EVIDENCE" title="Recent performance record" />
                        <div className="ai-report-match-list">
                            {matchHistory.slice(-10).reverse().map((match, index) => (
                                <div className="ai-report-match-row" key={match._id || index}>
                                    <div>
                                        <strong>{match.opponent || "Opponent"}</strong>
                                        <span>{match.competition || "Match"} • {match.matchDate ? new Date(match.matchDate).toLocaleDateString() : "—"}</span>
                                    </div>
                                    <div className="ai-report-match-rating">{number(match.performanceRating)}/10</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="ai-report-card prediction-card">
                        <ReportSectionHeading eyebrow="MATCH PERFORMANCE PREDICTION" title="Readiness for the next match" />
                        {prediction ? (
                            <div className="prediction-report-grid">
                                <PredictionStat label="Predicted rating" value={`${number(prediction.predictedRating)}/10`} />
                                <PredictionStat label="Contribution probability" value={`${number(prediction.contributionProbability, 0)}%`} />
                                <PredictionStat label="Readiness" value={latest(prediction.matchReadiness, "—")} />
                                <PredictionStat label="Confidence" value={latest(prediction.predictionConfidence, "—")} />
                            </div>
                        ) : <p className="ai-report-prose">Run the match prediction from Analytics to populate this section.</p>}
                    </div>
                </div>
            )}

            {activeSection === "training" && (
                <div className="ai-report-section-stack">
                    <div className="ai-report-two-column">
                        <div className="ai-report-card">
                            <ReportSectionHeading eyebrow="TRAINING LOAD" title="Training trend" />
                            <TrainingTrendChart training={trainingHistory} />
                        </div>
                        <div className="ai-report-card">
                            <ReportSectionHeading eyebrow="TRAINING PROFILE" title="Workload & readiness" />
                            <div className="ai-report-stat-list">
                                <MetricRow label="Sessions analysed" value={latest(trainingAnalysis.sessionCount, trainingHistory.length)} />
                                <MetricRow label="Average workload" value={number(trainingAnalysis.averageWorkload)} />
                                <MetricRow label="Average intensity" value={`${number(trainingAnalysis.averageIntensity)}/10`} />
                                <MetricRow label="Fitness rating" value={`${number(trainingAnalysis.averageFitnessRating)}/10`} />
                                <MetricRow label="Coach rating" value={`${number(trainingAnalysis.averageCoachRating)}/10`} />
                                <MetricRow label="Passing accuracy" value={`${number(trainingAnalysis.averagePassingAccuracy, 0)}%`} />
                                <MetricRow label="Shooting accuracy" value={`${number(trainingAnalysis.averageShootingAccuracy, 0)}%`} />
                                <MetricRow label="Load status" value={latest(trainingAnalysis.loadStatus, "—")} />
                            </div>
                        </div>
                    </div>
                    <div className="ai-report-card">
                        <ReportSectionHeading eyebrow="COACHING DIRECTION" title="Training interpretation" />
                        <p className="ai-report-prose">{trainingAnalysis.interpretation || trainingAnalysis.summary || "Training data has been incorporated into the overall score and recommendations."}</p>
                        <RecommendationList items={report.trainingRecommendations} />
                    </div>
                </div>
            )}

{activeSection === "position" && (
    <div className="ai-report-section-stack">
        <div className="ai-report-card position-hero-card">
            <ReportSectionHeading
                eyebrow="POSITION ANALYTICS MODEL"
                title="Where this athlete fits best"
            />

            <div className="position-hero-grid">

                <div className="position-primary">
                    <span>BEST POSITION</span>

                    <strong>
                        {latest(
                            positionAnalytics.bestPosition ||
                            positionAnalysis.bestPosition,
                            "—"
                        )}
                    </strong>

                    <small>
                        Current:{" "}
                        {latest(
                            positionAnalytics.currentPosition ||
                            positionAnalysis.currentPosition,
                            "—"
                        )}
                    </small>
                </div>

<div className="position-secondary">
    <span className="position-label">
        SECONDARY POSITIONS
    </span>

    <div className="position-tags">
        {Array.isArray(secondaryPositions) &&
        secondaryPositions.length > 0 ? (
            secondaryPositions.map((item, i) => (
                <span key={i}>
                    {item}
                </span>
            ))
        ) : typeof secondaryPositions === "string" &&
          secondaryPositions.trim() ? (
            secondaryPositions
                .split(",")
                .map((item, i) => (
                    <span key={i}>
                        {item.trim()}
                    </span>
                ))
        ) : (
            <span>—</span>
        )}
    </div>
</div>

            </div>
        </div>

        <div className="ai-report-card">
            <ReportSectionHeading
                eyebrow="POSITION FIT"
                title="Compatibility profile"
            />

            <PositionBars
                analytics={positionAnalytics}
                current={
                    positionAnalytics.currentPosition ||
                    positionAnalysis.currentPosition
                }
                best={
                    positionAnalytics.bestPosition ||
                    positionAnalysis.bestPosition
                }
            />
        </div>
    </div>
)}

            {activeSection === "recovery" && (
                <div className="ai-report-section-stack">
                    <div className="ai-report-two-column">
                        <div className="ai-report-card risk-card">
                            <ReportSectionHeading eyebrow="RISK SCREEN" title="Injury & recovery status" />
                            <div className={`risk-badge ${String(injuryAnalysis.risk || report.injuryRisk || "low").toLowerCase()}`}>
                                {latest(injuryAnalysis.risk || report.injuryRisk, "Low")} Risk
                            </div>
                            <p className="ai-report-prose">{injuryAnalysis.summary || injuryAnalysis.interpretation || "No additional injury-risk interpretation was returned."}</p>
                            <div className="ai-report-stat-list">
                                <MetricRow label="Injury records" value={report.injuryHistory?.length || 0} />
                                <MetricRow label="Recovery score" value={`${number(scores.recovery)}/100`} />
                                <MetricRow label="HR recovery" value={latest(recoveryAnalysis.hrRecovery, "—")} />
                            </div>
                        </div>
                        <div className="ai-report-card">
                            <ReportSectionHeading eyebrow="RECOVERY STRATEGY" title="Protect performance" />
                            <p className="ai-report-prose">{recoveryAnalysis.interpretation || recoveryAnalysis.summary || "Recovery indicators are incorporated into the report scoring and recommendations."}</p>
                            <RecommendationList items={report.recoveryRecommendations} />
                        </div>
                    </div>
                    <div className="ai-report-card">
                        <ReportSectionHeading eyebrow="NUTRITION" title="Performance-support nutrition" />
                        <RecommendationList items={report.nutritionRecommendations} />
                    </div>
                </div>
            )}

            {activeSection === "plan" && (
                <div className="ai-report-section-stack">
                    <div className="ai-report-card plan-intro">
                        <ReportSectionHeading eyebrow="PERSONALIZED DEVELOPMENT ROADMAP" title="4-week performance plan" />
                        <p className="ai-report-prose">
                            This plan prioritizes the athlete's current development needs while preserving existing strengths. It is designed as a coaching framework and should be adjusted according to workload, competition schedule and professional coaching input.
                        </p>
                    </div>
                    <div className="ai-report-plan-grid">
                        {buildPlan().map((item) => (
                            <div className="ai-report-plan-card" key={item.week}>
                                <span>WEEK {item.week}</span>
                                <h3>{item.title}</h3>
                                <strong>{item.focus}</strong>
                                <p>{item.detail}</p>
                            </div>
                        ))}
                    </div>
                    <div className="ai-report-two-column">
                        <div className="ai-report-card">
                            <ReportSectionHeading eyebrow="TRAINING PRIORITIES" title="What to work on next" />
                            <RecommendationList items={report.trainingRecommendations} />
                        </div>
                        <div className="ai-report-card final-assessment-card">
                            <ReportSectionHeading eyebrow="FINAL AI ASSESSMENT" title="Development outlook" />
                            <p className="ai-report-prose">{report.aiSummary}</p>
                            <div className="ai-report-final-score">{number(score)}<span>/100</span></div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

function ReportSectionHeading({ eyebrow, title }) {
    return (
        <div className="ai-report-heading">
            <span>{eyebrow}</span>
            <h3>{title}</h3>
        </div>
    );
}

function ReportScoreCard({ label, value, scale = 100 }) {
    const raw = Number(value);
    const safe = Number.isFinite(raw) ? raw : 0;
    const pct = Math.max(0, Math.min(100, (safe / scale) * 100));
    return (
        <div className="ai-report-score-card">
            <div className="ai-report-score-card-top">
                <span>{label}</span>
                <strong>{Number.isFinite(raw) ? raw.toFixed(1) : "—"}</strong>
            </div>
            <div className="ai-report-bar"><i style={{ width: `${pct}%` }} /></div>
            <small>/ {scale}</small>
        </div>
    );
}

function MiniStat({ label, value }) {
    return <div><span>{label}</span><strong>{value}</strong></div>;
}

function InsightCard({ title, icon, items, tone }) {
    return (
        <div className={`ai-report-card insight-card ${tone}`}>
            <div className="insight-title"><span>{icon}</span><h3>{title}</h3></div>
            {items.length ? items.map((item, index) => <div className="insight-item" key={index}>{item}</div>) : <p className="ai-report-muted">No specific items identified.</p>}
        </div>
    );
}

function MetricRow({ label, value }) {
    return <div className="ai-report-metric-row"><span>{label}</span><strong>{value}</strong></div>;
}

function RecommendationList({ items = [] }) {
    if (!items.length) return <p className="ai-report-muted">No recommendations available.</p>;
    return <div className="ai-report-recommendations">{items.map((item, index) => <div key={index}><span>✦</span><p>{item}</p></div>)}</div>;
}

function PredictionStat({ label, value }) {
    return <div className="prediction-stat"><span>{label}</span><strong>{value}</strong></div>;
}

function AssessmentPanel({ title, section, assessment }) {
    const score = Number(section?.score);
    const physicalFields = [
        "lowerBodyStrength_score", "coreStrength_score", "sprint20m_score",
        "sprint50m_score", "agility505_score", "verticalJump_score",
        "aerobicCapacity_score", "hsrDistance_score", "sprintCount1H_score",
        "sprintCount2H_score", "hrRecovery_score"
    ];
    const technicalFields = [
        "firstTouch_score", "shortPassing_score", "longPassing_score",
        "shootingPower_score", "shootingAccuracy_score", "dribbling_score",
        "crossing_score", "heading_score", "tackling_score",
        "rightFootPower_score", "rightFootPassing_score", "rightFootControl_score",
        "leftFootPower_score", "leftFootPassing_score", "leftFootControl_score",
        "weakFootUsage_score"
    ];
    const tacticalFields = [
        "offBallMovement_score", "positionalDiscipline_score",
        "criticalThinking_score", "decisionMaking_score"
    ];
    const fieldMap = title.toLowerCase().includes("physical")
        ? physicalFields
        : title.toLowerCase().includes("technical")
            ? technicalFields
            : tacticalFields;
    const fallbackEntries = fieldMap
        .map(field => [field, assessment?.[field]])
        .filter(([, value]) => value !== undefined && value !== null && value !== "");
    const entries = Object.entries(section?.metrics || section?.attributes || {})
        .filter(([key, value]) => !["score", "summary", "interpretation"].includes(key) && (typeof value === "number" || (value && typeof value === "object" && (value.score !== undefined || value.value !== undefined))))
        .slice(0, 16);
    const visibleEntries = entries.length ? entries : fallbackEntries;
    const pretty = key => key.replace(/_score$/, "").replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase());

    return (
        <div className="ai-report-card">
            <ReportSectionHeading eyebrow="ASSESSMENT ANALYSIS" title={title} />
            <div className="assessment-score-line">
                <strong>{Number.isFinite(score) ? score.toFixed(1) : "—"}</strong><span>/100</span>
            </div>
            {section?.interpretation && <p className="ai-report-prose">{section.interpretation}</p>}
            {section?.summary && <p className="ai-report-prose">{section.summary}</p>}
            <div className="assessment-metric-grid">
                {visibleEntries.map(([key, value]) => {
                    const v = typeof value === "number" ? value : Number(value?.score ?? value?.value ?? value);
                    return (
                        <div key={key}>
                            <span>{pretty(key)}</span>
                            <strong>{Number.isFinite(v) ? v.toFixed(0) : "—"}</strong>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function RadarProfile({ items }) {
    const cx = 150;
    const cy = 150;
    const radius = 105;
    const count = items.length;
    const point = (value, index, r = radius) => {
        const angle = -Math.PI / 2 + (index * Math.PI * 2) / count;
        const rr = (Math.max(0, Math.min(Number(value) || 0, 100)) / 100) * r;
        return [cx + Math.cos(angle) * rr, cy + Math.sin(angle) * rr];
    };
    const polygon = items.map(([_, value], i) => point(value, i).join(",")).join(" ");
    return (
        <div className="radar-wrap">
            <svg viewBox="0 0 300 300" role="img" aria-label="Athlete capability radar">
                {[25, 50, 75, 100].map(level => <polygon key={level} points={items.map((_, i) => point(level, i).join(",")).join(" ")} className="radar-grid" />)}
                {items.map(([label], i) => {
                    const [x, y] = point(100, i);
                    return <line key={label} x1={cx} y1={cy} x2={x} y2={y} className="radar-axis" />;
                })}
                <polygon points={polygon} className="radar-area" />
                {items.map(([label, value], i) => {
                    const [x, y] = point(value, i);
                    const [lx, ly] = point(122, i);
                    return <g key={label}><circle cx={x} cy={y} r="4" className="radar-dot" /><text x={lx} y={ly} textAnchor="middle" className="radar-label">{label}</text></g>;
                })}
            </svg>
        </div>
    );
}

function MatchTrendChart({ matches }) {
    if (!matches.length) return <p className="ai-report-muted">No match history available.</p>;
    const width = 700;
    const height = 260;
    const pad = 28;
    const vals = matches.map(m => Number(m.performanceRating)).filter(Number.isFinite);
    if (!vals.length) return <p className="ai-report-muted">No rated matches available.</p>;
    const points = matches.map((m, i) => {
        const value = Number(m.performanceRating);
        const x = pad + (i * (width - pad * 2)) / Math.max(matches.length - 1, 1);
        const y = height - pad - ((value / 10) * (height - pad * 2));
        return [x, y, value];
    }).filter(p => Number.isFinite(p[2]));
    return (
        <div className="line-chart-wrap">
            <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                {[2, 4, 6, 8, 10].map(v => {
                    const y = height - pad - ((v / 10) * (height - pad * 2));
                    return <g key={v}><line x1={pad} y1={y} x2={width-pad} y2={y} className="chart-grid" /><text x="4" y={y+4} className="chart-label">{v}</text></g>;
                })}
                <polyline points={points.map(p => `${p[0]},${p[1]}`).join(" ")} className="chart-line" />
                {points.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="4" className="chart-point" />)}
            </svg>
            <div className="chart-footer"><span>First recorded match</span><strong>{formatNumber(vals[vals.length - 1])}/10 latest</strong></div>
        </div>
    );
}

function TrainingTrendChart({ training }) {
    if (!training.length) return <p className="ai-report-muted">No training history available.</p>;
    const width = 700;
    const height = 260;
    const pad = 28;
    const points = training.map((t, i) => {
        const value = Number(t.fitnessRating);
        const x = pad + (i * (width - pad * 2)) / Math.max(training.length - 1, 1);
        const y = height - pad - ((value / 10) * (height - pad * 2));
        return [x, y, value];
    }).filter(p => Number.isFinite(p[2]));
    if (!points.length) return <p className="ai-report-muted">No rated training sessions available.</p>;
    return (
        <div className="line-chart-wrap">
            <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                {[2,4,6,8,10].map(v => {
                    const y = height - pad - ((v / 10) * (height - pad * 2));
                    return <g key={v}><line x1={pad} y1={y} x2={width-pad} y2={y} className="chart-grid" /><text x="4" y={y+4} className="chart-label">{v}</text></g>;
                })}
                <polyline points={points.map(p => `${p[0]},${p[1]}`).join(" ")} className="chart-line secondary" />
                {points.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="4" className="chart-point" />)}
            </svg>
            <div className="chart-footer">
             <span>Fitness rating across sessions</span>
               <strong>
                  {formatNumber(points[points.length - 1][2])}/10 latest
               </strong>
           </div>
        </div>
    );
}

function PositionBars({ analytics, current, best }) {
    const rows = [];
    if (analytics?.positionRecommendations && Array.isArray(analytics.positionRecommendations)) {
        analytics.positionRecommendations.forEach(item => rows.push({ position: item.position || item.name, score: item.compatibilityScore ?? item.score }));
    } else if (analytics?.positionScores) {
        Object.entries(analytics.positionScores).forEach(([position, score]) => rows.push({ position, score }));
    }
    if (!rows.length) {
        if (best) rows.push({ position: best, score: 90 });
        if (current && current !== best) rows.push({ position: current, score: 85 });
        return <div className="position-fallback"><strong>{best || current || "—"}</strong><span>Best-fit position from athlete profile and analytics.</span></div>;
    }
    return <div className="position-bars">{rows.slice(0, 7).map((row, i) => { const score = Number(row.score); return <div key={i}><div><span>{row.position}</span><strong>{Number.isFinite(score) ? score.toFixed(1) : "—"}%</strong></div><div className="ai-report-bar"><i style={{width:`${Math.max(0,Math.min(score||0,100))}%`}} /></div></div>; })}</div>;
}

function PerformanceAnalyticsTab({
    analytics,
    loading,
    error,
    onRefresh,
    matchPrediction,
    matchPredictionLoading,
    matchPredictionError,
    onPredict,
    positionAnalytics,
    positionAnalyticsLoading,
    positionAnalyticsError
}) {
    const [fitnessStatus, setFitnessStatus] = useState("FIT");
    const [opponent, setOpponent] = useState("");

    const handlePrediction = () => {
        onPredict(fitnessStatus, opponent);
    };

    return (
        <section className="profile-panel">

            <div className="profile-panel-header">
                <div>
                    <span className="dashboard-eyebrow">
                        PERFORMANCE ANALYTICS
                    </span>

                    <h2>
                        Performance Analysis
                    </h2>
                </div>

                <button
                    type="button"
                    className="analytics-refresh-button"
                    onClick={onRefresh}
                    disabled={loading}
                >
                    {loading ? "Analyzing..." : "Refresh Analysis"}
                </button>
            </div>

            {loading && (
                <div className="profile-loading">
                    Analyzing match and training performance...
                </div>
            )}

            {error && (
                <div className="profile-error">
                    {error}
                </div>
            )}

            {!loading && !error && !analytics && (
                <div className="profile-loading">
                    No performance analytics available.
                </div>
            )}

            {!loading && !error && analytics && (
                <>
                    <div className="analytics-score-grid">
                        <div className="analytics-score-card analytics-score-main">
                            <span>Overall Performance</span>
                            <strong>{Number(analytics.overallScore ?? 0).toFixed(1)}</strong>
                            <small>/ 100</small>
                        </div>

                        <div className="analytics-score-card">
                            <span>Match Score</span>
                            <strong>{Number(analytics.matchScore ?? 0).toFixed(1)}</strong>
                            <small>/ 100</small>
                        </div>

                        <div className="analytics-score-card">
                            <span>Training Score</span>
                            <strong>{Number(analytics.trainingScore ?? 0).toFixed(1)}</strong>
                            <small>/ 100</small>
                        </div>

                        <div className="analytics-score-card">
                            <span>Performance Trend</span>
                            <strong className="analytics-trend">
                                {analytics.trend || "—"}
                            </strong>
                        </div>
                    </div>

                    <div className="analytics-feedback-grid">
                        <div className="analytics-feedback-card">
                            <div className="analytics-feedback-header">
                                <span>STRENGTHS</span>
                            </div>

                            {analytics.strengths?.length > 0 ? (
                                <ul>
                                    {analytics.strengths.map((strength, index) => (
                                        <li key={index}>{strength}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="analytics-empty">
                                    No specific strengths identified.
                                </p>
                            )}
                        </div>

                        <div className="analytics-feedback-card">
                            <div className="analytics-feedback-header">
                                <span>AREAS TO IMPROVE</span>
                            </div>

                            {analytics.weaknesses?.length > 0 ? (
                                <ul>
                                    {analytics.weaknesses.map((weakness, index) => (
                                        <li key={index}>{weakness}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="analytics-empty">
                                    No specific weaknesses identified.
                                </p>
                            )}
                        </div>
                    </div>
                </>
            )}

            <div className="analytics-prediction-section">

                <div className="analytics-prediction-header">
                    <div>
                        <span className="dashboard-eyebrow">
                            MATCH PREDICTION
                        </span>

                        <h3>
                            Upcoming Match Performance
                        </h3>
                    </div>
                </div>

                <div className="prediction-form">

                    <div className="prediction-field">
                        <label htmlFor="prediction-opponent">
                            Opponent
                        </label>

                        <input
                            id="prediction-opponent"
                            type="text"
                            value={opponent}
                            onChange={(event) =>
                                setOpponent(event.target.value)
                            }
                            placeholder="Enter opponent name"
                        />
                    </div>

                    <div className="prediction-field">
                        <label htmlFor="prediction-fitness">
                            Fitness Status
                        </label>

                        <select
                            id="prediction-fitness"
                            value={fitnessStatus}
                            onChange={(event) =>
                                setFitnessStatus(event.target.value)
                            }
                        >
                            <option value="FIT">Fit</option>
                            <option value="LIMITED">Limited</option>
                            <option value="INJURED">Injured</option>
                        </select>
                    </div>

                    <button
                        type="button"
                        className="prediction-button"
                        onClick={handlePrediction}
                        disabled={matchPredictionLoading}
                    >
                        {matchPredictionLoading
                            ? "Predicting..."
                            : "Predict Match Performance"}
                    </button>

                </div>

                {matchPredictionError && (
                    <div className="profile-error">
                        {matchPredictionError}
                    </div>
                )}

                {!matchPredictionLoading && !matchPredictionError && matchPrediction && (
                    <div className="prediction-results">

                        <div className="prediction-result-card">
                            <span>Opponent</span>
                            <strong>
                                {matchPrediction.opponent || opponent || "Not specified"}
                            </strong>
                        </div>

                        <div className="prediction-result-card prediction-result-main">
                            <span>Predicted Performance</span>
                            <strong>
                                {Number(
                                    matchPrediction.predictedPerformanceRating ?? 0
                                ).toFixed(1)}
                            </strong>
                            <small>/ 10</small>
                        </div>

                        <div className="prediction-result-card">
                            <span>Contribution Probability</span>
                            <strong>
                                {Number(
                                    matchPrediction.contributionProbability ?? 0
                                ).toFixed(1)}
                                %
                            </strong>
                        </div>

                        <div className="prediction-result-card">
                            <span>Match Readiness</span>
                            <strong className="prediction-readiness">
                                {matchPrediction.matchReadiness || "—"}
                            </strong>
                        </div>

                    </div>
                )}

            </div>

            <div className="analytics-position-section">
                <div className="analytics-prediction-header">
                    <div>
                        <span className="dashboard-eyebrow">
                            POSITION ANALYTICS
                        </span>

                        <h3>
                            Best-Suited Position
                        </h3>
                    </div>
                </div>

                {positionAnalyticsLoading && (
                    <div className="profile-loading">
                        Analyzing position suitability...
                    </div>
                )}

                {positionAnalyticsError && (
                    <div className="profile-error">
                        {positionAnalyticsError}
                    </div>
                )}

                {!positionAnalyticsLoading && !positionAnalyticsError && positionAnalytics && (
                    <div className="prediction-results">
                        <div className="prediction-result-card prediction-result-main">
                            <span>Best Position</span>
                            <strong className="prediction-readiness">
                                {positionAnalytics.bestPosition || "—"}
                            </strong>
                        </div>

                        <div className="prediction-result-card">
                            <span>Compatibility Score</span>
                            <strong>
                                {Number(positionAnalytics.compatibilityScore ?? 0).toFixed(1)}
                            </strong>
                            <small>/ 100</small>
                        </div>

                        <div className="prediction-result-card">
                            <span>Secondary Position</span>
                            <strong className="prediction-readiness">
                                {Array.isArray(positionAnalytics.secondaryPositions)
                                    ? positionAnalytics.secondaryPositions.join(", ") || "—"
                                    : positionAnalytics.secondaryPosition || "—"}
                            </strong>
                        </div>

                        <div className="prediction-result-card">
                            <span>Current Position</span>
                            <strong className="prediction-readiness">
                                {positionAnalytics.currentPosition || "—"}
                            </strong>
                        </div>
                    </div>
                )}
            </div>

        </section>
    );
}

function TrainingTab({
    training,
    loading,
    error
}) {
    return (
        <section className="profile-panel">

            <div className="profile-panel-header">

                <div>
                    <span className="dashboard-eyebrow">
                        TRAINING PERFORMANCE
                    </span>

                    <h2>
                        Training History
                    </h2>
                </div>

                <span className="panel-badge">
                    {training.length} SESSIONS
                </span>

            </div>

            {loading && (
                <div className="profile-loading">
                    Loading training performances...
                </div>
            )}

            {error && (
                <div className="profile-error">
                    {error}
                </div>
            )}

            {!loading &&
                !error &&
                training.length === 0 && (
                    <div className="profile-loading">
                        No training records found for this athlete.
                    </div>
                )}

            {!loading &&
                !error &&
                training.length > 0 && (
                    <div className="training-history">

                        {training.map((session) => (
                            <div
                                className="training-card"
                                key={session._id}
                            >

                                <div className="training-card-header">

                                    <div>
                                        <span>
                                            TRAINING SESSION
                                        </span>

                                        <h3>
                                            {session.trainingDate
                                                ? new Date(
                                                    session.trainingDate
                                                ).toLocaleDateString()
                                                : "—"}
                                        </h3>
                                    </div>

                                    <div className="training-session-type">
                                        {session.sessionType ||
                                            "Training"}
                                    </div>

                                </div>

                                <div className="training-metrics">

                                    <TrainingMetric
                                        label="Duration"
                                        value={
                                            session.durationMinutes !==
                                            undefined &&
                                            session.durationMinutes !==
                                            null
                                                ? `${session.durationMinutes} min`
                                                : "—"
                                        }
                                    />

                                    <TrainingMetric
                                        label="Workload"
                                        value={
                                            session.workload ??
                                            "—"
                                        }
                                    />

                                    <TrainingMetric
                                        label="Intensity"
                                        value={
                                            session.intensity !==
                                            undefined &&
                                            session.intensity !==
                                            null
                                                ? Number(
                                                    session.intensity
                                                ).toFixed(1)
                                                : "—"
                                        }
                                    />

                                    <TrainingMetric
                                        label="Sprint Distance"
                                        value={
                                            session.sprintDistance !==
                                            undefined &&
                                            session.sprintDistance !==
                                            null
                                                ? `${session.sprintDistance} m`
                                                : "—"
                                        }
                                    />

                                    <TrainingMetric
                                        label="Sprint Count"
                                        value={
                                            session.sprintCount ??
                                            "—"
                                        }
                                    />

                                    <TrainingMetric
                                        label="Passing Accuracy"
                                        value={
                                            session.passingAccuracy !==
                                            undefined &&
                                            session.passingAccuracy !==
                                            null
                                                ? `${Number(
                                                    session.passingAccuracy
                                                ).toFixed(1)}%`
                                                : "—"
                                        }
                                    />

                                    <TrainingMetric
                                        label="Shooting Accuracy"
                                        value={
                                            session.shootingAccuracy !==
                                            undefined &&
                                            session.shootingAccuracy !==
                                            null
                                                ? `${Number(
                                                    session.shootingAccuracy
                                                ).toFixed(1)}%`
                                                : "—"
                                        }
                                    />

                                    <TrainingMetric
                                        label="Fitness Rating"
                                        value={
                                            session.fitnessRating !==
                                            undefined &&
                                            session.fitnessRating !==
                                            null
                                                ? Number(
                                                    session.fitnessRating
                                                ).toFixed(1)
                                                : "—"
                                        }
                                    />

                                    <TrainingMetric
                                        label="Coach Rating"
                                        value={
                                            session.coachRating !==
                                            undefined &&
                                            session.coachRating !==
                                            null
                                                ? Number(
                                                    session.coachRating
                                                ).toFixed(1)
                                                : "—"
                                        }
                                    />

                                </div>

                                {session.notes && (
                                    <div className="training-notes">

                                        <span>
                                            Coach Notes
                                        </span>

                                        <p>
                                            {session.notes}
                                        </p>

                                    </div>
                                )}

                            </div>
                        ))}

                    </div>
                )}

        </section>
    );
}

function TrainingMetric({
    label,
    value
}) {
    return (
        <div className="training-metric">

            <span>
                {label}
            </span>

            <strong>
                {value}
            </strong>

        </div>
    );
}

function InjuriesTab({
    injuries,
    loading,
    error
}) {
    return (
        <section className="profile-panel">

            <div className="profile-panel-header">

                <div>
                    <span className="dashboard-eyebrow">
                        MEDICAL & RECOVERY
                    </span>

                    <h2>
                        Injury History
                    </h2>
                </div>

                <span className="panel-badge">
                    {injuries.length} RECORDS
                </span>

            </div>

            {loading && (
                <div className="profile-loading">
                    Loading injury records...
                </div>
            )}

            {error && (
                <div className="profile-error">
                    {error}
                </div>
            )}

            {!loading &&
                !error &&
                injuries.length === 0 && (
                    <div className="profile-loading">
                        No injury records found for this athlete.
                    </div>
                )}

            {!loading &&
                !error &&
                injuries.length > 0 && (
                    <div className="injury-history">

                        {injuries.map((injury) => (
                            <div
                                className="injury-card"
                                key={injury._id}
                            >

                                <div className="injury-card-header">

                                    <div>
                                        <span>
                                            INJURY RECORDED
                                        </span>

                                        <h3>
                                            {injury.injuryDate
                                                ? new Date(
                                                    injury.injuryDate
                                                ).toLocaleDateString()
                                                : "—"}
                                        </h3>
                                    </div>

                                    <div className="injury-badges">

                                        <span
                                            className={`injury-severity ${getSeverityClass(
                                                injury.severity
                                            )}`}
                                        >
                                            {injury.severity ||
                                                "Unknown"}
                                        </span>

                                        <span
                                            className={`injury-status ${getRecoveryClass(
                                                injury.recoveryStatus
                                            )}`}
                                        >
                                            {injury.recoveryStatus ||
                                                "Unknown"}
                                        </span>

                                    </div>

                                </div>

                                <div className="injury-info-grid">

                                    <div className="injury-info-item">
                                        <span>
                                            Injury Type
                                        </span>

                                        <strong>
                                            {injury.injuryType ||
                                                "—"}
                                        </strong>
                                    </div>

                                    <div className="injury-info-item">
                                        <span>
                                            Body Part
                                        </span>

                                        <strong>
                                            {injury.bodyPart ||
                                                "—"}
                                        </strong>
                                    </div>

                                    <div className="injury-info-item">
                                        <span>
                                            Expected Recovery
                                        </span>

                                        <strong>
                                            {injury.expectedRecoveryDate
                                                ? new Date(
                                                    injury.expectedRecoveryDate
                                                ).toLocaleDateString()
                                                : "—"}
                                        </strong>
                                    </div>

                                    <div className="injury-info-item">
                                        <span>
                                            Actual Recovery
                                        </span>

                                        <strong>
                                            {injury.actualRecoveryDate
                                                ? new Date(
                                                    injury.actualRecoveryDate
                                                ).toLocaleDateString()
                                                : "—"}
                                        </strong>
                                    </div>

                                </div>

                                {injury.description && (
                                    <div className="injury-notes">

                                        <span>
                                            Description
                                        </span>

                                        <p>
                                            {injury.description}
                                        </p>

                                    </div>
                                )}

                                {injury.treatment && (
                                    <div className="injury-notes">

                                        <span>
                                            Treatment
                                        </span>

                                        <p>
                                            {injury.treatment}
                                        </p>

                                    </div>
                                )}

                                {injury.notes && (
                                    <div className="injury-notes">

                                        <span>
                                            Additional Notes
                                        </span>

                                        <p>
                                            {injury.notes}
                                        </p>

                                    </div>
                                )}

                            </div>
                        ))}

                    </div>
                )}

        </section>
    );
}

function getSeverityClass(severity) {
    if (severity === "Severe") {
        return "severe";
    }

    if (severity === "Moderate") {
        return "moderate";
    }

    return "mild";
}

function getRecoveryClass(status) {
    if (status === "Recovered") {
        return "recovered";
    }

    if (status === "Recovering") {
        return "recovering";
    }

    return "under-treatment";
}

function CoachEvaluationTab({
    evaluations,
    loading,
    error
}) {
    return (
        <section className="profile-panel">

            <div className="profile-panel-header">
                <div>
                    <span className="dashboard-eyebrow">
                        COACH EVALUATION
                    </span>

                    <h2>
                        Evaluation History
                    </h2>
                </div>

                <span className="panel-badge">
                    {evaluations.length} RECORDS
                </span>
            </div>

            {loading && (
                <div className="profile-loading">
                    Loading coach evaluations...
                </div>
            )}

            {error && (
                <div className="profile-error">
                    {error}
                </div>
            )}

            {!loading &&
                !error &&
                evaluations.length === 0 && (
                    <div className="profile-loading">
                        No coach evaluations found for this athlete.
                    </div>
                )}

            {!loading &&
                !error &&
                evaluations.length > 0 && (
                    <div className="coach-evaluation-history">
                        {evaluations.map((evaluation, index) => (
                            <div
                                className="coach-evaluation-card"
                                key={evaluation._id || index}
                            >
                                <div className="coach-evaluation-card-header">
                                    <div>
                                        <span>
                                            COACH EVALUATION
                                        </span>

                                        <h3>
                                            {evaluation.evaluationDate
                                                ? new Date(
                                                    evaluation.evaluationDate
                                                ).toLocaleDateString()
                                                : "—"}
                                        </h3>
                                    </div>

                                    <div className="coach-overall-rating">
                                        <small>Overall</small>
                                        <strong>
                                            {evaluation.overallRating !== undefined &&
                                            evaluation.overallRating !== null
                                                ? Number(
                                                    evaluation.overallRating
                                                ).toFixed(1)
                                                : "—"}
                                        </strong>
                                        <span>/ 10</span>
                                    </div>
                                </div>

                                <div className="coach-rating-grid">
                                    <CoachRating
                                        label="Technical"
                                        value={evaluation.technicalRating}
                                    />

                                    <CoachRating
                                        label="Tactical"
                                        value={evaluation.tacticalRating}
                                    />

                                    <CoachRating
                                        label="Physical"
                                        value={evaluation.physicalRating}
                                    />

                                    <CoachRating
                                        label="Mental"
                                        value={evaluation.mentalRating}
                                    />

                                    <CoachRating
                                        label="Discipline"
                                        value={evaluation.disciplineRating}
                                    />
                                </div>

                                {(evaluation.strengths?.length > 0 ||
                                    evaluation.weaknesses?.length > 0) && (
                                    <div className="coach-evaluation-feedback">
                                        {evaluation.strengths?.length > 0 && (
                                            <div>
                                                <span>Strengths</span>
                                                <ul>
                                                    {evaluation.strengths.map(
                                                        (strength, strengthIndex) => (
                                                            <li key={strengthIndex}>
                                                                {strength}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        )}

                                        {evaluation.weaknesses?.length > 0 && (
                                            <div>
                                                <span>Areas to Improve</span>
                                                <ul>
                                                    {evaluation.weaknesses.map(
                                                        (weakness, weaknessIndex) => (
                                                            <li key={weaknessIndex}>
                                                                {weakness}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {evaluation.comments && (
                                    <div className="coach-evaluation-comments">
                                        <span>Coach Comments</span>
                                        <p>
                                            {evaluation.comments}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
        </section>
    );
}

function CoachRating({
    label,
    value
}) {
    return (
        <div className="coach-rating-item">
            <span>{label}</span>

            <strong>
                {value !== undefined && value !== null
                    ? Number(value).toFixed(1)
                    : "—"}
            </strong>

            <small>/ 10</small>
        </div>
    );
}

function AssessmentsTab({
    assessments,
    loading,
    error
}) {
    return (
        <section className="profile-panel">

            <div className="profile-panel-header">
                <div>
                    <span className="dashboard-eyebrow">
                        PERFORMANCE ASSESSMENT
                    </span>

                    <h2>
                        Assessment History
                    </h2>
                </div>

                <span className="panel-badge">
                    {assessments.length} RECORDS
                </span>
            </div>

            {loading && (
                <div className="profile-loading">
                    Loading assessments...
                </div>
            )}

            {error && (
                <div className="profile-error">
                    {error}
                </div>
            )}

            {!loading &&
                !error &&
                assessments.length === 0 && (
                    <div className="profile-loading">
                        No assessments found for this athlete.
                    </div>
                )}

            {!loading &&
                !error &&
                assessments.length > 0 && (
                    <div className="assessment-history">

                        {assessments.map(
                            (assessment, index) => (
                                <div
                                    className="assessment-card"
                                    key={
                                        assessment._id ||
                                        index
                                    }
                                >

                                    <div className="assessment-card-header">

                                        <div>
                                            <span>
                                                ASSESSMENT
                                            </span>

                                            <h3>
                                                {new Date(
                                                    assessment.assessmentDate
                                                ).toLocaleDateString()}
                                            </h3>
                                        </div>

                                        <span className="assessment-number">
                                            #{assessments.length - index}
                                        </span>

                                    </div>

                                    <div className="assessment-section">

                                        <h4>
                                            Physical Performance
                                        </h4>

                                        <div className="assessment-metrics">

                                            <AssessmentMetric
                                                label="Lower Body Strength"
                                                data={
                                                    assessment.lowerBodyStrength
                                                }
                                            />

                                            <AssessmentMetric
                                                label="Core Strength"
                                                data={
                                                    assessment.coreStrength
                                                }
                                            />

                                            <AssessmentMetric
                                                label="20m Sprint"
                                                data={
                                                    assessment.sprint20m
                                                }
                                            />

                                            <AssessmentMetric
                                                label="50m Sprint"
                                                data={
                                                    assessment.sprint50m
                                                }
                                            />

                                            <AssessmentMetric
                                                label="Agility 505"
                                                data={
                                                    assessment.agility505
                                                }
                                            />

                                            <AssessmentMetric
                                                label="Vertical Jump"
                                                data={
                                                    assessment.verticalJump
                                                }
                                            />

                                            <AssessmentMetric
                                                label="Aerobic Capacity"
                                                data={
                                                    assessment.aerobicCapacity
                                                }
                                            />

                                        </div>

                                    </div>

                                    <div className="assessment-section">

                                        <h4>
                                            Technical Skills
                                        </h4>

                                        <div className="assessment-metrics">

                                            <AssessmentMetric
                                                label="First Touch"
                                                data={
                                                    assessment.firstTouch
                                                }
                                            />

                                            <AssessmentMetric
                                                label="Short Passing"
                                                data={
                                                    assessment.shortPassing
                                                }
                                            />

                                            <AssessmentMetric
                                                label="Long Passing"
                                                data={
                                                    assessment.longPassing
                                                }
                                            />

                                            <AssessmentMetric
                                                label="Shooting Power"
                                                data={
                                                    assessment.shootingPower
                                                }
                                            />

                                            <AssessmentMetric
                                                label="Shooting Accuracy"
                                                data={
                                                    assessment.shootingAccuracy
                                                }
                                            />

                                            <AssessmentMetric
                                                label="Dribbling"
                                                data={
                                                    assessment.dribbling
                                                }
                                            />

                                            <AssessmentMetric
                                                label="Crossing"
                                                data={
                                                    assessment.crossing
                                                }
                                            />

                                            <AssessmentMetric
                                                label="Heading"
                                                data={
                                                    assessment.heading
                                                }
                                            />

                                            <AssessmentMetric
                                                label="Tackling"
                                                data={
                                                    assessment.tackling
                                                }
                                            />

                                        </div>

                                    </div>

                                    <div className="assessment-section">

                                        <h4>
                                            Foot Skills
                                        </h4>

                                        <div className="assessment-metrics">

                                            <AssessmentMetric
                                                label="Right Foot Power"
                                                data={
                                                    assessment.rightFootPower
                                                }
                                            />

                                            <AssessmentMetric
                                                label="Right Foot Passing"
                                                data={
                                                    assessment.rightFootPassing
                                                }
                                            />

                                            <AssessmentMetric
                                                label="Right Foot Control"
                                                data={
                                                    assessment.rightFootControl
                                                }
                                            />

                                            <AssessmentMetric
                                                label="Left Foot Power"
                                                data={
                                                    assessment.leftFootPower
                                                }
                                            />

                                            <AssessmentMetric
                                                label="Left Foot Passing"
                                                data={
                                                    assessment.leftFootPassing
                                                }
                                            />

                                            <AssessmentMetric
                                                label="Left Foot Control"
                                                data={
                                                    assessment.leftFootControl
                                                }
                                            />

                                            <AssessmentMetric
                                                label="Weak Foot Usage"
                                                data={
                                                    assessment.weakFootUsage
                                                }
                                            />

                                        </div>

                                    </div>

                                    <div className="assessment-section">

                                        <h4>
                                            Cognitive & Tactical
                                        </h4>

                                        <div className="assessment-metrics">

                                            <AssessmentMetric
                                                label="Off Ball Movement"
                                                data={
                                                    assessment.offBallMovement
                                                }
                                            />

                                            <AssessmentMetric
                                                label="Decision Making"
                                                data={
                                                    assessment.decisionMaking
                                                }
                                            />

                                            <AssessmentMetric
                                                label="Positional Discipline"
                                                data={
                                                    assessment.positionalDiscipline
                                                }
                                            />

                                            <AssessmentMetric
                                                label="Critical Thinking"
                                                data={
                                                    assessment.criticalThinking
                                                }
                                            />

                                        </div>

                                    </div>

                                    <div className="assessment-section">

                                        <h4>
                                            Load & Recovery
                                        </h4>

                                        <div className="assessment-metrics">

                                            <AssessmentMetric
                                                label="HSR Distance"
                                                data={
                                                    assessment.hsrDistance
                                                }
                                            />

                                            <AssessmentMetric
                                                label="Sprint Count 1H"
                                                data={
                                                    assessment.sprintCount1H
                                                }
                                            />

                                            <AssessmentMetric
                                                label="Sprint Count 2H"
                                                data={
                                                    assessment.sprintCount2H
                                                }
                                            />

                                            <AssessmentMetric
                                                label="HR Recovery"
                                                data={
                                                    assessment.hrRecovery
                                                }
                                            />

                                        </div>

                                    </div>

                                    {(assessment.injuryNotes ||
                                        assessment.coachNotes ||
                                        assessment.nutritionNotes) && (
                                        <div className="assessment-notes">

                                            {assessment.injuryNotes && (
                                                <div>
                                                    <span>
                                                        Injury Notes
                                                    </span>

                                                    <p>
                                                        {assessment.injuryNotes}
                                                    </p>
                                                </div>
                                            )}

                                            {assessment.coachNotes && (
                                                <div>
                                                    <span>
                                                        Coach Notes
                                                    </span>

                                                    <p>
                                                        {assessment.coachNotes}
                                                    </p>
                                                </div>
                                            )}

                                            {assessment.nutritionNotes && (
                                                <div>
                                                    <span>
                                                        Nutrition Notes
                                                    </span>

                                                    <p>
                                                        {assessment.nutritionNotes}
                                                    </p>
                                                </div>
                                            )}

                                        </div>
                                    )}

                                </div>
                            )
                        )}

                    </div>
                )}

        </section>
    );
}

function MatchesTab({
    matches,
    loading,
    error
}) {
    return (
        <section className="profile-panel">

            <div className="profile-panel-header">

                <div>
                    <span className="dashboard-eyebrow">
                        MATCH PERFORMANCE
                    </span>

                    <h2>
                        Match History
                    </h2>
                </div>

                <span className="panel-badge">
                    {matches.length} MATCHES
                </span>

            </div>

            {loading && (
                <div className="profile-loading">
                    Loading match performances...
                </div>
            )}

            {error && (
                <div className="profile-error">
                    {error}
                </div>
            )}

            {!loading &&
                !error &&
                matches.length === 0 && (
                    <div className="profile-loading">
                        No match records found for this athlete.
                    </div>
                )}

            {!loading &&
                !error &&
                matches.length > 0 && (
                    <div className="matches-table-wrapper">

                        <table className="matches-table">

                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Opponent</th>
                                    <th>Competition</th>
                                    <th>Minutes</th>
                                    <th>Goals</th>
                                    <th>Assists</th>
                                    <th>Passes</th>
                                    <th>Tackles</th>
                                    <th>Interceptions</th>
                                    <th>Shots</th>
                                    <th>Rating</th>
                                </tr>
                            </thead>

                            <tbody>
                                {matches.map((match) => (
                                    <tr key={match._id}>

                                        <td>
                                            {match.matchDate
                                                ? new Date(
                                                    match.matchDate
                                                ).toLocaleDateString()
                                                : "—"}
                                        </td>

                                        <td>
                                            <strong>
                                                {match.opponent ||
                                                    "—"}
                                            </strong>
                                        </td>

                                        <td>
                                            {match.competition ||
                                                "—"}
                                        </td>

                                        <td>
                                            {match.minutesPlayed ??
                                                "—"}
                                        </td>

                                        <td>
                                            {match.goals ?? 0}
                                        </td>

                                        <td>
                                            {match.assists ?? 0}
                                        </td>

                                        <td>
                                            {match.passes ?? 0}
                                        </td>

                                        <td>
                                            {match.tackles ?? 0}
                                        </td>

                                        <td>
                                            {match.interceptions ?? 0}
                                        </td>

                                        <td>
                                            {match.shots ?? 0}
                                        </td>

                                        <td>
                                            <span className="match-rating">
                                                {match.performanceRating !== null &&
                                                match.performanceRating !== undefined
                                                    ? Number(match.performanceRating).toFixed(2)
                                                    : "—"}
                                            </span>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>

                        </table>

                    </div>
                )}

        </section>
    );
}

function AssessmentMetric({
    label,
    data
}) {
    if (!data) {
        return (
            <div className="assessment-metric">
                <span>{label}</span>
                <strong>—</strong>
            </div>
        );
    }

    return (
        <div className="assessment-metric">

            <span>{label}</span>

            <strong>
                {data.score ?? "—"}
            </strong>

            {data.result && (
                <small>
                    {data.result}
                </small>
            )}

        </div>
    );
}

export default AthleteProfile;