import Sidebar from "./Sidebar";
import "../../styles/dashboard.css";

function DashboardLayout({ children }) {
    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="dashboard-main">
                {children}
            </main>
        </div>
    );
}

export default DashboardLayout;