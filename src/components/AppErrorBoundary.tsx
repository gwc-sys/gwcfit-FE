import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";
import { ErrorFallback } from "./ErrorFallback";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (__DEV__) {
      console.error("Unhandled application error", error, info.componentStack);
    }
  }

  private retry = () => this.setState({ error: null });

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return <ErrorFallback onRetry={this.retry} />;
  }
}

