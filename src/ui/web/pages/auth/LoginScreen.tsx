import { Controller } from "react-hook-form";
import { Image, StyleSheet } from "react-native";
import { images } from "../../../../data/media";
import { getApiErrorMessage } from "../../../../services/api/client";
import type { useLoginScreenPresentation } from "../../../../screens/auth/LoginScreen";

export function LoginScreenView({ model }: { model: ReturnType<typeof useLoginScreenPresentation> }) {
  const { navigation, canGoBack, control, errors, passwordVisible, setPasswordVisible, loginMutation, submit } = model.props;
  return (
    <div className="pulse-auth">
      <aside className="pulse-auth-story" aria-label="About PulseFit">
        <Image source={images.gymHero} resizeMode="cover" style={StyleSheet.absoluteFill} accessible={false} />
        <div className="pulse-auth-story-overlay">
          <div className="pulse-auth-brand"><span className="pulse-auth-brand-mark" aria-hidden="true">P</span>PulseFit</div>
          <div><span className="pulse-web-eyebrow">Your gym. Connected.</span><h1>A clearer view.<br />A stronger journey.</h1><p>Manage your gym, your team, and every member journey from one powerful workspace.</p><div className="pulse-auth-proof"><span>Gym operations</span><span>Member experience</span><span>Secure access</span></div></div>
          <span className="pulse-auth-footnote">One workspace for your fitness community.</span>
        </div>
      </aside>
      <main className="pulse-auth-form-pane">
        <div className="pulse-auth-form-wrap">
          {canGoBack ? <button type="button" className="pulse-auth-link pulse-auth-back" onClick={() => navigation.goBack()}>← Back</button> : null}
          <span className="pulse-web-eyebrow">Welcome back</span><h2>Sign in to PulseFit</h2><p>Use the email and password registered in your gym workspace.</p>
          <form className="pulse-auth-form" noValidate onSubmit={event => { event.preventDefault(); void submit(); }}>
            <Controller control={control} name="email" render={({ field }) => <div className="pulse-auth-field"><label htmlFor="pulse-login-email">Email</label><input id="pulse-login-email" {...field} type="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" placeholder="you@example.com" required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "pulse-login-email-error" : undefined} />{errors.email ? <span id="pulse-login-email-error" role="alert" className="pulse-auth-error">{errors.email.message}</span> : null}</div>} />
            <Controller control={control} name="password" render={({ field }) => <div className="pulse-auth-field"><label htmlFor="pulse-login-password">Password</label><div className="pulse-auth-password"><input id="pulse-login-password" {...field} type={passwordVisible ? "text" : "password"} autoComplete="current-password" placeholder="Your password" maxLength={72} required aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "pulse-login-password-error" : undefined} /><button type="button" className="pulse-auth-reveal" aria-label={passwordVisible ? "Hide password" : "Show password"} aria-pressed={passwordVisible} onClick={() => setPasswordVisible(value => !value)}>{passwordVisible ? "Hide" : "Show"}</button></div>{errors.password ? <span id="pulse-login-password-error" role="alert" className="pulse-auth-error">{errors.password.message}</span> : null}</div>} />
            {loginMutation.error ? <div className="pulse-auth-error" role="alert">{getApiErrorMessage(loginMutation.error)}</div> : null}
            <button type="button" className="pulse-auth-link" onClick={() => navigation.navigate("AccountRecovery")}>Forgot password?</button>
            <button type="submit" className="pulse-auth-submit" disabled={loginMutation.isPending} aria-busy={loginMutation.isPending}>{loginMutation.isPending ? "Signing in…" : "Sign In"}</button>
          </form>
          <div className="pulse-auth-footer">New to PulseFit?<button type="button" className="pulse-auth-link" onClick={() => navigation.navigate("SignUp")}>Create account →</button></div>
        </div>
      </main>
    </div>
  );
}
