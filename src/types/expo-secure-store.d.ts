declare module "expo-secure-store" {
  export const AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: number;

  export function setItemAsync(
    key: string,
    value: string,
    options?: { keychainAccessible?: number }
  ): Promise<void>;

  export function getItemAsync(key: string): Promise<string | null>;

  export function deleteItemAsync(key: string): Promise<void>;
}
