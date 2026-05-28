"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message === "Invalid login credentials"
        ? "帳號或密碼錯誤"
        : signInError.message
      );
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="login-page">
      <div className="login-bg-gradient" />
      <div className="login-bg-grid" />

      <div className="login-container" style={{ animation: "fadeIn 0.6s ease-out" }}>
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />
              <path d="M10 16L14 20L22 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#6c5ce7" />
                  <stop offset="1" stopColor="#0984e3" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="login-title">PM System</h1>
          <p className="login-subtitle">專案管理系統</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error" style={{ animation: "slideUp 0.3s ease-out" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4.25a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0v-3zM8 11a.75.75 0 100-1.5.75.75 0 000 1.5z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="login-field">
            <label htmlFor="email" className="login-label">電子信箱</label>
            <div className="login-input-wrapper">
              <svg className="login-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="login-input"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="password" className="login-label">密碼</label>
            <div className="login-input-wrapper">
              <svg className="login-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-input"
                autoComplete="current-password"
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="login-spinner" />
                登入中...
              </>
            ) : (
              "登入"
            )}
          </button>
        </form>

        <p className="login-footer">
          © 2026 PM System. All rights reserved.
        </p>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: var(--bg-primary);
        }

        .login-bg-gradient {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse at 20% 50%, rgba(108, 92, 231, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(9, 132, 227, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 80%, rgba(108, 92, 231, 0.08) 0%, transparent 50%);
        }

        .login-bg-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .login-container {
          position: relative;
          width: 100%;
          max-width: 420px;
          padding: 48px 40px;
          background: var(--bg-card);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg);
          margin: 20px;
        }

        .login-logo {
          text-align: center;
          margin-bottom: 36px;
        }

        .login-logo-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(108, 92, 231, 0.2), rgba(9, 132, 227, 0.2));
          margin-bottom: 16px;
          box-shadow: 0 0 30px rgba(108, 92, 231, 0.2);
        }

        .login-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 4px 0;
          letter-spacing: -0.02em;
        }

        .login-subtitle {
          font-size: 14px;
          color: var(--text-muted);
          margin: 0;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .login-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: var(--danger-bg);
          border: 1px solid rgba(225, 112, 85, 0.3);
          border-radius: var(--radius-md);
          color: var(--danger);
          font-size: 13px;
        }

        .login-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .login-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .login-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .login-input-icon {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
          pointer-events: none;
          transition: var(--transition);
        }

        .login-input {
          width: 100%;
          padding: 12px 14px 12px 44px;
          background: var(--bg-glass);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 14px;
          font-family: var(--font-family);
          transition: var(--transition);
          outline: none;
        }

        .login-input:focus {
          border-color: var(--accent-purple);
          box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.15);
          background: var(--bg-glass-hover);
        }

        .login-input-wrapper:focus-within .login-input-icon {
          color: var(--accent-purple-light);
        }

        .login-input::placeholder {
          color: var(--text-muted);
        }

        .login-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 13px 24px;
          background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
          border: none;
          border-radius: var(--radius-md);
          color: white;
          font-size: 15px;
          font-weight: 600;
          font-family: var(--font-family);
          cursor: pointer;
          transition: var(--transition);
          margin-top: 4px;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(108, 92, 231, 0.4);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-footer {
          text-align: center;
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 32px;
        }

        @media (max-width: 480px) {
          .login-container {
            padding: 32px 24px;
            margin: 16px;
          }
        }
      `}</style>
    </div>
  );
}
