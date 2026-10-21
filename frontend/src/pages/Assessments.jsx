import { useEffect, useState } from "react";
import api from "../services/api";
import DashboardLayout from "../components/layout/DashboardLayout";


const physicalFields = [
    {
        key: "lowerBodyStrength",
        label: "Lower Body Strength"
    },
    {
        key: "coreStrength",
        label: "Core Strength"
    },
    {
        key: "sprint20m",
        label: "20m Sprint"
    },
    {
        key: "sprint50m",
        label: "50m Sprint"
    },
    {
        key: "agility505",
        label: "505 Agility"
    },
    {
        key: "verticalJump",
        label: "Vertical Jump"
    },
    {
        key: "aerobicCapacity",
        label: "Aerobic Capacity"
    },
    {
        key: "flexibility",
        label: "Flexibility"
    },
    {
        key: "mobility",
        label: "Mobility"
    }

];

const technicalFields = [
    {
        key: "firstTouch",
        label: "First Touch"
    },
    {
        key: "shortPassing",
        label: "Short Passing"
    },
    {
        key: "longPassing",
        label: "Long Passing"
    },
    {
        key: "shootingPower",
        label: "Shooting Power"
    },
    {
        key: "shootingAccuracy",
        label: "Shooting Accuracy"
    },
    {
        key: "dribbling",
        label: "Dribbling"
    },
    {
        key: "crossing",
        label: "Crossing"
    },
    {
        key: "heading",
        label: "Heading"
    },
    {
        key: "tackling",
        label: "Tackling"
    }
];

const footFields = [
    {
        key: "rightFootPower",
        label: "Right Foot Power"
    },
    {
        key: "rightFootPassing",
        label: "Right Foot Passing"
    },
    {
        key: "rightFootControl",
        label: "Right Foot Control"
    },
    {
        key: "leftFootPower",
        label: "Left Foot Power"
    },
    {
        key: "leftFootPassing",
        label: "Left Foot Passing"
    },
    {
        key: "leftFootControl",
        label: "Left Foot Control"
    },
    {
        key: "weakFootUsage",
        label: "Weak Foot Usage"
    }
];

const tacticalFields = [
    {
        key: "offBallMovement",
        label: "Off-Ball Movement"
    },
    {
        key: "positionalDiscipline",
        label: "Positional Discipline"
    },
    {
        key: "criticalThinking",
        label: "Critical Thinking"
    }
];

const recoveryFields = [
    {
        key: "hsrDistance",
        label: "HSR Distance"
    },
    {
        key: "sprintCount1H",
        label: "Sprint Count 1H"
    },
    {
        key: "sprintCount2H",
        label: "Sprint Count 2H"
    },
    {
        key: "hrRecovery",
        label: "HR Recovery"
    }
];

const noteFields = [
    {
        key: "injuryNotes",
        label: "Injury Notes",
        placeholder: "Enter injury or medical notes..."
    },
    {
        key: "coachNotes",
        label: "Coach Notes",
        placeholder: "Enter coach observations and comments..."
    },
    {
        key: "nutritionNotes",
        label: "Nutrition Notes",
        placeholder: "Enter nutrition or diet-related notes..."
    }
];

