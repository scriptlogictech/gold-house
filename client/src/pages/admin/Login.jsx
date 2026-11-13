
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Gem,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, loading: authLoading, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const destination =
    location.state?.from?.pathname || "/admin/dashboard";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      await login({
        email: normalizedEmail,
        password,
      });

      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to sign in. Check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <main className="auth-loading">
        <div className="auth-loading-spinner" />
        <p>Checking your session...</p>
      </main>
    );
  }

  if (user) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <main className="gh-login">
      <section className="gh-login-card">
        <Link to="/" className="gh-login-home">
          ← Back to Gold House
        </Link>

        <div className="gh-login-logo">
          <Gem size={28} strokeWidth={1.5} />
        </div>

        <p className="gh-login-eyebrow">GOLD HOUSE DSS</p>

        <h1>Welcome back</h1>

        <p className="gh-login-description">
          Sign in to manage customer relationships and loyalty records.
        </p>

        {error && (
          <div className="gh-login-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email address</label>

          <div className="gh-login-input">
            <Mail size={18} />

            <input
              id="login-email"
              type="email"
              autoComplete="username"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={loading}
            />
          </div>

          <label htmlFor="login-password">Password</label>

          <div className="gh-login-input">
            <LockKeyhole size={18} />

            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={loading}
            />

            <button
              type="button"
              className="gh-login-password-toggle"
              onClick={() => setShowPassword((previous) => !previous)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={loading}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            className="gh-login-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle size={18} className="gh-login-spinner" />
                Signing in...
              </>
            ) : (
              "Sign in to CRM"
            )}
          </button>
        </form>

        <p className="gh-login-security">
          <LockKeyhole size={14} />
          Secure staff access
        </p>
      </section>
    </main>
  );
}
