
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";
import api from "../services/api";

import "../styles/athletes.css";

const initialFormData = {
    externalId: "",
    name: "",
    age: "",
    position: "",
    club: "",
    assessmentDate: "",
    bestPosition: "",
    secondaryPositions: ""
};

function Athletes() {
    const navigate = useNavigate();

    // Get the logged-in user's role
    const user = JSON.parse(
        localStorage.getItem("ams_user") || "{}"
    );

    const userRole = String(user.role || "").toUpperCase();

    const canManageAthletes =
        userRole === "ADMIN" || userRole === "COACH";

    const [athletes, setAthletes] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showAddForm, setShowAddForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState(
        initialFormData
    );

    const loadAthletes = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/athletes");

            setAthletes(response.data.data || []);
        } catch (error) {
            console.error(
                "Athletes loading error:",
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

    useEffect(() => {
        loadAthletes();
    }, []);

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };

    const openAddForm = () => {
        setFormData({
            ...initialFormData,
            assessmentDate: new Date()
                .toISOString()
                .split("T")[0]
        });

        setError("");
        setSuccess("");
        setShowAddForm(true);
    };

    const closeAddForm = () => {
        if (saving) {
            return;
        }

        setShowAddForm(false);
        setFormData(initialFormData);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.name.trim()) {
            setError("Athlete name is required.");
            return;
        }

        if (
            formData.age !== "" &&
            (
                Number(formData.age) < 0 ||
                Number(formData.age) > 100
            )
        ) {
            setError(
                "Please enter a valid age between 0 and 100."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {
                name: formData.name.trim(),
                externalId:
                    formData.externalId.trim() || undefined,
                age:
                    formData.age === ""
                        ? undefined
                        : Number(formData.age),
                position:
                    formData.position.trim() || undefined,
                club:
                    formData.club.trim() || undefined,
                assessmentDate:
                    formData.assessmentDate || undefined,
                bestPosition:
                    formData.bestPosition.trim() || undefined,
                secondaryPositions:
                    formData.secondaryPositions
                        .split(",")
                        .map((position) => position.trim())
                        .filter(Boolean)
            };

            const response = await api.post(
                "/athletes",
                payload
            );

            setSuccess(
                response.data.message ||
                "Athlete created successfully."
            );

            setShowAddForm(false);
            setFormData(initialFormData);

            await loadAthletes();
        } catch (error) {
            console.error(
                "Create athlete error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to create athlete."
            );
        } finally {
            setSaving(false);
        }
    };

    const filteredAthletes = athletes.filter((athlete) => {
        const searchText = search.toLowerCase();

        return (
            athlete.name
                ?.toLowerCase()
                .includes(searchText) ||
            athlete.position
                ?.toLowerCase()
                .includes(searchText) ||
            athlete.club
                ?.toLowerCase()
                .includes(searchText) ||
            athlete.externalId
                ?.toLowerCase()
                .includes(searchText)
        );
    });

    return (
        <DashboardLayout>
            <div className="athletes-header">
                <div>
                    <span className="dashboard-eyebrow">
                        ATHLETE MANAGEMENT
                    </span>

                    <h1>Athletes</h1>

                    <p>
                        Manage athlete profiles and
                        performance records.
                    </p>
                </div>

                {canManageAthletes && (
                    <button
                        type="button"
                        className="primary-action"
                        onClick={openAddForm}
                    >
                        <span>＋</span>
                        Add Athlete
                    </button>
                )}
            </div>

            <div className="athletes-toolbar">
                <div className="athlete-search">
                    <span>⌕</span>

                    <input
                        type="text"
                        placeholder="Search by name, position, club or ID..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />
                </div>

                <div className="athlete-count">
                    {filteredAthletes.length} athletes
                </div>
            </div>

            {error && !showAddForm && (
                <div className="athletes-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="athletes-success">
                    {success}
                </div>
            )}

            <div className="athletes-table-container">
                {loading ? (
                    <div className="athletes-loading">
                        Loading athletes...
                    </div>
                ) : filteredAthletes.length === 0 ? (
                    <div className="athletes-loading">
                        No athletes found.
                    </div>
                ) : (
                    <table className="athletes-table">
                        <thead>
                            <tr>
                                <th>Athlete</th>
                                <th>Position</th>
                                <th>Club</th>
                                <th>Age</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredAthletes.map(
                                (athlete) => (
                                    <tr
                                        key={athlete._id}
                                        onClick={() =>
                                            navigate(
                                                `/athletes/${athlete._id}`
                                            )
                                        }
                                    >
                                        <td>
                                            <div className="athlete-name-cell">
                                                <div className="athlete-avatar">
                                                    {athlete.name
                                                        ?.charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div>
                                                    <strong>
                                                        {athlete.name}
                                                    </strong>

                                                    <span>
                                                        {athlete.externalId ||
                                                            "No external ID"}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <span className="position-badge">
                                                {athlete.position ||
                                                    "—"}
                                            </span>
                                        </td>

                                        <td>
                                            {athlete.club || "—"}
                                        </td>

                                        <td>
                                            {athlete.age ?? "—"}
                                        </td>

                                        <td>
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
                                        </td>

                                        <td>
                                            <span className="view-athlete">
                                                View →
                                            </span>
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ADD ATHLETE MODAL */}

            {showAddForm && (
                <div
                    className="athlete-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeAddForm();
                        }
                    }}
                >
                    <div
                        className="athlete-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="add-athlete-title"
                    >
                        <div className="athlete-modal-header">
                            <div>
                                <span className="dashboard-eyebrow">
                                    ATHLETE REGISTRATION
                                </span>

                                <h2 id="add-athlete-title">
                                    Add New Athlete
                                </h2>

                                <p>
                                    Create a new athlete
                                    profile in AMS.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="athlete-modal-close"
                                onClick={closeAddForm}
                                disabled={saving}
                                aria-label="Close form"
                            >
                                ×
                            </button>
                        </div>

                        {error && (
                            <div className="athlete-form-error">
                                {error}
                            </div>
                        )}

                        <form
                            className="athlete-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="athlete-form-grid">
                                <div className="athlete-form-field">
                                    <label htmlFor="externalId">
                                        External ID
                                    </label>

                                    <input
                                        id="externalId"
                                        name="externalId"
                                        type="text"
                                        placeholder="e.g. ATH-006"
                                        value={
                                            formData.externalId
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                    />
                                </div>

                                <div className="athlete-form-field">
                                    <label htmlFor="name">
                                        Full Name *
                                    </label>

                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Enter full name"
                                        value={formData.name}
                                        onChange={
                                            handleFormChange
                                        }
                                        required
                                    />
                                </div>

                                <div className="athlete-form-field">
                                    <label htmlFor="age">
                                        Age
                                    </label>

                                    <input
                                        id="age"
                                        name="age"
                                        type="number"
                                        min="0"
                                        max="100"
                                        placeholder="e.g. 22"
                                        value={formData.age}
                                        onChange={
                                            handleFormChange
                                        }
                                    />
                                </div>

                                <div className="athlete-form-field">
                                    <label htmlFor="position">
                                        Current Position
                                    </label>

                                    <select
                                        id="position"
                                        name="position"
                                        value={
                                            formData.position
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                    >
                                        <option value="">
                                            Select position
                                        </option>

                                        <option value="GK">
                                            Goalkeeper (GK)
                                        </option>

                                        <option value="CB">
                                            Centre Back (CB)
                                        </option>

                                        <option value="LB">
                                            Left Back (LB)
                                        </option>

                                        <option value="RB">
                                            Right Back (RB)
                                        </option>

                                        <option value="CM">
                                            Central Midfielder (CM)
                                        </option>

                                        <option value="AM">
                                            Attacking Midfielder (AM)
                                        </option>

                                        <option value="LW">
                                            Left Winger (LW)
                                        </option>

                                        <option value="RW">
                                            Right Winger (RW)
                                        </option>

                                        <option value="ST">
                                            Striker (ST)
                                        </option>
                                    </select>
                                </div>

                                <div className="athlete-form-field">
                                    <label htmlFor="club">
                                        Club
                                    </label>

                                    <input
                                        id="club"
                                        name="club"
                                        type="text"
                                        placeholder="Enter club name"
                                        value={formData.club}
                                        onChange={
                                            handleFormChange
                                        }
                                    />
                                </div>

                                <div className="athlete-form-field">
                                    <label htmlFor="assessmentDate">
                                        Assessment Date
                                    </label>

                                    <input
                                        id="assessmentDate"
                                        name="assessmentDate"
                                        type="date"
                                        value={
                                            formData.assessmentDate
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                    />
                                </div>

                                <div className="athlete-form-field">
                                    <label htmlFor="bestPosition">
                                        Best Position
                                    </label>

                                    <select
                                        id="bestPosition"
                                        name="bestPosition"
                                        value={
                                            formData.bestPosition
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                    >
                                        <option value="">
                                            Select best position
                                        </option>

                                        <option value="GK">
                                            GK
                                        </option>

                                        <option value="CB">
                                            CB
                                        </option>

                                        <option value="LB">
                                            LB
                                        </option>

                                        <option value="RB">
                                            RB
                                        </option>

                                        <option value="CM">
                                            CM
                                        </option>

                                        <option value="AM">
                                            AM
                                        </option>

                                        <option value="LW">
                                            LW
                                        </option>

                                        <option value="RW">
                                            RW
                                        </option>

                                        <option value="ST">
                                            ST
                                        </option>
                                    </select>
                                </div>

                                <div className="athlete-form-field">
                                    <label htmlFor="secondaryPositions">
                                        Secondary Positions
                                    </label>

                                    <input
                                        id="secondaryPositions"
                                        name="secondaryPositions"
                                        type="text"
                                        placeholder="e.g. CM, AM"
                                        value={
                                            formData.secondaryPositions
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                    />

                                    <small>
                                        Separate multiple positions
                                        using commas.
                                    </small>
                                </div>
                            </div>

                            <div className="athlete-form-actions">
                                <button
                                    type="button"
                                    className="athlete-cancel-button"
                                    onClick={closeAddForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-action"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Create Athlete"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default Athletes;