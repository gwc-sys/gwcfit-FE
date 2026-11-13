import type { ReactNode } from "react";
import { Controller } from "react-hook-form";
import { AppLogo } from "../../../../components/AppLogo";
import { getApiErrorMessage } from "../../../../services/api/client";
import type { useLoginScreenPresentation } from "../../../../screens/auth/LoginScreen";

type IconProps = { children: ReactNode; size?: number; strokeWidth?: number };

function Icon({ children, size = 16, strokeWidth = 2 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

const capabilities = [
  { label: "Gym operations", icon: <Icon><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></Icon> },
  { label: "Member experience", icon: <Icon><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /><path d="M9 14h6" /></Icon> },
  { label: "Secure access", icon: <Icon><path d="M12 3 5 6v5c0 4.4 3 8.3 7 9.5 4-1.2 7-5.1 7-9.5V6l-7-3Z" /><path d="m9.5 12 1.8 1.8 3.4-3.6" /></Icon> }
];

const stats = [
  { value: "99.9%", label: "Door Uptime" },
  { value: "1.2M+", label: "Check-ins" },
  { value: "< 0.2s", label: "RFID Auth" }
];

export function LoginScreenView({ model }: { model: ReturnType<typeof useLoginScreenPresentation> }) {
  const { navigation, canGoBack, control, errors, passwordVisible, setPasswordVisible, loginMutation, submit, isDark, toggleColorScheme } = model.props;
  return (
    <div className={`pulse-auth ${isDark ? "pulse-auth--dark" : "pulse-auth--light"}`}>
      <header className="pulse-auth-topbar">
        <div className="pulse-auth-brand">
          <AppLogo size={38} />
          <span className="pulse-auth-brand-text">
            <span className="pulse-auth-brand-name">Pulse<span style={{ color: "#E91E63" }}>Fit</span><span className="pulse-auth-brand-dot" aria-hidden="true" /></span>
            <span className="pulse-auth-brand-sub">Workspace v3.4</span>
          </span>
        </div>
        <div className="pulse-auth-topbar-actions">
          <span className="pulse-auth-pill pulse-auth-status">
            <span className="pulse-auth-status-icon" aria-hidden="true"><Icon size={10} strokeWidth={3.5}><path d="m5 12.5 4.5 4.5L19 7.5" /></Icon></span>
            All Gym Nodes Active
          </span>
          <button type="button" className="pulse-auth-pill pulse-auth-theme-toggle" onClick={toggleColorScheme} aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
            {isDark
              ? <Icon size={14}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></Icon>
              : <Icon size={14}><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" /></Icon>}
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </header>

      <div className="pulse-auth-body">
        <section className="pulse-auth-story" aria-label="About PulseFit">
          <span className="pulse-auth-eyebrow"><span className="pulse-auth-eyebrow-dot" aria-hidden="true" />Your gym. Connected.</span>
          <h1>
            <span className="pulse-auth-title-line">A clearer view.</span>
            <span className="pulse-auth-title-accent">A stronger journey.</span>
          </h1>
          <p className="pulse-auth-lead">Manage your gym, your team, and every member journey from one powerful, unified workspace built for peak performance.</p>

          <span className="pulse-auth-section-label">Explore capabilities</span>
          <ul className="pulse-auth-capabilities">
            {capabilities.map(item => (
              <li key={item.label} className="pulse-auth-chip">
                <span className="pulse-auth-chip-icon">{item.icon}</span>
                {item.label}
              </li>
            ))}
          </ul>

          <dl className="pulse-auth-stats">
            {stats.map(item => (
              <div key={item.label} className="pulse-auth-stat">
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>

          <span className="pulse-auth-footnote"><span className="pulse-auth-footnote-dot" aria-hidden="true" />One workspace for your fitness community.</span>
        </section>

        <main className="pulse-auth-card-pane">
          <div className="pulse-auth-card">
            {canGoBack ? <button type="button" className="pulse-auth-link pulse-auth-back" onClick={() => navigation.goBack()}>← Back</button> : null}
            <div style={{ marginBottom: 14 }}>
              <AppLogo size={52} />
            </div>
            <span className="pulse-auth-kicker">Welcome back</span>
            <h2>Sign in to PulseFit</h2>
            <p className="pulse-auth-card-copy">Use the email and password registered in your gym workspace.</p>

            <form className="pulse-auth-form" noValidate onSubmit={event => { event.preventDefault(); void submit(); }}>
              <Controller control={control} name="email" render={({ field }) => (
                <div className="pulse-auth-field">
                  <label htmlFor="pulse-login-email">Email</label>
                  <div className="pulse-auth-input-wrap">
                    <input id="pulse-login-email" {...field} type="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" placeholder="you@example.com" required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "pulse-login-email-error" : undefined} />
                    <span className="pulse-auth-input-adornment" aria-hidden="true">@</span>
                  </div>
                  {errors.email ? <span id="pulse-login-email-error" role="alert" className="pulse-auth-error">{errors.email.message}</span> : null}
                </div>
              )} />

              <Controller control={control} name="password" render={({ field }) => (
                <div className="pulse-auth-field">
                  <div className="pulse-auth-label-row">
                    <label htmlFor="pulse-login-password">Password</label>
                    <button type="button" className="pulse-auth-link pulse-auth-forgot" onClick={() => navigation.navigate("AccountRecovery")}>Forgot password?</button>
                  </div>
                  <div className="pulse-auth-input-wrap">
                    <input id="pulse-login-password" {...field} type={passwordVisible ? "text" : "password"} autoComplete="current-password" placeholder="Your password" maxLength={72} required aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "pulse-login-password-error" : undefined} />
                    <button type="button" className="pulse-auth-reveal" aria-label={passwordVisible ? "Hide password" : "Show password"} aria-pressed={passwordVisible} onClick={() => setPasswordVisible(value => !value)}>{passwordVisible ? "Hide" : "Show"}</button>
                  </div>
                  {errors.password ? <span id="pulse-login-password-error" role="alert" className="pulse-auth-error">{errors.password.message}</span> : null}
                </div>
              )} />

              {loginMutation.error ? <div className="pulse-auth-error pulse-auth-error-banner" role="alert">{getApiErrorMessage(loginMutation.error)}</div> : null}

              <button type="submit" className="pulse-auth-submit" disabled={loginMutation.isPending} aria-busy={loginMutation.isPending}>{loginMutation.isPending ? "Signing in…" : "Sign In"}</button>
            </form>

            <div className="pulse-auth-card-footer">
              New to PulseFit?
              <button type="button" className="pulse-auth-link pulse-auth-create" onClick={() => navigation.navigate("SignUp")}>Create account →</button>
            </div>
          </div>
        </main>
      </div>

      <footer className="pulse-auth-page-footer">
        <span>© {new Date().getFullYear()} PulseFit Inc. All rights reserved. Encrypted with 256-bit AES.</span>
        <nav className="pulse-auth-page-links" aria-label="Legal">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Support</span>
        </nav>
      </footer>
    </div>
  );
}
