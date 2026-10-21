import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/ResearcherDashboard.css";
import DashboardLayout from "../components/layout/DashboardLayout";

const STATUS_OPTIONS = [
    "ELIGIBLE",
    "ELIGIBLE_WITH_REVIEW",
    "NOT_ELIGIBLE",
    "INSUFFICIENT_DATA"
];

function formatStatus(status = "INSUFFICIENT_DATA") {
    return status.replaceAll("_", " ");
}

function ResearcherDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [athletes, setAthletes] = useState([]);
    const [criteria, setCriteria] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedAthlete, setSelectedAthlete] = useState(null);
    const [decision, setDecision] = useState("INSUFFICIENT_DATA");
    const [remarks, setRemarks] = useState("");
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState("");
    
    const [showCriteriaForm, setShowCriteriaForm] = useState(false);
    const [criteriaForm, setCriteriaForm] = useState({
      name: "",
      description: "",
      minimumQualificationLevel: "DISTRICT",
      minimumAge: "",
      maximumAge: "",
      certificateRequired: false,
      documentsRequired: true,
      performanceThresholdEnabled: false,
      minimumPerformanceScore: ""
    });
   const [criteriaMessage, setCriteriaMessage] = useState("");
   const [criteriaSaving, setCriteriaSaving] = useState(false);

   
   const [reviewEvidence, setReviewEvidence] = useState({
     actualQualificationLevel: "UNKNOWN",
     certificatesVerified: null,
     documentsComplete: null,
     performanceScore: ""
   });

   
  const [reviewHistory, setReviewHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);


    async function loadData() {
        setLoading(true);
        setError("");

        try {
            const results = await Promise.allSettled([
                api.get("/researcher/dashboard"),
                api.get("/researcher/athletes"),
                api.get("/researcher/criteria")
            ]);

            const [dashboardResult, athletesResult, criteriaResult] = results;

            if (dashboardResult.status === "fulfilled") {
                setDashboard(
                    dashboardResult.value.data.data ??
                    dashboardResult.value.data
                );
            }

            if (athletesResult.status === "fulfilled") {
                const response = athletesResult.value.data;
                const list = response.data ?? response.athletes ?? response;
                setAthletes(Array.isArray(list) ? list : []);
            }

            if (criteriaResult.status === "fulfilled") {
                const response = criteriaResult.value.data;
                const list = response.data ?? response.criteria ?? response;
                setCriteria(Array.isArray(list) ? list : []);
            }

            if (
                dashboardResult.status === "rejected" &&
                athletesResult.status === "rejected"
            ) {
                setError(
                    "Could not load Researcher data. Check your login and backend API."
                );
            }
        } catch {
            setError("Unable to load Researcher dashboard.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    function getEligibility(item) {
        return item.eligibility ?? item.eligibilityRecord ?? item;
    }

    function getAthleteName(item) {
        const athlete = item.athleteId;
        if (athlete && typeof athlete === "object") {
            return athlete.name || "Unnamed athlete";
        }
        return item.name || item.athleteName || "Unnamed athlete";
    }

    function getAthleteId(item) {
        const athlete = item.athleteId;
        if (athlete && typeof athlete === "object") {
            return athlete._id || athlete.id;
        }
        return athlete || item._id || item.id;
    }

    function getStatus(item) {
        return getEligibility(item).status || "INSUFFICIENT_DATA";
    }

    const filteredAthletes = athletes.filter((item) => {
        const name = getAthleteName(item).toLowerCase();
        const matchesSearch = name.includes(search.toLowerCase());
        const matchesStatus =
            statusFilter === "ALL" || getStatus(item) === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const countStatus = (status) =>
        athletes.filter((item) => getStatus(item) === status).length;

    const stats = [
    {
        label: "Total Athletes",
        value: dashboard?.totalAthletes ?? athletes.length,
        color: "blue"
    },
    {
        label: "Eligible",
        value: dashboard?.eligible ?? countStatus("ELIGIBLE"),
        color: "green"
    },
    {
        label: "Needs Review",
        value: dashboard?.eligibleWithReview ?? countStatus("ELIGIBLE_WITH_REVIEW"),
        color: "amber"
    },
    {
        label: "Insufficient Data",
        value: dashboard?.insufficientData ?? countStatus("INSUFFICIENT_DATA"),
        color: "red"
    }
];

function openReview(item) {
    const eligibility = getEligibility(item) || {};

    setSelectedAthlete(item);
    setDecision(eligibility.status || "INSUFFICIENT_DATA");
    setRemarks(eligibility.researcherRemarks || "");

    setReviewEvidence({
        actualQualificationLevel:
            eligibility.actualQualificationLevel || "UNKNOWN",

        certificatesVerified:
            eligibility.certificatesVerified ?? null,

        documentsComplete:
            eligibility.documentsComplete ?? null,

        performanceScore:
            eligibility.performanceScore == null
                ? ""
                : String(eligibility.performanceScore)
    });

    setNotice("");

    loadReviewHistory(getAthleteId(item));
}
    
async function saveReview(event) {
    event.preventDefault();

    if (!selectedAthlete) return;

    const eligibility = getEligibility(selectedAthlete) || {};
    const athleteId = getAthleteId(selectedAthlete);
    const criteriaId =
        eligibility.criteriaId?._id ||
        eligibility.criteriaId ||
        criteria[0]?._id;

    if (!athleteId || !criteriaId) {
        setNotice(
            "A valid athlete and eligibility criteria are required before saving a decision."
        );
        return;
    }

    setSaving(true);
    setNotice("");

    try {
        
const payload = {
    athleteId,
    criteriaId,
    actualQualificationLevel:
        reviewEvidence.actualQualificationLevel,
    certificatesVerified:
        reviewEvidence.certificatesVerified,
    documentsComplete:
        reviewEvidence.documentsComplete,
    performanceScore:
        reviewEvidence.performanceScore === ""
            ? null
            : Number(reviewEvidence.performanceScore),
    performanceReviewed:
        reviewEvidence.performanceScore !== "",
    researcherRemarks: remarks.trim()
};


        const response = await api.post(
            "/researcher/eligibility",
            payload
        );

        if (response.data?.success === false) {
            throw new Error(
                response.data.message || "Unable to save the review."
            );
        }

        setNotice("Eligibility review saved successfully.");
        setSelectedAthlete(null);
        await loadData();
    } catch (error) {
        setNotice(
            error.response?.data?.message ||
            error.message ||
            "Unable to save the eligibility review."
        );
    } finally {
        setSaving(false);
    }
}

    if (loading) {
        return (
            <main className="researcher-page">
                <div className="researcher-loading">
                    Loading Researcher Dashboard...
                </div>
            </main>
        );
    }

    
const handleCreateCriteria = async (e) => {
  e.preventDefault();
  setCriteriaMessage("");

  if (!criteriaForm.name.trim()) {
    setCriteriaMessage("Please enter a criteria name.");
    return;
  }

  setCriteriaSaving(true);

  try {
    const payload = {
      ...criteriaForm,
      minimumAge:
        criteriaForm.minimumAge === ""
          ? undefined
          : Number(criteriaForm.minimumAge),
      maximumAge:
        criteriaForm.maximumAge === ""
          ? undefined
          : Number(criteriaForm.maximumAge),
      minimumPerformanceScore:
        criteriaForm.performanceThresholdEnabled &&
        criteriaForm.minimumPerformanceScore !== ""
          ? Number(criteriaForm.minimumPerformanceScore)
          : undefined
    };

    await api.post("/researcher/criteria", payload);

    setCriteriaMessage("Eligibility criteria created successfully!");

    setCriteriaForm({
      name: "",
      description: "",
      minimumQualificationLevel: "DISTRICT",
      minimumAge: "",
      maximumAge: "",
      certificateRequired: false,
      documentsRequired: true,
      performanceThresholdEnabled: false,
      minimumPerformanceScore: ""
    });

    setShowCriteriaForm(false);
    await loadData();
  } catch (error) {
    setCriteriaMessage(
      error.response?.data?.message || "Failed to create criteria."
    );
  } finally {
    setCriteriaSaving(false);
  }
};


async function loadReviewHistory(athleteId) {
    if (!athleteId) return;

    setHistoryLoading(true);

    try {
        const response = await api.get(
            `/researcher/eligibility-history/${athleteId}`
        );

        setReviewHistory(response.data?.data || []);
    } catch (error) {
        console.error("Unable to load review history:", error);
        setReviewHistory([]);
    } finally {
        setHistoryLoading(false);
    }
}

    return (
        <DashboardLayout>
        <main className="researcher-page">
            <header className="researcher-header">
                <div>
                    <span className="researcher-eyebrow">
                        ATHLETE MANAGEMENT SYSTEM
                    </span>
                    <h1>Researcher Dashboard</h1>
                    <p>
                        Review athlete eligibility, supporting evidence and
                        performance records.
                    </p>
                </div>

                <button
                    className="researcher-refresh"
                    onClick={loadData}
                    type="button"
                >
                    Refresh Data
                </button>

                
<button
    type="button"
    className="researcher-refresh"
    onClick={async () => {
        try {
            const response = await api.get(
                "/researcher/eligibility-reports/all",
                { responseType: "blob" }
            );

            const url = window.URL.createObjectURL(
                new Blob([response.data], { type: "application/pdf" })
            );

            const link = document.createElement("a");
            link.href = url;
            link.download = "AMS_All_Athletes_Eligibility_Report.pdf";
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            setNotice("Unable to download the consolidated report.");
        }
    }}
>
    Download All Reports
</button>

            </header>

            {error && (
                <div className="researcher-alert error">{error}</div>
            )}

            {notice && (
                <div className="researcher-alert">{notice}</div>
            )}

            <section className="researcher-stat-grid">
                {stats.map((stat) => (
                    <article
                        className={`researcher-stat ${stat.color}`}
                        key={stat.label}
                    >
                        <span>{stat.label}</span>
                        <strong>{stat.value}</strong>
                        <small>Current records</small>
                    </article>
                ))}
            </section>

            <section className="researcher-panel">
                <div className="researcher-panel-heading">
                    <div>
                        <h2>Athlete Eligibility Review</h2>
                        <p>
                            Review eligibility records separately from
                            athletic performance.
                        </p>
                    </div>
                    <span className="researcher-record-count">
                        {filteredAthletes.length} records
                    </span>
                </div>

                <div className="researcher-filters">
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search athletes..."
                        aria-label="Search athletes"
                    />

                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        aria-label="Filter by eligibility status"
                    >
                        <option value="ALL">All statuses</option>
                        {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                                {formatStatus(status)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="researcher-table-wrap">
                    <table className="researcher-table">
                        <thead>
                            <tr>
                                <th>Athlete</th>
                                <th>Qualification</th>
                                <th>Performance</th>
                                <th>Eligibility Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredAthletes.map((item, index) => {
                                const eligibility = getEligibility(item);
                                const athleteId = getAthleteId(item);
                                const performanceScore =
                                    eligibility.performanceScore ??
                                    item.performanceScore;

                                return (
                                    <tr key={athleteId || index}>
                                        <td>
                                            <strong>{getAthleteName(item)}</strong>
                                            <small>
                                                {item.position ||
                                                    item.athleteId?.position ||
                                                    "Position not recorded"}
                                            </small>
                                        </td>

                                        <td>
                                            {eligibility.actualQualificationLevel ||
                                                item.qualificationLevel ||
                                                "Not recorded"}
                                        </td>

                                        <td>
                                            {performanceScore == null
                                                ? "Not assessed"
                                                : `${performanceScore}/100`}
                                        </td>

                                        
<td>
    <span
        className={`researcher-status ${getStatus(item).toLowerCase()}`}
    >
        {formatStatus(getStatus(item))}
    </span>

    <small className="eligibility-reason">
        {getEligibility(item).reason ||
            "No evaluation reason recorded yet."}
    </small>
</td>


                                        <td>
                                            <div className="researcher-actions">
                                                <button
                                                    type="button"
                                                    onClick={() => openReview(item)}
                                                >
                                                    Review
                                                </button>

                                                {athleteId && (
                                                    <Link to={`/athletes/${athleteId}`}>
                                                        Profile
                                                    </Link>
                                                )}

                                                
<button
    type="button"
    onClick={async () => {
        try {
            const athleteId = getAthleteId(item);

            const response = await api.get(
                `/researcher/athletes/${athleteId}/eligibility-report`,
                { responseType: "blob" }
            );

            const url = window.URL.createObjectURL(
                new Blob([response.data], { type: "application/pdf" })
            );

            const link = document.createElement("a");
            link.href = url;
            link.download = `${getAthleteName(item).replace(/[^a-z0-9_-]/gi, "_")}_eligibility_report.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            setNotice("Unable to download the eligibility report. Ensure the athlete has a saved eligibility review.");
        }
    }}
>
    Download PDF
</button>


                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filteredAthletes.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="researcher-empty">
                                        No athlete eligibility records found.
                                        Create or load eligibility records to
                                        display them here.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            
<div className="criteria-management">
  <div className="criteria-management-header">
    <div>
      <h3>Eligibility Criteria Management</h3>
      <p>Create criteria to evaluate athlete eligibility.</p>
    </div>

    <button
      type="button"
      onClick={() => {
        setCriteriaMessage("");
        setShowCriteriaForm(!showCriteriaForm);
      }}
    >
      {showCriteriaForm ? "Cancel" : "+ Create Criteria"}
    </button>
  </div>

  {criteriaMessage && (
    <p role="status">{criteriaMessage}</p>
  )}

  {showCriteriaForm && (
    <form onSubmit={handleCreateCriteria} className="criteria-form">
      <label>
        Criteria Name
        <input
          value={criteriaForm.name}
          onChange={(e) =>
            setCriteriaForm({ ...criteriaForm, name: e.target.value })
          }
          placeholder="e.g. State-Level Athlete"
          required
        />
      </label>

      <label>
        Description
        <textarea
          value={criteriaForm.description}
          onChange={(e) =>
            setCriteriaForm({ ...criteriaForm, description: e.target.value })
          }
          placeholder="Describe the eligibility requirements"
        />
      </label>

      <label>
        Minimum Qualification Level
        <select
          value={criteriaForm.minimumQualificationLevel}
          onChange={(e) =>
            setCriteriaForm({
              ...criteriaForm,
              minimumQualificationLevel: e.target.value
            })
          }
        >
          <option value="LOCAL">Local</option>
          <option value="DISTRICT">District</option>
          <option value="STATE">State</option>
          <option value="NATIONAL">National</option>
          <option value="INTERNATIONAL">International</option>
        </select>
      </label>

      <div className="criteria-form-row">
        <label>
          Minimum Age
          <input
            type="number"
            min="0"
            value={criteriaForm.minimumAge}
            onChange={(e) =>
              setCriteriaForm({ ...criteriaForm, minimumAge: e.target.value })
            }
          />
        </label>

        <label>
          Maximum Age
          <input
            type="number"
            min="0"
            value={criteriaForm.maximumAge}
            onChange={(e) =>
              setCriteriaForm({ ...criteriaForm, maximumAge: e.target.value })
            }
          />
        </label>
      </div>

      <label className="criteria-checkbox">
        <input
          type="checkbox"
          checked={criteriaForm.certificateRequired}
          onChange={(e) =>
            setCriteriaForm({
              ...criteriaForm,
              certificateRequired: e.target.checked
            })
          }
        />
        Certificate required
      </label>

      <label className="criteria-checkbox">
        <input
          type="checkbox"
          checked={criteriaForm.documentsRequired}
          onChange={(e) =>
            setCriteriaForm({
              ...criteriaForm,
              documentsRequired: e.target.checked
            })
          }
        />
        Documents required
      </label>

      <label className="criteria-checkbox">
        <input
          type="checkbox"
          checked={criteriaForm.performanceThresholdEnabled}
          onChange={(e) =>
            setCriteriaForm({
              ...criteriaForm,
              performanceThresholdEnabled: e.target.checked
            })
          }
        />
        Enable minimum performance score
      </label>

      {criteriaForm.performanceThresholdEnabled && (
        <label>
          Minimum Performance Score (0–100)
          <input
            type="number"
            min="0"
            max="100"
            value={criteriaForm.minimumPerformanceScore}
            onChange={(e) =>
              setCriteriaForm({
                ...criteriaForm,
                minimumPerformanceScore: e.target.value
              })
            }
            required
          />
        </label>
      )}

      <button type="submit" disabled={criteriaSaving}>
        {criteriaSaving ? "Saving..." : "Save Criteria"}
      </button>
    </form>
  )}
</div>

            <section className="researcher-panel researcher-criteria">
                <div className="researcher-panel-heading">
                    <div>
                        <h2>Eligibility Criteria</h2>
                        <p>
                            Standards currently available for researcher review.
                        </p>
                    </div>
                    <span className="researcher-record-count">
                        {criteria.length} criteria
                    </span>
                </div>

                {criteria.length === 0 ? (
                    <p className="researcher-empty">
                        No criteria have been configured yet.
                    </p>
                ) : (
                    <div className="researcher-criteria-grid">
                        {criteria.map((item) => (
                            <article key={item._id} className="researcher-criteria-card">
                                <h3>{item.name}</h3>
                                <p>{item.description || "No description provided."}</p>
                                <span>
                                    Minimum qualification:{" "}
                                    {item.minimumQualificationLevel || "Not specified"}
                                </span>
                                <span>
                                    Status: {item.status || "ACTIVE"}
                                </span>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {selectedAthlete && (
                <div
                    className="researcher-modal-backdrop"
                    onClick={() => setSelectedAthlete(null)}
                >
                    <section
                        className="researcher-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="researcher-modal-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="researcher-modal-heading">
                            <div>
                                <span className="researcher-eyebrow">
                                    ELIGIBILITY DECISION
                                </span>
                                <h2 id="researcher-modal-title">
                                    {getAthleteName(selectedAthlete)}
                                </h2>
                            </div>
                            <button
                                type="button"
                                className="researcher-close"
                                onClick={() => setSelectedAthlete(null)}
                                aria-label="Close review"
                            >
                                ×
                            </button>
                        </div>

                        
<div className="eligibility-details">
    <h3>Current Eligibility Summary</h3>

    <div className="eligibility-details-grid">
        <div>
            <span>Current Status</span>
            <strong>
                {formatStatus(getStatus(selectedAthlete))}
            </strong>
        </div>

        <div>
            <span>Qualification Level</span>
            <strong>
                {getEligibility(selectedAthlete).actualQualificationLevel ||
                    "Not recorded"}
            </strong>
        </div>

        <div>
            <span>Age Eligibility</span>
            <strong>
                {getEligibility(selectedAthlete).ageEligible == null
                    ? "Not assessed"
                    : getEligibility(selectedAthlete).ageEligible
                        ? "Eligible"
                        : "Not eligible"}
            </strong>
        </div>

        <div>
            <span>Certificate Verification</span>
            <strong>
                {getEligibility(selectedAthlete).certificatesVerified == null
                    ? "Pending"
                    : getEligibility(selectedAthlete).certificatesVerified
                        ? "Verified"
                        : "Not verified"}
            </strong>
        </div>

        <div>
            <span>Documents</span>
            <strong>
                {getEligibility(selectedAthlete).documentsComplete == null
                    ? "Pending"
                    : getEligibility(selectedAthlete).documentsComplete
                        ? "Complete"
                        : "Incomplete"}
            </strong>
        </div>

        <div>
            <span>Performance Score</span>
            <strong>
                {getEligibility(selectedAthlete).performanceScore == null
                    ? "Not assessed"
                    : `${getEligibility(selectedAthlete).performanceScore}/100`}
            </strong>
        </div>
    </div>

    <div className="eligibility-details-reason">
        <strong>Evaluation Reason</strong>
        <p>
            {getEligibility(selectedAthlete).reason ||
                "No evaluation reason recorded yet."}
        </p>
    </div>

    <div className="eligibility-details-reason">
        <strong>Previous Researcher Remarks</strong>
        <p>
            {getEligibility(selectedAthlete).researcherRemarks ||
                "No remarks recorded yet."}
        </p>
    </div>
</div>

                        <form onSubmit={saveReview}>
                            <label htmlFor="researcher-decision">
                                Eligibility status
                            </label>

                            
<label htmlFor="researcher-qualification">
    Actual Qualification Level
</label>
<select
    id="researcher-qualification"
    value={reviewEvidence.actualQualificationLevel}
    onChange={(event) =>
        setReviewEvidence({
            ...reviewEvidence,
            actualQualificationLevel: event.target.value
        })
    }
>
    <option value="UNKNOWN">Not recorded</option>
    <option value="NONE">No qualification</option>
    <option value="LOCAL">Local</option>
    <option value="DISTRICT">District</option>
    <option value="STATE">State</option>
    <option value="NATIONAL">National</option>
    <option value="INTERNATIONAL">International</option>
</select>

<label htmlFor="researcher-certificates">
    Certificate Verification
</label>
<select
    id="researcher-certificates"
    value={
        reviewEvidence.certificatesVerified === null
            ? ""
            : String(reviewEvidence.certificatesVerified)
    }
    onChange={(event) =>
        setReviewEvidence({
            ...reviewEvidence,
            certificatesVerified:
                event.target.value === ""
                    ? null
                    : event.target.value === "true"
        })
    }
>
    <option value="">Pending verification</option>
    <option value="true">Verified</option>
    <option value="false">Not verified</option>
</select>

<label htmlFor="researcher-documents">
    Document Verification
</label>
<select
    id="researcher-documents"
    value={
        reviewEvidence.documentsComplete === null
            ? ""
            : String(reviewEvidence.documentsComplete)
    }
    onChange={(event) =>
        setReviewEvidence({
            ...reviewEvidence,
            documentsComplete:
                event.target.value === ""
                    ? null
                    : event.target.value === "true"
        })
    }
>
    <option value="">Pending verification</option>
    <option value="true">Complete</option>
    <option value="false">Incomplete</option>
</select>

<label htmlFor="researcher-performance">
    Performance Score (0–100, optional)
</label>
<input
    id="researcher-performance"
    type="number"
    min="0"
    max="100"
    value={reviewEvidence.performanceScore}
    onChange={(event) =>
        setReviewEvidence({
            ...reviewEvidence,
            performanceScore: event.target.value
        })
    }
    placeholder="Enter assessed performance score"
/>


                            <select
                                id="researcher-decision"
                                value={decision}
                                onChange={(event) => setDecision(event.target.value)}
                            >
                                {STATUS_OPTIONS.map((status) => (
                                    <option key={status} value={status}>
                                        {formatStatus(status)}
                                    </option>
                                ))}
                            </select>

                            <label htmlFor="researcher-remarks">
                                Researcher remarks
                            </label>

                            <textarea
                                id="researcher-remarks"
                                rows="4"
                                value={remarks}
                                onChange={(event) => setRemarks(event.target.value)}
                                placeholder="Record evidence reviewed, missing documents or reasons for this decision..."
                            />

                            <p className="researcher-form-note">
                                A low performance score alone should not
                                automatically invalidate an athlete's eligibility.
                            </p>

                            <div className="researcher-modal-actions">
                                <button
                                    type="button"
                                    className="secondary"
                                    onClick={() => setSelectedAthlete(null)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving}>
                                    {saving ? "Saving..." : "Save Decision"}
                                </button>
                            </div>
                        </form>

                        <div className="review-history">
    <h3>Review History</h3>

    {historyLoading ? (
        <p>Loading review history...</p>
    ) : reviewHistory.length === 0 ? (
        <p>No previous review history available.</p>
    ) : (
        <div className="review-history-list">
            {reviewHistory.map((record) => (
                <article key={record._id} className="review-history-item">
                    <div>
                        <strong>{formatStatus(record.status)}</strong>
                        <span>
                            {record.reviewedAt
                                ? new Date(record.reviewedAt).toLocaleString()
                                : "Date unavailable"}
                        </span>
                    </div>

                    <p>{record.reason || "No evaluation reason recorded."}</p>

                    <p>
                        <strong>Researcher:</strong>{" "}
                        {record.reviewedBy?.name || "Unknown"}
                    </p>

                    <p>
                        <strong>Remarks:</strong>{" "}
                        {record.researcherRemarks || "No remarks"}
                    </p>
                </article>
            ))}
        </div>
    )}
</div>

                    </section>

                </div>
            )}
        </main>
    </DashboardLayout>
    );
}

export default ResearcherDashboard;