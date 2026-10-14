import { Alert, Platform } from "react-native";

type ConfirmableGlobal = typeof globalThis & {
  confirm?: (message: string) => boolean;
};

export function requestLogoutConfirmation(onConfirm: () => void) {
  if (Platform.OS === "web") {
    const confirm = (globalThis as ConfirmableGlobal).confirm;
    const shouldLogout = typeof confirm === "function" ? confirm("End this session on this device?") : true;

    if (shouldLogout) {
      onConfirm();
    }

    return;
  }

  Alert.alert("Logout", "End this session on this device?", [
    { text: "Cancel", style: "cancel" },
    { text: "Logout", style: "destructive", onPress: onConfirm }
  ]);
}
