import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import "./styles/theme.css";

import Login from "./pages/auth/Login";
import AdminDashboard from "./pages/AdminDashboard";
import CoachDashboard from "./pages/CoachDashboard";
import AthleteDashboard from "./pages/AthleteDashboard";
import Athletes from "./pages/Athletes";
import AthleteProfile from "./pages/AthleteProfile";
import Analytics from "./pages/Analytics";
import Assessments from "./pages/Assessments";
import AIReports from "./pages/AIReports";
import UserManagement from "./pages/UserManagement";
import AdminPayments from "./pages/AdminPayments";
import DataVerification from "./pages/DataVerification";
import ResearcherDashboard from "./pages/ResearcherDashboard";

function DashboardRouter() {
    const user = JSON.parse(
        localStorage.getItem("ams_user") || "{}"
    );

    if (!user.role) {
        return <Navigate to="/" replace />;
    }

    if (user.role === "ADMIN") {
        return <AdminDashboard />;
    }

    if (user.role === "COACH") {
        return <CoachDashboard />;
    }

    if (user.role === "ATHLETE") {
        return <AthleteDashboard />;
    }

    if (user.role === "RESEARCHER") {
        return <ResearcherDashboard />;
    }

    return <Navigate to="/" replace />;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/dashboard"
                    element={<DashboardRouter />}
                />

                <Route
                    path="/athletes"
                    element={<Athletes />}
                />

                <Route
                    path="/athletes/:id"
                    element={<AthleteProfile />}
                />

                <Route
                    path="/analytics"
                    element={<Analytics />}
                />

                <Route
                    path="/assessments"
                    element={<Assessments />}
                />

                <Route
                    path="/admin/verification"
                    element={<DataVerification />}
                />

                <Route
                    path="/reports"
                    element={<AIReports />}
                />

                <Route
                    path="/admin/users"
                    element={<UserManagement />}
                />

                <Route
                    path="/admin/payments"
                    element={<AdminPayments />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;