import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import api from "../services/api";

function DataVerification() {
    const navigate = useNavigate();

    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadPendingAssessments = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/assessments/pending");

            setAssessments(
                response.data?.data ||
                response.data?.assessments ||
                []
            );

        } catch (err) {
            console.error(
                "Failed to load pending assessments:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load pending assessments"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPendingAssessments();
    }, []);

    const updateVerificationStatus = async (
        assessmentId,
        status
    ) => {
        try {
            setActionLoading(true);
            setMessage("");
            setError("");

            await api.put(
                `/assessments/${assessmentId}/verification`,
                {
                    verificationStatus: status
                }
            );

            setMessage(
                `Assessment ${status
                    .replace("_", " ")
                    .toLowerCase()} successfully.`
            );

            await loadPendingAssessments();

        } catch (err) {
            console.error(
                "Verification update error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to update verification status"
            );
        } finally {
            setActionLoading(false);
        }
    };

    const getAthleteName = (assessment) => {
        if (
            assessment.athleteId &&
            typeof assessment.athleteId === "object"
        ) {
            return (
                assessment.athleteId.name ||
                assessment.athleteId.fullName ||
                "Unknown Athlete"
            );
        }

        return "Athlete";
    };

    const getScore = (field) => {
        if (
            field &&
            typeof field === "object" &&
            field.score !== undefined
        ) {
            return field.score;
        }

        return "-";
    };

    return (
        <DashboardLayout>

            <div className="dashboard-header">

                <div>

                    <span className="dashboard-eyebrow">
                        ADMINISTRATION
                    </span>

                    <h1>
                        Data Verification
                    </h1>

                    <p>
                        Review and verify athlete
                        assessment data before it is
                        treated as trusted performance
                        information.
                    </p>

                </div>

                <button
                    className="dashboard-back-button"
                    onClick={() =>
                        navigate("/dashboard")
                    }
                >
                    ← Back to Dashboard
                </button>

            </div>


            {message && (
                <div className="dashboard-success">
                    {message}
                </div>
            )}


            {error && (
                <div className="dashboard-error">
                    {error}
                </div>
            )}


            <section className="dashboard-panel">

                <div className="panel-header">

                    <div>

                        <span className="panel-eyebrow">
                            VERIFICATION QUEUE
                        </span>

                        <h2>
                            Pending Assessments
                        </h2>

                    </div>

                    <span className="panel-badge">
                        {assessments.length} PENDING
                    </span>

                </div>


                {loading ? (

                    <div className="empty-analytics">

                        <div className="analytics-icon">
                            ◫
                        </div>

                        <h3>
                            Loading assessments...
                        </h3>

                        <p>
                            Checking for assessment
                            records awaiting verification.
                        </p>

                    </div>

                ) : assessments.length === 0 ? (

                    <div className="empty-analytics">

                        <div className="analytics-icon">
                            ✓
                        </div>

                        <h3>
                            No pending assessments
                        </h3>

                        <p>
                            All currently submitted
                            assessments have been reviewed.
                        </p>

                    </div>

                ) : (

                    <div className="verification-list">

                        {assessments.map(
                            (assessment) => (

                                <div
                                    key={
                                        assessment._id
                                    }
                                    className="verification-card"
                                >

                                    <div className="verification-card-header">

                                        <div>

                                            <span className="verification-label">
                                                ATHLETE
                                            </span>

                                            <h3>
                                                {
                                                    getAthleteName(
                                                        assessment
                                                    )
                                                }
                                            </h3>

                                        </div>

                                        <span className="verification-status pending">
                                            PENDING
                                        </span>

                                    </div>


                                    <div className="verification-meta">

                                        <div>
                                            <span>
                                                Assessment Date
                                            </span>

                                            <strong>
                                                {assessment.assessmentDate
                                                    ? new Date(
                                                        assessment.assessmentDate
                                                    ).toLocaleDateString(
                                                        "en-IN"
                                                    )
                                                    : "-"
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Recorded By
                                            </span>

                                            <strong>
                                                {assessment.recordedBy?.name ||
                                                    assessment.recordedBy ||
                                                    "Coach / Admin"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Status
                                            </span>

                                            <strong>
                                                {assessment.verificationStatus ||
                                                    "PENDING"}
                                            </strong>
                                        </div>

                                    </div>


                                    <div className="verification-scores">

                                        <div>
                                            <span>
                                                Lower Body
                                            </span>

                                            <strong>
                                                {getScore(
                                                    assessment.lowerBodyStrength
                                                )}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Sprint 20m
                                            </span>

                                            <strong>
                                                {getScore(
                                                    assessment.sprint20m
                                                )}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Agility
                                            </span>

                                            <strong>
                                                {getScore(
                                                    assessment.agility505
                                                )}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Passing
                                            </span>

                                            <strong>
                                                {getScore(
                                                    assessment.shortPassing
                                                )}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Shooting
                                            </span>

                                            <strong>
                                                {getScore(
                                                    assessment.shootingAccuracy
                                                )}
                                            </strong>
                                        </div>

                                    </div>


                                    <div className="verification-notes">

                                        <div>

                                            <span>
                                                Coach Notes
                                            </span>

                                            <p>
                                                {assessment.coachNotes ||
                                                    "No coach notes provided."}
                                            </p>

                                        </div>

                                        <div>

                                            <span>
                                                Injury Notes
                                            </span>

                                            <p>
                                                {assessment.injuryNotes ||
                                                    "No injury notes provided."}
                                            </p>

                                        </div>

                                    </div>


                                    <div className="verification-actions">

                                        <button
                                            className="verification-button verify"
                                            disabled={
                                                actionLoading
                                            }
                                            onClick={() =>
                                                updateVerificationStatus(
                                                    assessment._id,
                                                    "VERIFIED"
                                                )
                                            }
                                        >
                                            ✓ Verify
                                        </button>


                                        <button
                                            className="verification-button review"
                                            disabled={
                                                actionLoading
                                            }
                                            onClick={() =>
                                                updateVerificationStatus(
                                                    assessment._id,
                                                    "NEEDS_REVIEW"
                                                )
                                            }
                                        >
                                            ⚠ Needs Review
                                        </button>


                                        <button
                                            className="verification-button reject"
                                            disabled={
                                                actionLoading
                                            }
                                            onClick={() =>
                                                updateVerificationStatus(
                                                    assessment._id,
                                                    "REJECTED"
                                                )
                                            }
                                        >
                                            ✕ Reject
                                        </button>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </section>

        </DashboardLayout>
    );
}

export default DataVerification;