import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import api from "../services/api";
import "../styles/aiReports.css";

/* =====================================================
   COMMON HELPERS
===================================================== */

const getAuthConfig = () => {
    const token = localStorage.getItem("ams_token");

    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

const formatScore = (value) => {
    if (value === undefined || value === null || value === "") {
        return "—";
    }

    const number = Number(value);

    return Number.isNaN(number) ? "—" : number.toFixed(1);
};

const getScoreClass = (score) => {
    const value = Number(score);

    if (Number.isNaN(value)) {
        return "";
    }

    if (value >= 80) {
        return "score-high";
    }

    if (value >= 60) {
        return "score-medium";
    }

    return "score-low";
};

/* =====================================================
   ADMIN / COACH AI REPORTS
===================================================== */

function SquadAIReports() {
    const navigate = useNavigate();

    const [athlete, setAthlete] = useState(null);
    const [athletes, setAthletes] = useState([]);
    const [performanceData, setPerformanceData] = useState({});
    const [assessmentData, setAssessmentData] = useState({});
    const [analysis, setAnalysis] = useState({});
    const [report, setReport] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [positionFilter, setPositionFilter] = useState("ALL");

    useEffect(() => {
        loadAthletes();
    }, []);

    const loadAthletes = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/athletes");

            const data = response.data.data || [];

            setAthletes(data);

            await loadPerformanceData(data);
            await loadAssessmentData(data);

        } catch (err) {
            console.error("Failed to load athletes:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load athlete reports"
            );
        } finally {
            setLoading(false);
        }
    };

    const loadPerformanceData = async (athleteList) => {
        const performanceMap = {};

        await Promise.all(
            athleteList.map(async (athlete) => {
                try {
const response = await api.post(
    `/ml/performance/${athlete._id}`,
    {}
);

                    performanceMap[athlete._id] =
                        response.data.analysis || {};
                } catch (err) {
                    console.error(
                        `Performance analysis failed for ${athlete.name}:`,
                        err
                    );

                    performanceMap[athlete._id] = {};
                }
            })
        );

        setPerformanceData(performanceMap);
    };

    const loadAssessmentData = async (athleteList) => {
    const assessmentMap = {};

    await Promise.all(
        athleteList.map(async (athlete) => {
            try {
                const response = await api.get(
                    `/assessments/athlete/${athlete._id}`
                );

                const assessments =
                    response.data.data || [];

                // Use the most recent assessment
                const latestAssessment =
                    assessments.length > 0
                        ? assessments[0]
                        : null;

                assessmentMap[athlete._id] =
                    latestAssessment;
            } catch (err) {
                console.error(
                    `Assessment loading failed for ${athlete.name}:`,
                    err
                );

                assessmentMap[athlete._id] = null;
            }
        })
    );

    setAssessmentData(assessmentMap);
};

    const positions = useMemo(() => {
        const uniquePositions = [
            ...new Set(
                athletes
                    .map((athlete) => athlete.position)
                    .filter(Boolean)
            )
        ];

        return uniquePositions.sort();
    }, [athletes]);

    const filteredAthletes = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return athletes.filter((athlete) => {
            const matchesSearch =
                !search ||
                athlete.name?.toLowerCase().includes(search) ||
                athlete.club?.toLowerCase().includes(search) ||
                athlete.position?.toLowerCase().includes(search);

            const matchesPosition =
                positionFilter === "ALL" ||
                athlete.position === positionFilter;

            return matchesSearch && matchesPosition;
        });
    }, [athletes, searchTerm, positionFilter]);

    const handleViewReport = (athleteId) => {
        navigate(`/athletes/${athleteId}?tab=report`);
    };

    return (
        <DashboardLayout>
            <div className="ai-reports-page">

                <div className="ai-reports-header">
                    <div>
                        <span className="dashboard-eyebrow">
                            ATHLETE INTELLIGENCE
                        </span>

                        <h1>AI Reports</h1>

                        <p>
                            Review AI-powered performance reports
                            across your entire squad.
                        </p>
                    </div>

                    <div className="ai-reports-header-stat">
                        <span>TOTAL ATHLETES</span>

                        <strong>{athletes.length}</strong>
                    </div>
                </div>

                <div className="ai-reports-toolbar">
                    <div className="ai-reports-search">
                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search athlete, position or club..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                        />
                    </div>

                    <select
                        value={positionFilter}
                        onChange={(event) =>
                            setPositionFilter(event.target.value)
                        }
                    >
                        <option value="ALL">
                            All Positions
                        </option>

                        {positions.map((position) => (
                            <option
                                key={position}
                                value={position}
                            >
                                {position}
                            </option>
                        ))}
                    </select>
                </div>

                {error && (
                    <div className="ai-reports-error">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="ai-reports-loading">
                        <div className="ai-reports-loader" />

                        <h3>Loading athlete reports</h3>

                        <p>
                            Preparing your squad's performance
                            intelligence...
                        </p>
                    </div>
                ) : filteredAthletes.length === 0 ? (
                    <div className="ai-reports-empty">
                        <div className="ai-reports-empty-icon">
                            ✦
                        </div>

                        <h3>No athletes found</h3>

                        <p>
                            Try changing your search or position filter.
                        </p>
                    </div>
                ) : (
                    <div className="ai-reports-list">
                        {filteredAthletes.map((athlete) => {
    const performance =
        performanceData[athlete._id] || {};

    const assessment =
        assessmentData[athlete._id] || null;

    const benchmark =
        assessment?.benchmarkValidation || null;

    console.log("🔥 BENCHMARK DATA:", benchmark);

                            return (
                                <div
                                    className="ai-report-athlete-card"
                                    key={athlete._id}
                                >
                                    <div className="ai-report-athlete">
                                        <div>
                                            <h3>{athlete.name}</h3>

                                            <p>
                                                {athlete.position ||
                                                    "Position not set"}

                                                {athlete.club
                                                    ? ` · ${athlete.club}`
                                                    : ""}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="ai-report-metric">
                                        <span>OVERALL</span>

                                        <strong
                                            className={getScoreClass(
                                                performance.overallScore
                                            )}
                                        >
                                            {formatScore(
                                                performance.overallScore
                                            )}
                                        </strong>

                                        <small>/ 100</small>
                                    </div>

                                    <div className="ai-report-metric">
                                        <span>MATCH</span>

                                        <strong>
                                            {formatScore(
                                                performance.matchScore
                                            )}
                                        </strong>

                                        <small>/ 100</small>
                                    </div>

                                    <div className="ai-report-metric">
                                        <span>TRAINING</span>

                                        <strong>
                                            {formatScore(
                                                performance.trainingScore
                                            )}
                                        </strong>

                                        <small>/ 100</small>
                                    </div>

                                    <div className="ai-report-trend">
                                        <span>TREND</span>

                                        <strong>
                                            {performance.trend || "—"}
                                        </strong>
                                    </div>

{benchmark && (
    <div className="ai-benchmark-summary">

        <div className="ai-benchmark-header">
            <span>BENCHMARK INTELLIGENCE</span>

            <strong
                className={
                    benchmark.overallStatus === "PASS"
                        ? "benchmark-pass"
                        : benchmark.overallStatus === "NEEDS_REVIEW"
                        ? "benchmark-review"
                        : "benchmark-neutral"
                }
            >
                {benchmark.overallStatus || "NOT CHECKED"}
            </strong>
        </div>

        <div className="ai-benchmark-grid">

<div className="ai-benchmark-stat">
    <span>PERFORMANCE INDEX</span>
    <strong>
        {benchmark?.overallPerformanceIndex ?? "—"}
    </strong>
</div>

<div className="ai-benchmark-stat">
    <span>LEVEL</span>
    <strong>
        {benchmark?.overallPerformanceLevel ?? "—"}
    </strong>
</div>

            <div className="ai-benchmark-stat">
                <span>COVERAGE</span>
                <strong>
                    {benchmark.benchmarkCoverage ?? 0}%
                </strong>
            </div>

            <div className="ai-benchmark-stat">
                <span>CHECKED</span>
                <strong>
                    {benchmark.metricsChecked ?? 0}
                </strong>
            </div>

            <div className="ai-benchmark-stat">
                <span>BENCHMARKS</span>
                <strong>
                    {benchmark.metricsWithBenchmark ?? 0}
                </strong>
            </div>

            <div className="ai-benchmark-stat">
                <span>ANOMALIES</span>
                <strong>
                    {benchmark.anomaliesDetected ?? 0}
                </strong>
            </div>

        </div>
    </div>
)}

                                    <button
                                        type="button"
                                        className="ai-report-view-button"
                                        onClick={() =>
                                            handleViewReport(athlete._id)
                                        }
                                    >
                                        View Report
                                        <span>→</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

/* =====================================================
   ATHLETE PERSONAL AI REPORT
===================================================== */

function AthleteOwnAIReport() {
    const navigate = useNavigate();

    const [athlete, setAthlete] = useState(null);
    const [analysis, setAnalysis] = useState({});
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadMyReport();
    }, []);

    const loadMyReport = async () => {
    try {
        setLoading(true);
        setError("");

        // 1. Fetch logged-in athlete profile
        const profileResponse = await api.get("/athletes/me");

        console.log(
            "My athlete profile API response:",
            profileResponse.data
        );

        const profileData = profileResponse.data.data;

        const myAthlete =
            profileData?.athlete ||
            profileData;

        if (!myAthlete?._id) {
            console.error(
                "Athlete profile does not contain an ID:",
                profileData
            );

            throw new Error(
                "Your athlete profile was not found."
            );
        }

        setAthlete(myAthlete);

        // Continue with the remaining report-generation code...

        // 2. Generate or update the premium AI report
        const reportResponse = await api.post(
            `/reports/generate/${myAthlete._id}`
        );

        console.log("Full AI Report Response:", reportResponse.data);

        const reportData = reportResponse.data?.data;

        if (!reportData?.report?._id) {
            throw new Error(
                "AI report ID was not returned by the server."
            );
        }

        // 3. Store the complete report
        setReport(reportData.report);

        // 4. Store performance analysis
        setAnalysis(
            reportData.performanceAnalysis || {}
        );

    } catch (err) {
        console.error(
            "Failed to load personal AI report:",
            err
        );

        setError(
            err.response?.data?.message ||
            err.message ||
            "Failed to load your AI report."
        );
    } finally {
        setLoading(false);
    }
};

    const handleViewDetailedReport = () => {
        if (!athlete?._id) {
            return;
        }

        navigate(
            `/athletes/${athlete._id}?tab=report`
        );
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="ai-reports-page">
                    <div className="ai-reports-loading">
                        <div className="ai-reports-loader" />

                        <h3>Loading your AI report</h3>

                        <p>
                            Preparing your personal performance
                            intelligence...
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="ai-reports-page">

                <div className="ai-reports-header">
                    <div>
                        <span className="dashboard-eyebrow">
                            ATHLETE INTELLIGENCE
                        </span>

                        <h1>My AI Report</h1>

                        <p>
                            Review your personal AI-powered
                            performance analysis.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="ai-reports-error">
                        {error}
                    </div>
                )}

                {!error && athlete && (
                    <div className="ai-report-athlete-card">

                        <div className="ai-report-athlete">
                            <div>
                                <h3>
                                    {athlete.name ||
                                        "My Performance"}
                                </h3>

                                <p>
                                    {athlete.position ||
                                        "Athlete"}

                                    {athlete.club
                                        ? ` · ${athlete.club}`
                                        : ""}
                                </p>
                            </div>
                        </div>

                        <div className="ai-report-metric">
                            <span>OVERALL</span>

                            <strong
                                className={getScoreClass(
                                    analysis.overallScore
                                )}
                            >
                                {formatScore(
                                    analysis.overallScore
                                )}
                            </strong>

                            <small>/ 100</small>
                        </div>

                        <div className="ai-report-metric">
                            <span>MATCH</span>

                            <strong>
                                {formatScore(
                                    analysis.matchScore
                                )}
                            </strong>

                            <small>/ 100</small>
                        </div>

                        <div className="ai-report-metric">
                            <span>TRAINING</span>

                            <strong>
                                {formatScore(
                                    analysis.trainingScore
                                )}
                            </strong>

                            <small>/ 100</small>
                        </div>

                        <div className="ai-report-trend">
                            <span>TREND</span>

                            <strong>
                                {analysis.trend || "—"}
                            </strong>
                        </div>

                        <button
                            type="button"
                            className="ai-report-view-button"
                            onClick={handleViewDetailedReport}
                        >
                            View Detailed Report
                            <span>→</span>
                        </button>
                    </div>
                )}

                {!error && !athlete && (
                    <div className="ai-reports-empty">
                        <div className="ai-reports-empty-icon">
                            ✦
                        </div>

                        <h3>Profile not found</h3>

                        <p>
                            Your athlete profile could not be loaded.
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

/* =====================================================
   MAIN COMPONENT
===================================================== */

function AIReports() {
    const user = JSON.parse(
        localStorage.getItem("ams_user") || "{}"
    );

    const role = String(
        user.role || ""
    ).toUpperCase();

    if (role === "ATHLETE") {
        return <AthleteOwnAIReport />;
    }

    return <SquadAIReports />;
}

export default AIReports;