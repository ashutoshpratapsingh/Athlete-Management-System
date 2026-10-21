import DashboardLayout from "../components/layout/DashboardLayout";

function Dashboard() {
    const user = JSON.parse(
        localStorage.getItem("ams_user") || "{}"
    );

    return (
        <DashboardLayout>
            <div className="dashboard-header">
                <div>
                    <span className="dashboard-eyebrow">
                        OVERVIEW
                    </span>

                    <h1>Dashboard</h1>

                    <p>
                        Welcome back,{" "}
                        {user.name || "User"}.
                        Here's your athlete overview.
                    </p>
                </div>

                <div className="dashboard-date">
                    AMS
                </div>
            </div>

            <div className="dashboard-grid">

                <div className="stat-card">
                    <span>Total Athletes</span>
                    <strong>5</strong>
                    <small>Registered athletes</small>
                </div>

                <div className="stat-card">
                    <span>Active Athletes</span>
                    <strong>5</strong>
                    <small>Currently active</small>
                </div>

                <div className="stat-card">
                    <span>Assessments</span>
                    <strong>5</strong>
                    <small>Completed assessments</small>
                </div>

                <div className="stat-card">
                    <span>AI Reports</span>
                    <strong>0</strong>
                    <small>Reports generated</small>
                </div>

            </div>

            <div className="dashboard-content">

                <section className="dashboard-panel">
                    <div className="panel-header">
                        <div>
                            <span className="panel-eyebrow">
                                PERFORMANCE
                            </span>

                            <h2>Performance Overview</h2>
                        </div>

                        <span className="panel-badge">
                            ML Analytics
                        </span>
                    </div>

                    <div className="empty-analytics">
                        <div className="analytics-icon">
                            ◈
                        </div>

                        <h3>
                            Athlete performance analytics
                        </h3>

                        <p>
                            Performance scores and trends
                            will appear here once analytics
                            are generated.
                        </p>
                    </div>
                </section>

                <section className="dashboard-panel">
                    <div className="panel-header">
                        <div>
                            <span className="panel-eyebrow">
                                QUICK ACCESS
                            </span>

                            <h2>Quick Actions</h2>
                        </div>
                    </div>

                    <div className="quick-actions">

                        <button>
                            <span>＋</span>
                            Add Athlete
                        </button>

                        <button>
                            <span>◫</span>
                            New Assessment
                        </button>

                        <button>
                            <span>✦</span>
                            Generate Report
                        </button>

                    </div>
                </section>

            </div>
        </DashboardLayout>
    );
}

export default Dashboard;