import { Alert, Platform } from "react-native";
import type { AlertButton } from "react-native";

type BrowserDialogs = {
  alert?: (message: string) => void;
  confirm?: (message: string) => boolean;
};

/** Informational alerts and single-action confirmations on native and web. */
export function showAlert(title: string, message?: string, buttons?: AlertButton[]) {
  if (Platform.OS !== "web") {
    Alert.alert(title, message, buttons);
    return;
  }

  const dialogs = globalThis as BrowserDialogs;
  const text = [title, message].filter(Boolean).join("\n\n");
  const cancel = buttons?.find((button) => button.style === "cancel");
  const action = buttons?.find((button) => button.style !== "cancel");

  if (cancel || action?.style === "destructive") {
    // An unavailable browser dialog must never authorize a destructive action.
    if (typeof dialogs.confirm !== "function") return;
    if (dialogs.confirm(text)) action?.onPress?.();
    else cancel?.onPress?.();
    return;
  }

  if (typeof dialogs.alert !== "function") return;
  dialogs.alert(text);
  action?.onPress?.();
}
