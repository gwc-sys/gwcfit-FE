import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

import {
  POSE_LANDMARK_NAMES,
  type ExerciseAnalysis,
  type ExerciseAnalysisEngine,
  type PoseLandmark,
} from "../services/poseAnalysisEngine";

type TrackingStatus = "idle" | "loading" | "tracking" | "no-pose" | "unsupported" | "error";

interface UseWebPoseTrackingOptions {
  enabled: boolean;
  active: boolean;
  cameraElementId: string;
  engine: ExerciseAnalysisEngine;
  onAnalysis: (analysis: ExerciseAnalysis) => void;
}

const WASM_PATH = "/mediapipe";
const MEDIAPIPE_MODULE = "/mediapipe/vision_bundle.mjs";
const MODEL_PATH = "/mediapipe/pose_landmarker_lite.task";
type MediaPipeVision = typeof import("@mediapipe/tasks-vision");

/** Runs MediaPipe only on web; native builds use the same engine through a native adapter. */
export function useWebPoseTracking({ enabled, active, cameraElementId, engine, onAnalysis }: UseWebPoseTrackingOptions) {
  const [landmarks, setLandmarks] = useState<PoseLandmark[]>([]);
  const [status, setStatus] = useState<TrackingStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const activeRef = useRef(active);
  const onAnalysisRef = useRef(onAnalysis);
  activeRef.current = active;
  onAnalysisRef.current = onAnalysis;

  useEffect(() => {
    if (!enabled) {
      setStatus("idle");
      setLandmarks([]);
      return;
    }
    if (Platform.OS !== "web" || typeof document === "undefined") {
      setStatus("unsupported");
      return;
    }

    let cancelled = false;
    let animationFrame = 0;
    let landmarker: import("@mediapipe/tasks-vision").PoseLandmarker | null = null;
    let lastVideoTime = -1;
    let lastInferenceAt = 0;
    setStatus("loading");
    setError(null);

    const findVideo = () => {
      const camera = document.getElementById(cameraElementId);
      if (!camera) return null;
      if (camera instanceof HTMLVideoElement) return camera;
      return camera.querySelector("video");
    };

    const run = async () => {
      try {
        // Metro cannot bundle MediaPipe's computed worker import. Loading the
        // official browser ESM at runtime keeps that import in the browser.
        const importBrowserModule = new Function("url", "return import(url)") as (url: string) => Promise<MediaPipeVision>;
        const { FilesetResolver, PoseLandmarker } = await importBrowserModule(MEDIAPIPE_MODULE);
        const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
        const options = {
          baseOptions: { modelAssetPath: MODEL_PATH, delegate: "GPU" as const },
          runningMode: "VIDEO" as const,
          numPoses: 1,
          minPoseDetectionConfidence: 0.55,
          minPosePresenceConfidence: 0.55,
          minTrackingConfidence: 0.55,
          outputSegmentationMasks: false,
        };
        try {
          landmarker = await PoseLandmarker.createFromOptions(vision, options);
        } catch {
          landmarker = await PoseLandmarker.createFromOptions(vision, {
            ...options,
            baseOptions: { modelAssetPath: MODEL_PATH, delegate: "CPU" },
          });
        }
        if (cancelled) return;

        const detect = () => {
          if (cancelled || !landmarker) return;
          const video = findVideo();
          const now = performance.now();
          if (activeRef.current && video && video.readyState >= 2 && video.currentTime !== lastVideoTime && now - lastInferenceAt >= 1000 / 30) {
            lastVideoTime = video.currentTime;
            lastInferenceAt = now;
            try {
              const result = landmarker.detectForVideo(video, now);
              const detected = result.landmarks[0];
              if (detected?.length === POSE_LANDMARK_NAMES.length) {
                const nextLandmarks: PoseLandmark[] = detected.map((landmark, index) => ({
                  name: POSE_LANDMARK_NAMES[index],
                  x: landmark.x,
                  y: landmark.y,
                  z: landmark.z,
                  confidence: landmark.visibility ?? 0,
                }));
                setLandmarks(nextLandmarks);
                setStatus("tracking");
                onAnalysisRef.current(engine.processFrame({
                  landmarks: nextLandmarks,
                  timestampMs: now,
                  provider: "mediapipe",
                }));
              } else {
                setLandmarks([]);
                setStatus("no-pose");
              }
            } catch (reason) {
              setStatus("error");
              setError(reason instanceof Error ? reason.message : "Pose frame analysis failed.");
            }
          }
          animationFrame = requestAnimationFrame(detect);
        };
        animationFrame = requestAnimationFrame(detect);
      } catch (reason) {
        if (cancelled) return;
        setStatus("error");
        setError(reason instanceof Error ? reason.message : "Could not start the pose detector.");
      }
    };

    void run();
    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrame);
      landmarker?.close();
    };
  }, [cameraElementId, enabled, engine]);

  return { landmarks, status, error };
}
