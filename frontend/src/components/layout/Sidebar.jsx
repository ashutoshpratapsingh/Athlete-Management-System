
import { NavLink, useNavigate } from "react-router-dom";
import "../../styles/sidebar.css";

function Sidebar() {
    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("ams_user") || "{}"
    );

    const userRole = String(user.role || "").toUpperCase();

    const canManageAthletes =
        userRole === "ADMIN" || userRole === "COACH";

    const handleLogout = () => {
        localStorage.removeItem("ams_token");
        localStorage.removeItem("ams_user");

        navigate("/");
    };

    const getLinkClass = ({ isActive }) =>
        isActive
            ? "sidebar-link active"
            : "sidebar-link";

    return (
        <aside className="sidebar">

            {/* Brand */}
            <div className="sidebar-brand">
                <div className="sidebar-logo">
                    K
                </div>

                <div>
                    <h2>AMS</h2>

                    <span>
                        Athlete Management
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">

                {/* Dashboard */}
                <NavLink
                    to="/dashboard"
                    className={getLinkClass}
                >
                    <span className="sidebar-icon">
                        ▦
                    </span>

                    Dashboard
                </NavLink>

                {/* Athletes - Admin and Coach only */}
                {canManageAthletes && (
                    <NavLink
                        to="/athletes"
                        className={getLinkClass}
                    >
                        <span className="sidebar-icon">
                            ◉
                        </span>

                        Athletes
                    </NavLink>
                )}

{/* Assessments - hide for Researcher */}
{userRole !== "RESEARCHER" && (
    <NavLink
        to="/assessments"
        className={getLinkClass}
    >
        <span className="sidebar-icon">
            ◫
        </span>
        Assessments
    </NavLink>
)}

{/* Analytics - Admin and Coach only */}
{canManageAthletes && (
    <NavLink
        to="/analytics"
        className={getLinkClass}
    >
        <span className="sidebar-icon">
            ◈
        </span>

        Analytics
    </NavLink>
)}

{/* AI Reports - hide for Researcher */}
{userRole !== "RESEARCHER" && (
    <NavLink
        to="/reports"
        className={getLinkClass}
    >
        <span className="sidebar-icon">
            ✦
        </span>
        AI Reports
    </NavLink>
)}

{/* User Management - Admin only */}
{userRole === "ADMIN" && (
    <>
        <NavLink
            to="/admin/users"
            className={getLinkClass}
        >
            <span className="sidebar-icon">
                ⚙
            </span>

            User Management
        </NavLink>

        <NavLink
            to="/admin/payments"
            className={getLinkClass}
        >
            <span className="sidebar-icon">
                ₹
            </span>

            Payments
        </NavLink>
    </>
)}
            </nav>

            {/* User Information and Logout */}
            <div className="sidebar-bottom">

                <div className="sidebar-user">

                    <div className="user-avatar">
                        {user.name
                            ? user.name
                                .charAt(0)
                                .toUpperCase()
                            : "U"}
                    </div>

                    <div className="user-details">

                        <strong>
                            {user.name || "User"}
                        </strong>

                        <span>
                            {user.role || "ATHLETE"}
                        </span>

                    </div>
                </div>

                <button
                    className="sidebar-logout"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>

        </aside>
    );
}

export default Sidebar;