function Assessments() {
    const [athletes, setAthletes] = useState([]);
    const [selectedAthlete, setSelectedAthlete] = useState("");
    const [assessments, setAssessments] = useState([]);

    const [loadingAthletes, setLoadingAthletes] = useState(true);
    const [loadingAssessments, setLoadingAssessments] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [assessmentDate, setAssessmentDate] =
        useState(
            new Date().toISOString().split("T")[0]
        );

    const [formData, setFormData] = useState({});

    const user = JSON.parse(
        localStorage.getItem("ams_user") || "{}"
    );


    useEffect(() => {
        if (user.role === "ATHLETE") {
            loadMyAssessments();
        } else {
            loadAthletes();
        }
    }, []);

    const loadMyAssessments = async () => {
        try {
            setLoadingAthletes(false);
            setLoadingAssessments(true);
            setError("");

            const response = await api.get("/assessments/me");
            setAssessments(response.data.data || []);
        } catch (error) {
            console.error("Failed to load my assessments:", error);
            setError(
                error.response?.data?.message ||
                "Failed to load your assessments"
            );
            setAssessments([]);
        } finally {
            setLoadingAssessments(false);
        }
    };

    const loadAthletes = async () => {
        try {
            setLoadingAthletes(true);
            setError("");

            const response = await api.get("/athletes");

            setAthletes(response.data.data || []);
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
            setLoadingAthletes(false);
        }
    };

    const loadAssessments = async (athleteId) => {
        if (!athleteId) {
            setAssessments([]);
            return;
        }

        try {
            setLoadingAssessments(true);
            setError("");

            const response = await api.get(
                `/assessments/athlete/${athleteId}`
            );

            setAssessments(
                response.data.data || []
            );
        } catch (error) {
            console.error(
                "Failed to load assessments:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load assessments"
            );

            setAssessments([]);
        } finally {
            setLoadingAssessments(false);
        }
    };

    const handleAthleteChange = (event) => {
        const athleteId = event.target.value;

        setSelectedAthlete(athleteId);
        setShowForm(false);
        setSuccess("");
        setError("");

        loadAssessments(athleteId);
    };

    const handleFormChange = (
        field,
        type,
        value
    ) => {
        setFormData((previous) => ({
            ...previous,
            [field]: {
                ...(previous[field] || {}),
                [type]: value
            }
        }));
    };

    const openNewAssessment = () => {
        if (!selectedAthlete) {
            setError(
                "Please select an athlete first."
            );
            return;
        }

        setError("");
        setSuccess("");
        setAssessmentDate(
            new Date()
                .toISOString()
                .split("T")[0]
        );
        setFormData({});
        setShowForm(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedAthlete) {
            setError(
                "Please select an athlete first."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {
                athleteId: selectedAthlete,
                assessmentDate: new Date(
                    assessmentDate
                ).toISOString()
            };

            physicalFields.forEach(
                ({ key }) => {
                    const field =
                        formData[key] || {};

                    payload[key] = {
                        result:
                            field.result || "",
                        score:
                            field.score === ""
                                ? undefined
                                : field.score !==
                                  undefined
                                ? Number(
                                      field.score
                                  )
                                : undefined
                    };
                }
            );

            technicalFields.forEach(
                ({ key }) => {
                    const field =
                        formData[key] || {};

                    payload[key] = {
                        result:
                            field.result || "",
                        score:
                            field.score === ""
                                ? undefined
                                : field.score !==
                                  undefined
                                ? Number(
                                      field.score
                                  )
                                : undefined
                    };
                }
            );

            footFields.forEach(
                ({ key }) => {
                    const field =
                        formData[key] || {};

                    payload[key] = {
                        result:
                            field.result || "",
                        score:
                            field.score === ""
                                ? undefined
                                : field.score !==
                                  undefined
                                ? Number(
                                      field.score
                                  )
                                : undefined
                    };
                }
            );

            tacticalFields.forEach(
                ({ key }) => {
                    const field =
                        formData[key] || {};

                    payload[key] = {
                        result:
                            field.result || "",
                        score:
                            field.score === ""
                                ? undefined
                                : field.score !==
                                  undefined
                                ? Number(
                                      field.score
                                  )
                                : undefined
                    };
                }
            );

            recoveryFields.forEach(
                ({ key }) => {
                    const field =
                        formData[key] || {};

                    payload[key] = {
                        result:
                            field.result || "",
                        score:
                            field.score === ""
                                ? undefined
                                : field.score !==
                                  undefined
                                ? Number(
                                      field.score
                                  )
                                : undefined
                    };
                }
            );

            noteFields.forEach(
                ({ key }) => {
                    payload[key] =
                        formData[key]?.result || "";
                }
            );

            await api.post("/assessments", payload);

            setSuccess(
                "Assessment saved successfully."
            );

            setShowForm(false);
            setFormData({});

            await loadAssessments(
                selectedAthlete
            );
        } catch (error) {
            console.error(
                "Failed to save assessment:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to save assessment"
            );
        } finally {
            setSaving(false);
        }
    };

    const selectedAthleteData =
        athletes.find(
            (athlete) =>
                athlete._id === selectedAthlete
        );

    if (user.role === "ATHLETE") {
        return (
            <DashboardLayout>
                <div className="dashboard-header">
                    <div>
                        <span className="dashboard-eyebrow">MY PERFORMANCE</span>
                        <h1>My Assessments</h1>
                        <p>Review your recorded performance assessments.</p>
                    </div>
                    <div className="dashboard-date">ATHLETE</div>
                </div>

                {error && (
                    <div style={{ marginTop: "20px", padding: "14px 18px", borderRadius: "10px" }}>
                        {error}
                    </div>
                )}

                <section className="dashboard-panel" style={{ marginTop: "20px" }}>
                    {loadingAssessments ? (
                        <div className="empty-analytics"><h3>Loading assessments...</h3></div>
                    ) : assessments.length === 0 ? (
                        <div className="empty-analytics">
                            <div className="analytics-icon">◫</div>
                            <h3>No assessments yet</h3>
                            <p>Your coach or administrator has not added any assessments yet.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead><tr>
                                    <th style={{ textAlign: "left", padding: "12px" }}>Date</th>
                                    <th style={{ textAlign: "left", padding: "12px" }}>Lower Body</th>
                                    <th style={{ textAlign: "left", padding: "12px" }}>Core</th>
                                    <th style={{ textAlign: "left", padding: "12px" }}>20m Sprint</th>
                                    <th style={{ textAlign: "left", padding: "12px" }}>Aerobic Capacity</th>
                                </tr></thead>
                                <tbody>
                                    {assessments.map((assessment) => (
                                        <tr key={assessment._id}>
                                            <td style={{ padding: "12px" }}>{assessment.assessmentDate ? new Date(assessment.assessmentDate).toLocaleDateString() : "—"}</td>
                                            <td style={{ padding: "12px" }}>{assessment.lowerBodyStrength?.score ?? "—"}</td>
                                            <td style={{ padding: "12px" }}>{assessment.coreStrength?.score ?? "—"}</td>
                                            <td style={{ padding: "12px" }}>{assessment.sprint20m?.score ?? "—"}</td>
                                            <td style={{ padding: "12px" }}>{assessment.aerobicCapacity?.score ?? "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>

            {/* PAGE HEADER */}

            <div className="dashboard-header">

                <div>

                    <span className="dashboard-eyebrow">
                        PERFORMANCE MANAGEMENT
                    </span>

                    <h1>
                        Assessments
                    </h1>

                    <p>
                        Record and review athlete
                        fitness assessments.
                    </p>

                </div>

                <div className="dashboard-date">
                    {user.role || "COACH"}
                </div>

            </div>


            {/* ATHLETE SELECTION */}

            <section className="dashboard-panel">

                <div className="panel-header">

                    <div>

                        <span className="panel-eyebrow">
                            ATHLETE ASSESSMENT
                        </span>

                        <h2>
                            Select Athlete
                        </h2>

                    </div>

                </div>


                <div
                    style={{
                        maxWidth: "500px",
                        marginTop: "20px"
                    }}
                >

                    <label
                        style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "600"
                        }}
                    >
                        Athlete
                    </label>


                    <select
                        className="ams-athlete-select"
                        value={selectedAthlete}
                        onChange={handleAthleteChange}
                        style={{
                            width: "100%",
                            padding: "12px 14px",
                            borderRadius: "10px",
                            border: "1px solid var(--ams-border)",
                            background: "var(--ams-card)",
                            color: "var(--ams-text)",
                            fontSize: "15px"
                        }}
                    >

                        <option value="">
                            Select an athlete
                        </option>

                        {athletes.map((athlete) => (
                            <option
                                key={athlete._id}
                                value={athlete._id}
                            >
                                {athlete.name}
                                {athlete.position
                                    ? ` — ${athlete.position}`
                                    : ""}
                            </option>
                        ))}

                    </select>


                </div>

            </section>


            {/* ERROR */}

            {error && (
                <div
                    style={{
                        marginTop: "20px",
                        padding: "14px 18px",
                        borderRadius: "10px",
                        border: "1px solid rgba(255, 80, 80, 0.3)",
                        background:
                            "rgba(255, 80, 80, 0.08)"
                    }}
                >
                    {error}
                </div>
            )}


            {/* SUCCESS */}

            {success && (
                <div
                    style={{
                        marginTop: "20px",
                        padding: "14px 18px",
                        borderRadius: "10px",
                        border: "1px solid rgba(85, 199, 217, 0.3)",
                        background:
                            "rgba(85, 199, 217, 0.08)"
                    }}
                >
                    {success}
                </div>
            )}


            {/* SELECTED ATHLETE */}

            {selectedAthlete && (
                <section
                    className="dashboard-panel"
                    style={{
                        marginTop: "20px"
                    }}
                >

                    <div className="panel-header">

                        <div>

                            <span className="panel-eyebrow">
                                SELECTED ATHLETE
                            </span>

                            <h2>
                                {
                                    selectedAthleteData?.name
                                }
                            </h2>

                        </div>

                        <button
                            type="button"
                            onClick={
                                openNewAssessment
                            }
                            className="primary-button"
                        >
                            + Record New Assessment
                        </button>

                    </div>


                    {/* NEW ASSESSMENT FORM */}

                    {showForm && (
                        <form
                            onSubmit={
                                handleSubmit
                            }
                            style={{
                                marginTop: "25px"
                            }}
                        >

                            <div
                                style={{
                                    marginBottom:
                                        "25px"
                                }}
                            >

                                <label
                                    style={{
                                        display:
                                            "block",
                                        marginBottom:
                                            "8px",
                                        fontWeight:
                                            "600"
                                    }}
                                >
                                    Assessment Date
                                </label>

                                <input
                                    type="date"
                                    value={
                                        assessmentDate
                                    }
                                    onChange={(event) =>
                                        setAssessmentDate(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    required
                                />

                            </div>


                            {/* PHYSICAL ASSESSMENT */}

                            <div
                                className="assessment-section"
                            >

                                <div
                                    className="panel-header"
                                >

                                    <div>

                                        <span className="panel-eyebrow">
                                            PHYSICAL
                                            ASSESSMENT
                                        </span>

                                        <h2>
                                            Physical
                                            Performance
                                        </h2>

                                    </div>

                                </div>


                                <div
                                    className="assessment-grid"
                                >

                                    {physicalFields.map(
                                        ({
                                            key,
                                            label
                                        }) => (
                                            <div
                                                key={
                                                    key
                                                }
                                                className="assessment-field"
                                            >

                                                <label>
                                                    {
                                                        label
                                                    }
                                                </label>


                                                <input
                                                    type="text"
                                                    placeholder="Result"
                                                    value={
                                                        formData[
                                                            key
                                                        ]?.result ||
                                                        ""
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handleFormChange(
                                                            key,
                                                            "result",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                />


                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    placeholder="Score (0-100)"
                                                    value={
                                                        formData[
                                                            key
                                                        ]?.score ||
                                                        ""
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handleFormChange(
                                                            key,
                                                            "score",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                />

                                            </div>
                                        )
                                    )}

                                </div>

                            </div>


                            {/* TECHNICAL ASSESSMENT */}

                            <div
                                className="assessment-section"
                                style={{
                                    marginTop: "30px"
                                }}
                            >

                                <div
                                    className="panel-header"
                                >

                                    <div>

                                        <span className="panel-eyebrow">
                                            TECHNICAL
                                            ASSESSMENT
                                        </span>

                                        <h2>
                                            Technical
                                            Performance
                                        </h2>

                                    </div>

                                </div>


                                <div
                                    className="assessment-grid"
                                >

                                    {technicalFields.map(
                                        ({
                                            key,
                                            label
                                        }) => (
                                            <div
                                                key={key}
                                                className="assessment-field"
                                            >

                                                <label>
                                                    {label}
                                                </label>


                                                <input
                                                    type="text"
                                                    placeholder="Result"
                                                    value={
                                                        formData[
                                                            key
                                                        ]?.result ||
                                                        ""
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handleFormChange(
                                                            key,
                                                            "result",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                />


                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    placeholder="Score (0-100)"
                                                    value={
                                                        formData[
                                                            key
                                                        ]?.score ??
                                                        ""
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handleFormChange(
                                                            key,
                                                            "score",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                />

                                            </div>
                                        )
                                    )}

                                </div>

                            </div>


                            {/* FOOT / BALL-SKILL ASSESSMENT */}

                            <div
                                className="assessment-section"
                                style={{
                                    marginTop: "30px"
                                }}
                            >

                                <div
                                    className="panel-header"
                                >

                                    <div>

                                        <span className="panel-eyebrow">
                                            FOOT / BALL-SKILL
                                            ASSESSMENT
                                        </span>

                                        <h2>
                                            Foot & Ball Skills
                                        </h2>

                                    </div>

                                </div>


                                <div
                                    className="assessment-grid"
                                >

                                    {footFields.map(
                                        ({
                                            key,
                                            label
                                        }) => (
                                            <div
                                                key={key}
                                                className="assessment-field"
                                            >

                                                <label>
                                                    {label}
                                                </label>


                                                <input
                                                    type="text"
                                                    placeholder="Result"
                                                    value={
                                                        formData[
                                                            key
                                                        ]?.result ||
                                                        ""
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handleFormChange(
                                                            key,
                                                            "result",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                />


                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    placeholder="Score (0-100)"
                                                    value={
                                                        formData[
                                                            key
                                                        ]?.score ??
                                                        ""
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handleFormChange(
                                                            key,
                                                            "score",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                />

                                            </div>
                                        )
                                    )}

                                </div>

                            </div>


                            {/* TACTICAL / COGNITIVE ASSESSMENT */}

                            <div
                                className="assessment-section"
                                style={{
                                    marginTop: "30px"
                                }}
                            >

                                <div
                                    className="panel-header"
                                >

                                    <div>

                                        <span className="panel-eyebrow">
                                            TACTICAL /
                                            COGNITIVE
                                            ASSESSMENT
                                        </span>

                                        <h2>
                                            Tactical & Cognitive
                                            Performance
                                        </h2>

                                    </div>

                                </div>


                                <div
                                    className="assessment-grid"
                                >

                                    {tacticalFields.map(
                                        ({
                                            key,
                                            label
                                        }) => (
                                            <div
                                                key={key}
                                                className="assessment-field"
                                            >

                                                <label>
                                                    {label}
                                                </label>


                                                <input
                                                    type="text"
                                                    placeholder="Result"
                                                    value={
                                                        formData[
                                                            key
                                                        ]?.result ||
                                                        ""
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handleFormChange(
                                                            key,
                                                            "result",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                />


                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    placeholder="Score (0-100)"
                                                    value={
                                                        formData[
                                                            key
                                                        ]?.score ??
                                                        ""
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handleFormChange(
                                                            key,
                                                            "score",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                />

                                            </div>
                                        )
                                    )}

                                </div>

                            </div>


                            {/* PERFORMANCE / RECOVERY METRICS */}

                            <div
                                className="assessment-section"
                                style={{
                                    marginTop: "30px"
                                }}
                            >

                                <div
                                    className="panel-header"
                                >

                                    <div>

                                        <span className="panel-eyebrow">
                                            PERFORMANCE /
                                            RECOVERY
                                            METRICS
                                        </span>

                                        <h2>
                                            Performance & Recovery
                                        </h2>

                                    </div>

                                </div>


                                <div
                                    className="assessment-grid"
                                >

                                    {recoveryFields.map(
                                        ({
                                            key,
                                            label
                                        }) => (
                                            <div
                                                key={key}
                                                className="assessment-field"
                                            >

                                                <label>
                                                    {label}
                                                </label>


                                                <input
                                                    type="text"
                                                    placeholder="Result"
                                                    value={
                                                        formData[
                                                            key
                                                        ]?.result ||
                                                        ""
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handleFormChange(
                                                            key,
                                                            "result",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                />


                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    placeholder="Score (0-100)"
                                                    value={
                                                        formData[
                                                            key
                                                        ]?.score ??
                                                        ""
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handleFormChange(
                                                            key,
                                                            "score",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                />

                                            </div>
                                        )
                                    )}

                                </div>

                            </div>


                            {/* ASSESSMENT NOTES */}

                            <div
                                className="assessment-section"
                                style={{
                                    marginTop: "30px"
                                }}
                            >

                                <div
                                    className="panel-header"
                                >

                                    <div>

                                        <span className="panel-eyebrow">
                                            ASSESSMENT NOTES
                                        </span>

                                        <h2>
                                            Notes & Observations
                                        </h2>

                                    </div>

                                </div>


                                <div
                                    style={{
                                        display: "grid",
                                        gap: "18px"
                                    }}
                                >

                                    {noteFields.map(
                                        ({
                                            key,
                                            label,
                                            placeholder
                                        }) => (
                                            <div
                                                key={key}
                                                className="assessment-field"
                                            >

                                                <label>
                                                    {label}
                                                </label>

                                                <textarea
                                                    rows="4"
                                                    placeholder={
                                                        placeholder
                                                    }
                                                    value={
                                                        formData[
                                                            key
                                                        ]?.result ||
                                                        ""
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handleFormChange(
                                                            key,
                                                            "result",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    style={{
                                                        width: "100%",
                                                        resize: "vertical",
                                                        padding: "12px 14px",
                                                        borderRadius: "10px",
                                                        border: "1px solid var(--ams-border)",
                                                        background: "var(--ams-card)",
                                                        color: "var(--ams-text)",
                                                        fontFamily: "inherit",
                                                        fontSize: "14px",
                                                        lineHeight: "1.5",
                                                        boxSizing: "border-box"
                                                    }}
                                                />

                                            </div>
                                        )
                                    )}

                                </div>

                            </div>


                            {/* FORM ACTIONS */}

                            <div
                                style={{
                                    display:
                                        "flex",
                                    gap: "12px",
                                    marginTop:
                                        "25px"
                                }}
                            >

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Save Assessment"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowForm(
                                            false
                                        )
                                    }
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>
                    )}


                    {/* ASSESSMENT HISTORY */}

                    {!showForm && (
                        <>

                            <div
                                style={{
                                    marginTop:
                                        "25px"
                                }}
                            >

                                {loadingAssessments ? (
                                    <div className="empty-analytics">

                                        <h3>
                                            Loading
                                            assessments...
                                        </h3>

                                    </div>
                                ) : assessments.length ===
                                  0 ? (
                                    <div className="empty-analytics">

                                        <div className="analytics-icon">
                                            ◫
                                        </div>

                                        <h3>
                                            No assessments
                                            yet
                                        </h3>

                                        <p>
                                            No assessment
                                            records have
                                            been created
                                            for this
                                            athlete.
                                        </p>

                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            overflowX:
                                                "auto"
                                        }}
                                    >

                                        <table
                                            style={{
                                                width:
                                                    "100%",
                                                borderCollapse:
                                                    "collapse"
                                            }}
                                        >

                                            <thead>

                                                <tr>

                                                    <th
                                                        style={{
                                                            textAlign:
                                                                "left",
                                                            padding:
                                                                "12px"
                                                        }}
                                                    >
                                                        Date
                                                    </th>

                                                    <th
                                                        style={{
                                                            textAlign:
                                                                "left",
                                                            padding:
                                                                "12px"
                                                        }}
                                                    >
                                                        Lower
                                                        Body
                                                        Strength
                                                    </th>

                                                    <th
                                                        style={{
                                                            textAlign:
                                                                "left",
                                                            padding:
                                                                "12px"
                                                        }}
                                                    >
                                                        Core
                                                        Strength
                                                    </th>

                                                    <th
                                                        style={{
                                                            textAlign:
                                                                "left",
                                                            padding:
                                                                "12px"
                                                        }}
                                                    >
                                                        20m
                                                        Sprint
                                                    </th>

                                                    <th
                                                        style={{
                                                            textAlign:
                                                                "left",
                                                            padding:
                                                                "12px"
                                                        }}
                                                    >
                                                        Aerobic
                                                        Capacity
                                                    </th>

                                                </tr>

                                            </thead>


                                            <tbody>

                                                {assessments.map(
                                                    (
                                                        assessment
                                                    ) => (
                                                        <tr
                                                            key={
                                                                assessment._id
                                                            }
                                                        >

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "12px"
                                                                }}
                                                            >
                                                                {assessment.assessmentDate
                                                                    ? new Date(
                                                                          assessment.assessmentDate
                                                                      ).toLocaleDateString()
                                                                    : "—"}
                                                            </td>

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "12px"
                                                                }}
                                                            >
                                                                {assessment
                                                                    .lowerBodyStrength
                                                                    ?.score ??
                                                                    "—"}
                                                            </td>

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "12px"
                                                                }}
                                                            >
                                                                {assessment
                                                                    .coreStrength
                                                                    ?.score ??
                                                                    "—"}
                                                            </td>

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "12px"
                                                                }}
                                                            >
                                                                {assessment
                                                                    .sprint20m
                                                                    ?.score ??
                                                                    "—"}
                                                            </td>

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "12px"
                                                                }}
                                                            >
                                                                {assessment
                                                                    .aerobicCapacity
                                                                    ?.score ??
                                                                    "—"}
                                                            </td>

                                                        </tr>
                                                    )
                                                )}

                                            </tbody>

                                        </table>

                                    </div>
                                )}

                            </div>

                        </>
                    )}

                </section>
            )}

        </DashboardLayout>
    );
}

export default Assessments;