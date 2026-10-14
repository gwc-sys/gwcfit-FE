/**
 * Detector-independent, on-device exercise analysis pipeline.
 *
 * A native detector (MediaPipe, ML Kit, MoveNet or TFLite) should convert each
 * camera frame to the normalized 33-point shape below and call processFrame().
 * Keeping this file detector-independent lets the dashboard and exercise logic
 * stay unchanged when the native model is replaced.
 */

export const POSE_LANDMARK_NAMES = [
  "nose", "left_eye_inner", "left_eye", "left_eye_outer", "right_eye_inner",
  "right_eye", "right_eye_outer", "left_ear", "right_ear", "mouth_left",
  "mouth_right", "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
  "left_wrist", "right_wrist", "left_pinky", "right_pinky", "left_index",
  "right_index", "left_thumb", "right_thumb", "left_hip", "right_hip",
  "left_knee", "right_knee", "left_ankle", "right_ankle", "left_heel",
  "right_heel", "left_foot_index", "right_foot_index",
] as const;

export type PoseLandmarkName = typeof POSE_LANDMARK_NAMES[number];
export type PoseProvider = "mediapipe" | "ml-kit" | "movenet" | "tflite";

export interface PoseLandmark {
  name: PoseLandmarkName;
  /** Normalized image coordinates (0..1). */
  x: number;
  y: number;
  /** Relative depth. Smaller values are normally closer to the camera. */
  z: number;
  confidence: number;
}

export interface PoseFrame {
  landmarks: PoseLandmark[];
  timestampMs: number;
  provider: PoseProvider;
}

export type MovementPhase = "waiting" | "lowered" | "extended";

export interface ExerciseAnalysis {
  repetitions: number;
  phase: MovementPhase;
  fullBodyVisible: boolean;
  formScore: number;
  confidence: number;
  jointAngles: Record<string, number>;
  rangeOfMotion: number;
  tempoSeconds: number | null;
  balance: number;
  stability: number;
  framesProcessed: number;
  feedback: string[];
  provider: PoseProvider | null;
}

type Joint = [PoseLandmarkName, PoseLandmarkName, PoseLandmarkName];

interface ExerciseProfile {
  joint: Joint;
  loweredBelow: number;
  extendedAbove: number;
  minimumRom: number;
  feedback: { lowered: string; extended: string };
}

const PROFILES: Record<string, ExerciseProfile> = {
  back_extension: {
    joint: ["left_shoulder", "left_hip", "left_knee"],
    loweredBelow: 135,
    extendedAbove: 165,
    minimumRom: 25,
    feedback: {
      lowered: "Lower with control and keep your spine neutral.",
      extended: "Stop at a straight body line; do not overextend your back.",
    },
  },
  squat: {
    joint: ["left_hip", "left_knee", "left_ankle"],
    loweredBelow: 105,
    extendedAbove: 160,
    minimumRom: 45,
    feedback: {
      lowered: "Lower until your hips reach a comfortable depth.",
      extended: "Stand tall while keeping your knees aligned with your toes.",
    },
  },
  default: {
    joint: ["left_shoulder", "left_hip", "left_knee"],
    loweredBelow: 125,
    extendedAbove: 160,
    minimumRom: 30,
    feedback: {
      lowered: "Move through the lowering phase with control.",
      extended: "Complete the movement without locking or overextending.",
    },
  },
};

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const round = (value: number) => Math.round(value * 10) / 10;

function profileFor(exerciseName: string): ExerciseProfile {
  const value = exerciseName.toLowerCase();
  if (value.includes("back extension") || value.includes("hyperextension")) return PROFILES.back_extension;
  if (value.includes("squat")) return PROFILES.squat;
  return PROFILES.default;
}

function point(map: Map<PoseLandmarkName, PoseLandmark>, name: PoseLandmarkName) {
  return map.get(name);
}

/** Returns the 3D angle ABC in degrees. */
export function jointAngle(a: PoseLandmark, b: PoseLandmark, c: PoseLandmark) {
  const ab = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const cb = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };
  const dot = ab.x * cb.x + ab.y * cb.y + ab.z * cb.z;
  const abLength = Math.hypot(ab.x, ab.y, ab.z);
  const cbLength = Math.hypot(cb.x, cb.y, cb.z);
  if (!abLength || !cbLength) return 0;
  return Math.acos(clamp(dot / (abLength * cbLength), -1, 1)) * (180 / Math.PI);
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function initialAnalysis(repetitions = 0): ExerciseAnalysis {
  return {
    repetitions,
    phase: "waiting",
    fullBodyVisible: false,
    formScore: 0,
    confidence: 0,
    jointAngles: {},
    rangeOfMotion: 0,
    tempoSeconds: null,
    balance: 0,
    stability: 0,
    framesProcessed: 0,
    feedback: ["Position your full body in the camera frame."],
    provider: null,
  };
}

export class ExerciseAnalysisEngine {
  private profile: ExerciseProfile;
  private result: ExerciseAnalysis;
  private minimumAngle = 180;
  private maximumAngle = 0;
  private lastRepAt: number | null = null;
  private hipCenters: Array<{ x: number; y: number }> = [];

  constructor(exerciseName: string, initialRepetitions = 0) {
    this.profile = profileFor(exerciseName);
    this.result = initialAnalysis(initialRepetitions);
  }

  reset(exerciseName: string, initialRepetitions = 0) {
    this.profile = profileFor(exerciseName);
    this.result = initialAnalysis(initialRepetitions);
    this.minimumAngle = 180;
    this.maximumAngle = 0;
    this.lastRepAt = null;
    this.hipCenters = [];
    return this.snapshot();
  }

