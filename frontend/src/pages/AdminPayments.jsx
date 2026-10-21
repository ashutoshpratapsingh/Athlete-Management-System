import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import api from "../services/api";

function AdminPayments() {
    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("ams_user") || "{}"
    );

    const userRole = String(user.role || "").toUpperCase();

    const [payments, setPayments] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadPayments = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/payments/admin/all"
            );

            const data = response.data?.data || [];

            setPayments(data);

            setTotalRevenue(
                Number(response.data?.totalRevenue || 0)
            );

        } catch (error) {
            console.error(
                "Admin payments error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load payment records."
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userRole !== "ADMIN") {
            navigate("/dashboard", { replace: true });
            return;
        }

        loadPayments();
    }, [userRole, navigate]);

    const successfulPayments = payments.filter(
        (payment) =>
            String(payment.paymentStatus).toUpperCase() ===
            "SUCCESS"
    );

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "—";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const getAthleteName = (payment) => {
        if (
            payment.athleteId &&
            typeof payment.athleteId === "object"
        ) {
            return (
                payment.athleteId.name ||
                "Unknown Athlete"
            );
        }

        return "Unknown Athlete";
    };

    const getAthleteEmail = (payment) => {
        if (
            payment.athleteId &&
            typeof payment.athleteId === "object"
        ) {
            return payment.athleteId.email || "—";
        }

        return "—";
    };

    const getStatusClass = (status) => {
        const normalizedStatus = String(
            status || ""
        ).toLowerCase();

        if (normalizedStatus === "success") {
            return "payment-status success";
        }

        if (normalizedStatus === "failed") {
            return "payment-status failed";
        }

        return "payment-status pending";
    };

    return (
        <DashboardLayout>
            <div className="dashboard-header">
                <div>
                    <span className="dashboard-eyebrow">
                        ADMINISTRATION
                    </span>

                    <h1>Payment Management</h1>

                    <p>
                        Monitor premium report payments
                        made by athletes.
                    </p>
                </div>

                <button
                    type="button"
                    className="dashboard-secondary-button"
                    onClick={loadPayments}
                    disabled={loading}
                >
                    {loading ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            {error && (
                <div className="dashboard-error">
                    {error}
                </div>
            )}

            {/* Payment Summary Cards */}
            <div className="dashboard-grid">
                <div className="stat-card admin-stat-card">
                    <div className="admin-stat-top">
                        <span>Successful Payments</span>

                        <div className="admin-stat-icon">
                            ✓
                        </div>
                    </div>

                    <strong>
                        {loading
                            ? "—"
                            : successfulPayments.length}
                    </strong>

                    <small>
                        Completed premium report payments
                    </small>
                </div>

                <div className="stat-card admin-stat-card">
                    <div className="admin-stat-top">
                        <span>Total Revenue</span>

                        <div className="admin-stat-icon">
                            ₹
                        </div>
                    </div>

                    <strong>
                        {loading
                            ? "—"
                            : `₹${totalRevenue}`}
                    </strong>

                    <small>
                        Revenue from successful payments
                    </small>
                </div>

                <div className="stat-card admin-stat-card">
                    <div className="admin-stat-top">
                        <span>Paid Athletes</span>

                        <div className="admin-stat-icon">
                            ♙
                        </div>
                    </div>

                    <strong>
                        {loading
                            ? "—"
                            : new Set(
                                successfulPayments.map(
                                    (payment) =>
                                        typeof payment.athleteId ===
                                        "object"
                                            ? payment.athleteId._id
                                            : payment.athleteId
                                )
                            ).size}
                    </strong>

                    <small>
                        Athletes with successful payments
                    </small>
                </div>
            </div>

            {/* Payment Table */}
            <section className="dashboard-panel">
                <div className="panel-header">
                    <div>
                        <span className="panel-eyebrow">
                            PAYMENT RECORDS
                        </span>

                        <h2>Successful Athlete Payments</h2>
                    </div>

                    <span className="panel-badge">
                        ADMIN ONLY
                    </span>
                </div>

                {loading ? (
                    <div className="dashboard-empty">
                        Loading payment records...
                    </div>
                ) : payments.length === 0 ? (
                    <div className="dashboard-empty">
                        No payment records found.
                    </div>
                ) : (
                    <div className="payment-table-wrapper">
                        <table className="payment-table">
                            <thead>
                                <tr>
                                    <th>Athlete</th>
                                    <th>Email</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Status</th>
                                    <th>Payment Date</th>
                                </tr>
                            </thead>

                            <tbody>
                                {payments.map((payment) => (
                                    <tr
                                        key={
                                            payment._id ||
                                            payment.id
                                        }
                                    >
                                        <td>
                                            <strong>
                                                {getAthleteName(
                                                    payment
                                                )}
                                            </strong>
                                        </td>

                                        <td>
                                            {getAthleteEmail(
                                                payment
                                            )}
                                        </td>

                                        <td>
                                            ₹
                                            {Number(
                                                payment.amount || 0
                                            )}
                                        </td>

                                        <td>
                                            {payment.paymentMethod ||
                                                "—"}
                                        </td>

                                        <td>
                                            <span
                                                className={getStatusClass(
                                                    payment.paymentStatus
                                                )}
                                            >
                                                {payment.paymentStatus ||
                                                    "UNKNOWN"}
                                            </span>
                                        </td>

                                        <td>
                                            {formatDate(
                                                payment.paymentDate ||
                                                    payment.createdAt
                                            )}
                                        </td>
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

export default AdminPayments;