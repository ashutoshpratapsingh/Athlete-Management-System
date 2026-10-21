
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";
import api from "../services/api";

import "../styles/userManagement.css";

const initialFormData = {
    name: "",
    email: "",
    password: "",
    role: "COACH",
    athleteId: ""
};

function UserManagement() {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [athletes, setAthletes] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const [formData, setFormData] = useState(initialFormData);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/users");

            setUsers(response.data.data || []);
        } catch (requestError) {
            console.error("Load users error:", requestError);

            setError(
                requestError.response?.data?.message ||
                "Failed to load users"
            );
        } finally {
            setLoading(false);
        }
    };

    const loadAthletes = async () => {
        try {
            const response = await api.get("/athletes");

            setAthletes(response.data.data || []);
        } catch (requestError) {
            console.error("Load athletes error:", requestError);
        }
    };

    useEffect(() => {
        loadUsers();
        loadAthletes();
    }, []);

    const filteredUsers = useMemo(() => {
        const normalizedSearch = search.toLowerCase().trim();

        return users.filter((user) => {
            const matchesSearch =
                !normalizedSearch ||
                user.name?.toLowerCase().includes(normalizedSearch) ||
                user.email?.toLowerCase().includes(normalizedSearch);

            const matchesRole =
                roleFilter === "ALL" ||
                user.role === roleFilter;

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" && user.isActive) ||
                (statusFilter === "INACTIVE" && !user.isActive);

            return (
                matchesSearch &&
                matchesRole &&
                matchesStatus
            );
        });
    }, [users, search, roleFilter, statusFilter]);

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const openCreateForm = () => {
        setEditingUser(null);
        setFormData(initialFormData);
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const openEditForm = (user) => {
        setEditingUser(user);

        setFormData({
            name: user.name || "",
            email: user.email || "",
            password: "",
            role: user.role || "COACH",
            athleteId:
                typeof user.athleteId === "object"
                    ? user.athleteId?._id || ""
                    : user.athleteId || ""
        });

        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const closeForm = () => {
        if (saving) return;

        setShowForm(false);
        setEditingUser(null);
        setFormData(initialFormData);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.name.trim()) {
            setError("Name is required");
            return;
        }

        if (!formData.email.trim()) {
            setError("Email is required");
            return;
        }

        if (!editingUser && !formData.password) {
            setError("Password is required");
            return;
        }

        if (
            !editingUser &&
            formData.password.length < 6
        ) {
            setError("Password must contain at least 6 characters");
            return;
        }

        try {
            setSaving(true);

            if (editingUser) {
                await api.put(`/users/${editingUser._id}`, {
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    role: formData.role,
                    athleteId: formData.athleteId || null
                });

                setSuccess("User updated successfully");
            } else {
                await api.post("/users", {
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                    role: formData.role,
                    athleteId: formData.athleteId || undefined
                });

                setSuccess("User created successfully");
            }

            closeForm();
            await loadUsers();
        } catch (requestError) {
            console.error("Save user error:", requestError);

            setError(
                requestError.response?.data?.message ||
                "Failed to save user"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (user) => {
        const nextStatus = !user.isActive;

        const action = nextStatus
            ? "activate"
            : "deactivate";

        const confirmed = window.confirm(
            `Are you sure you want to ${action} ${user.name}?`
        );

        if (!confirmed) return;

        try {
            setError("");
            setSuccess("");

            await api.patch(`/users/${user._id}/status`, {
                isActive: nextStatus
            });

            setSuccess(
                nextStatus
                    ? "User activated successfully"
                    : "User deactivated successfully"
            );

            await loadUsers();
        } catch (requestError) {
            console.error("Update user status error:", requestError);

            setError(
                requestError.response?.data?.message ||
                "Failed to update user status"
            );
        }
    };

    const getRoleLabel = (role) => {
        if (role === "ADMIN") return "Admin";
        if (role === "COACH") return "Coach";
        if (role === "ATHLETE") return "Athlete";

        return role || "Unknown";
    };

    return (
        <DashboardLayout>
            <div className="user-management-page">

                <div className="dashboard-header">
                    <div>
                        <span className="dashboard-eyebrow">
                            ADMINISTRATION
                        </span>

                        <h1>User Management</h1>

                        <p>
                            Manage platform accounts, roles and
                            account access.
                        </p>
                    </div>

                    <div className="dashboard-header-actions">
                        <button
                            className="user-back-button"
                            onClick={() => navigate("/dashboard")}
                        >
                            ← Dashboard
                        </button>

                        <button
                            className="user-primary-button"
                            onClick={openCreateForm}
                        >
                            + Add User
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="user-message user-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="user-message user-success">
                        {success}
                    </div>
                )}

                <div className="user-management-stats">
                    <div className="user-stat-card">
                        <span>Total Users</span>
                        <strong>{users.length}</strong>
                    </div>

                    <div className="user-stat-card">
                        <span>Active Users</span>
                        <strong>
                            {
                                users.filter(
                                    (user) => user.isActive
                                ).length
                            }
                        </strong>
                    </div>

                    <div className="user-stat-card">
                        <span>Coaches</span>
                        <strong>
                            {
                                users.filter(
                                    (user) => user.role === "COACH"
                                ).length
                            }
                        </strong>
                    </div>

                    <div className="user-stat-card">
                        <span>Athletes</span>
                        <strong>
                            {
                                users.filter(
                                    (user) => user.role === "ATHLETE"
                                ).length
                            }
                        </strong>
                    </div>
                </div>

                <section className="user-management-panel">

                    <div className="user-panel-header">
                        <div>
                            <span className="panel-eyebrow">
                                PLATFORM ACCOUNTS
                            </span>

                            <h2>Registered Users</h2>
                        </div>

                        <span className="user-count-badge">
                            {filteredUsers.length} users
                        </span>
                    </div>

                    <div className="user-filters">

                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />

                        <select
                            value={roleFilter}
                            onChange={(event) =>
                                setRoleFilter(event.target.value)
                            }
                        >
                            <option value="ALL">
                                All Roles
                            </option>

                            <option value="ADMIN">
                                Admin
                            </option>

                            <option value="COACH">
                                Coach
                            </option>

                            <option value="ATHLETE">
                                Athlete
                            </option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(event.target.value)
                            }
                        >
                            <option value="ALL">
                                All Status
                            </option>

                            <option value="ACTIVE">
                                Active
                            </option>

                            <option value="INACTIVE">
                                Inactive
                            </option>
                        </select>

                    </div>

                    <div className="user-table-wrapper">

                        {loading ? (
                            <div className="user-empty-state">
                                Loading users...
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="user-empty-state">
                                No users found.
                            </div>
                        ) : (
                            <table className="user-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Role</th>
                                        <th>Athlete</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user._id}>
                                            <td>
                                                <div className="user-identity">
                                                    <div className="user-avatar">
                                                        {user.name
                                                            ?.charAt(0)
                                                            .toUpperCase()}
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {user.name}
                                                        </strong>

                                                        <span>
                                                            {user.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <span
                                                    className={`user-role user-role-${user.role?.toLowerCase()}`}
                                                >
                                                    {getRoleLabel(user.role)}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="user-athlete-name">
                                                    {
                                                        typeof user.athleteId ===
                                                        "object"
                                                            ? user.athleteId?.name ||
                                                              "Not linked"
                                                            : "Not linked"
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        user.isActive
                                                            ? "user-status active"
                                                            : "user-status inactive"
                                                    }
                                                >
                                                    {user.isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="user-actions">
                                                    <button
                                                        className="user-edit-button"
                                                        onClick={() =>
                                                            openEditForm(user)
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className={
                                                            user.isActive
                                                                ? "user-deactivate-button"
                                                                : "user-activate-button"
                                                        }
                                                        onClick={() =>
                                                            handleStatusChange(
                                                                user
                                                            )
                                                        }
                                                    >
                                                        {user.isActive
                                                            ? "Disable"
                                                            : "Enable"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                    </div>

                </section>

                {showForm && (
                    <div className="user-modal-overlay">
                        <div className="user-modal">

                            <div className="user-modal-header">
                                <div>
                                    <span className="panel-eyebrow">
                                        USER MANAGEMENT
                                    </span>

                                    <h2>
                                        {editingUser
                                            ? "Edit User"
                                            : "Create User"}
                                    </h2>
                                </div>

                                <button
                                    className="user-modal-close"
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    ×
                                </button>
                            </div>

                            <form
                                className="user-form"
                                onSubmit={handleSubmit}
                            >

                                <div className="user-form-grid">

                                    <label>
                                        Full Name
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleFormChange}
                                            placeholder="Enter full name"
                                            required
                                        />
                                    </label>

                                    <label>
                                        Email Address
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleFormChange}
                                            placeholder="Enter email"
                                            required
                                        />
                                    </label>

                                    {!editingUser && (
                                        <label>
                                            Password
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleFormChange}
                                                placeholder="Minimum 6 characters"
                                                minLength={6}
                                                required
                                            />
                                        </label>
                                    )}

                                    <label>
                                        Role
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleFormChange}
                                        >
                                            <option value="ADMIN">
                                                Admin
                                            </option>

                                            <option value="COACH">
                                                Coach
                                            </option>

                                            <option value="ATHLETE">
                                                Athlete
                                            </option>
                                        </select>
                                    </label>

                                    <label className="user-form-full">
                                        Linked Athlete
                                        <select
                                            name="athleteId"
                                            value={formData.athleteId}
                                            onChange={handleFormChange}
                                        >
                                            <option value="">
                                                No athlete linked
                                            </option>

                                            {athletes.map((athlete) => (
                                                <option
                                                    key={athlete._id}
                                                    value={athlete._id}
                                                >
                                                    {athlete.name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                </div>

                                <div className="user-form-actions">

                                    <button
                                        type="button"
                                        className="user-cancel-button"
                                        onClick={closeForm}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="user-primary-button"
                                        disabled={saving}
                                    >
                                        {saving
                                            ? "Saving..."
                                            : editingUser
                                                ? "Update User"
                                                : "Create User"}
                                    </button>

                                </div>

                            </form>

                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
}

export default UserManagement;