  /**
   * Use only as a fallback while no native frame adapter is installed. The
   * actual AI path must call processFrame() with detector landmarks.
   */
  confirmManualRep(timestampMs = Date.now()) {
    const tempoSeconds = this.lastRepAt ? round((timestampMs - this.lastRepAt) / 1000) : null;
    this.lastRepAt = timestampMs;
    this.result = {
      ...this.result,
      repetitions: this.result.repetitions + 1,
      tempoSeconds,
      feedback: ["Rep recorded manually. Connect a pose detector for automatic form analysis."],
    };
    return this.snapshot();
  }

  processFrame(frame: PoseFrame) {
    const landmarks = new Map(frame.landmarks.map((landmark) => [landmark.name, landmark]));
    const visible = frame.landmarks.filter((landmark) => landmark.confidence >= 0.5);
    const requiredForFullBody: PoseLandmarkName[] = [
      "nose", "left_shoulder", "right_shoulder", "left_hip", "right_hip",
      "left_knee", "right_knee", "left_ankle", "right_ankle",
    ];
    const fullBodyVisible = requiredForFullBody.every((name) => (landmarks.get(name)?.confidence ?? 0) >= 0.5);
    const confidence = clamp(average(visible.map((landmark) => landmark.confidence)) * 100);
    const [aName, bName, cName] = this.profile.joint;
    const a = point(landmarks, aName);
    const b = point(landmarks, bName);
    const c = point(landmarks, cName);

    if (!a || !b || !c || Math.min(a.confidence, b.confidence, c.confidence) < 0.5) {
      this.result = {
        ...this.result,
        fullBodyVisible,
        confidence: round(confidence),
        framesProcessed: this.result.framesProcessed + 1,
        provider: frame.provider,
        feedback: ["Move back until your full body and working joints are visible."],
      };
      return this.snapshot();
    }

    const angle = jointAngle(a, b, c);
    this.minimumAngle = Math.min(this.minimumAngle, angle);
    this.maximumAngle = Math.max(this.maximumAngle, angle);
    const rangeOfMotion = this.maximumAngle - this.minimumAngle;
    let phase = this.result.phase;
    let repetitions = this.result.repetitions;
    let tempoSeconds = this.result.tempoSeconds;

    if (angle <= this.profile.loweredBelow) phase = "lowered";
    if (angle >= this.profile.extendedAbove) {
      if (phase === "lowered" && rangeOfMotion >= this.profile.minimumRom && (!this.lastRepAt || frame.timestampMs - this.lastRepAt > 450)) {
        repetitions += 1;
        tempoSeconds = this.lastRepAt ? round((frame.timestampMs - this.lastRepAt) / 1000) : null;
        this.lastRepAt = frame.timestampMs;
        this.minimumAngle = angle;
        this.maximumAngle = angle;
      }
      phase = "extended";
    }

    const leftShoulder = point(landmarks, "left_shoulder");
    const rightShoulder = point(landmarks, "right_shoulder");
    const leftHip = point(landmarks, "left_hip");
    const rightHip = point(landmarks, "right_hip");
    const balanceError = leftShoulder && rightShoulder && leftHip && rightHip
      ? Math.abs((leftShoulder.y - rightShoulder.y) - (leftHip.y - rightHip.y))
      : 0.25;
    const balance = clamp(100 - balanceError * 400);

    if (leftHip && rightHip) {
      this.hipCenters.push({ x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 });
      if (this.hipCenters.length > 20) this.hipCenters.shift();
    }
    const centerX = average(this.hipCenters.map((item) => item.x));
    const centerY = average(this.hipCenters.map((item) => item.y));
    const movementNoise = average(this.hipCenters.map((item) => Math.hypot(item.x - centerX, item.y - centerY)));
    const stability = clamp(100 - movementNoise * 600);
    const romScore = clamp((rangeOfMotion / this.profile.minimumRom) * 100);
    const formScore = clamp(confidence * 0.25 + romScore * 0.3 + balance * 0.2 + stability * 0.2 + (fullBodyVisible ? 5 : 0));
    const feedback: string[] = [];
    if (!fullBodyVisible) feedback.push("Position your full body, including both ankles, inside the camera frame.");
    if (confidence < 70) feedback.push("Keep your full body visible and improve the lighting.");
    if (balance < 75) feedback.push("Keep both sides level and distribute your weight evenly.");
    if (stability < 70) feedback.push("Slow down and stabilize your torso before the next rep.");
    if (rangeOfMotion < this.profile.minimumRom) feedback.push(this.profile.feedback.lowered);
    if (angle > 178) feedback.push(this.profile.feedback.extended);
    if (!feedback.length) feedback.push("Good form. Keep the movement smooth and controlled.");

    this.result = {
      repetitions,
      phase,
      fullBodyVisible,
      formScore: round(formScore),
      confidence: round(confidence),
      jointAngles: { primary: round(angle) },
      rangeOfMotion: round(rangeOfMotion),
      tempoSeconds,
      balance: round(balance),
      stability: round(stability),
      framesProcessed: this.result.framesProcessed + 1,
      feedback,
      provider: frame.provider,
    };
    return this.snapshot();
  }

  snapshot(): ExerciseAnalysis {
    return { ...this.result, jointAngles: { ...this.result.jointAngles }, feedback: [...this.result.feedback] };
  }
}
