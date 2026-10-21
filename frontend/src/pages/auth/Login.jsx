import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../../styles/login.css";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", {
                email,
                password
            });

            const { token, user } = response.data;

            localStorage.setItem("ams_token", token);
            localStorage.setItem(
                "ams_user",
                JSON.stringify(user)
            );

            navigate("/dashboard");
        } catch (error) {
            console.error("Login error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to login. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">

                <div className="login-brand">
                    <div className="brand-mark">K</div>

                    <h1>AMS</h1>

                    <p>
                        Athlete Management System
                    </p>

                    <span>
                        Performance. Analytics. Intelligence.
                    </span>
                </div>

                <div className="login-card">

                    <div className="login-card-header">
                        <h2>Welcome back</h2>

                        <p>
                            Sign in to access your athlete
                            management dashboard.
                        </p>
                    </div>

                    <form onSubmit={handleLogin}>

                        <div className="form-group">
                            <label htmlFor="email">
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                placeholder="Enter your email"
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                placeholder="Enter your password"
                                disabled={loading}
                                required
                            />
                        </div>

                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>

                    </form>

                    <div className="login-footer">
                        <span>
                            AMS • Athlete Intelligence Platform
                        </span>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default Login;