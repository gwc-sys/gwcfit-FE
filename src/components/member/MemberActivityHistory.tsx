import { Modal } from "react-native";
import { MemberMoveScreen } from "./MemberMoveScreen";

type Props = { onClose: () => void; onGoal: () => void };

/** Every activity-history entry point opens the same day-by-day ring screen. */
export function MemberActivityHistory({ onClose }: Props) {
  return <Modal visible animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
    <MemberMoveScreen onClose={onClose} />
  </Modal>;
}
