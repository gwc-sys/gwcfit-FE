import { useAppTheme } from "../../../theme/AppThemeProvider";
import { PrimaryButton } from "./PrimaryButton";

export function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const { colors } = useAppTheme();
  return (
    <main className="pulse-web-error" role="alert" style={{ background: colors.background, color: colors.ink }}>
      <section style={{ background: colors.surface, borderColor: colors.border }}>
        <span className="pulse-web-eyebrow">PulseFit</span>
        <h1>Something went wrong</h1>
        <p style={{ color: colors.muted }}>The app hit an unexpected error. Try loading this screen again.</p>
        <PrimaryButton title="Try Again" icon="refresh-outline" onPress={onRetry} />
      </section>
    </main>
  );
}
