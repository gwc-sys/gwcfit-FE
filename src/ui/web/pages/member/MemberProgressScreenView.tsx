import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Path,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { Screen } from "../../components/Screen";
import type {
  MemberGoal,
  MemberProfile,
  MemberProgressLog,
} from "../../../../types/member";

type TimeRange = "1W" | "1M" | "6M" | "1Y";

interface DisplayLogItem {
  id: string;
  timestamp: number;
  dateStr: string;
  timeStr: string;
  isToday: boolean;
  weightNum: number | null;
  bmiNum: number | null;
  bodyFatNum: number | null;
  caloriesNum: number | null;
  goalProgressNum: number | null;
  weight: string;
  bmi: string;
  bodyFat?: string;
  calories?: string;
  note?: string;
  noteColor?: string;
  rawLog?: MemberProgressLog;
}

function computeBmiFromHeightWeight(
  weightKg: number | null | undefined,
  heightCm: number | null | undefined
): number | null {
  if (
    weightKg == null ||
    heightCm == null ||
    !Number.isFinite(weightKg) ||
    !Number.isFinite(heightCm) ||
    weightKg <= 0 ||
    heightCm <= 0
  ) {
    return null;
  }
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

function getBmiCategory(bmi: number | null): {
  label: string;
  color: string;
  bg: string;
} {
  if (bmi == null || !Number.isFinite(bmi)) {
    return {
      label: "No Data",
      color: "#F2F2F7",
      bg: "rgba(255, 255, 255, 0.14)",
    };
  }
  if (bmi < 18.5) {
    return {
      label: "Underweight",
      color: "#007AFF",
      bg: "rgba(0, 122, 255, 0.14)",
    };
  }
  if (bmi < 25) {
    return {
      label: "Normal",
      color: "#34C759",
      bg: "rgba(52, 199, 89, 0.12)",
    };
  }
  if (bmi < 30) {
    return {
      label: "Overweight",
      color: "#E91E63",
      bg: "rgba(233, 30, 99, 0.14)",
    };
  }
  return {
    label: "Obese",
    color: "#E91E63",
    bg: "rgba(233, 30, 99, 0.14)",
  };
}

function getBodyFatCategory(bodyFat: number | null): {
  label: string;
  color: string;
  bg: string;
} {
  if (bodyFat == null || !Number.isFinite(bodyFat)) {
    return {
      label: "No Data",
      color: "#F2F2F7",
      bg: "rgba(255, 255, 255, 0.14)",
    };
  }
  if (bodyFat < 6) {
    return {
      label: "Essential",
      color: "#007AFF",
      bg: "rgba(0, 122, 255, 0.14)",
    };
  }
  if (bodyFat <= 24) {
    return {
      label: "Optimal",
      color: "#007AFF",
      bg: "rgba(0, 122, 255, 0.12)",
    };
  }
  if (bodyFat <= 31) {
    return {
      label: "Moderate",
      color: "#E91E63",
      bg: "rgba(233, 30, 99, 0.14)",
    };
  }
  return {
    label: "High",
    color: "#E91E63",
    bg: "rgba(233, 30, 99, 0.14)",
  };
}

export function MemberProgressScreenView({
  model,
}: {
  model?: any;
}): React.JSX.Element {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const isNarrow = width < 980;

  const props = model?.props ?? {};
  const user = props.user;
  const query = props.query;
  const profileQuery = props.profileQuery;
  const goalsQuery = props.goalsQuery;
  const createLogMutation = props.createLog;
  const deleteLogMutation = props.deleteLog;
  const createGoalMutation = props.createGoal;
  const updateGoalMutation = props.updateGoal;
  const updateProfileMutation = props.updateProfile;

  const rawLogs: MemberProgressLog[] = Array.isArray(query?.data)
    ? (query.data as MemberProgressLog[])
    : [];
  const profile: MemberProfile | undefined = profileQuery?.data;
  const goals: MemberGoal[] = Array.isArray(goalsQuery?.data)
    ? (goalsQuery.data as MemberGoal[])
    : [];

  // Form state (starts empty — never prefilled with dummy values)
  const [activeCalories, setActiveCalories] = useState("");
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [timeRange, setTimeRange] = useState<TimeRange>("1M");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [bannerNotice, setBannerNotice] = useState<{
    text: string;
    tone: "success" | "error";
  } | null>(null);

  // Detail Modal State
  const [selectedLog, setSelectedLog] = useState<DisplayLogItem | null>(null);

  // Target / Height Editor Modal State
  const [targetModalOpen, setTargetModalOpen] = useState(false);
  const [goalNameInput, setGoalNameInput] = useState("");
  const [targetWeightInput, setTargetWeightInput] = useState("");
  const [heightInput, setHeightInput] = useState("");

  // Track deleted log IDs for instant UI removal before refetch completes
  const [deletedIds, setDeletedIds] = useState<Record<string, boolean>>({});

  const activeLogs = useMemo(() => {
    return [...rawLogs]
      .filter((l) => !deletedIds[l.progress_uuid])
      .sort(
        (a, b) =>
          new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
      );
  }, [rawLogs, deletedIds]);

  // Member's height (cm) from profile or latest log measurement
  const heightCm = useMemo(() => {
    if (profile?.height != null && Number(profile.height) > 0) {
      return Number(profile.height);
    }
    const logWithHeight = activeLogs.find(
      (l) =>
        l.measurements &&
        typeof l.measurements.height_cm === "number" &&
        Number(l.measurements.height_cm) > 0
    );
    if (logWithHeight) {
      return Number(logWithHeight.measurements.height_cm);
    }
    return null;
  }, [profile?.height, activeLogs]);

  // Active goal and target weight from real member goals
  const activeGoal = useMemo(() => {
    return (
      goals.find(
        (g) =>
          g.status === "active" &&
          g.target_weight != null &&
          Number(g.target_weight) > 0
      ) ||
      goals.find((g) => g.status === "active") ||
      goals.find(
        (g) => g.target_weight != null && Number(g.target_weight) > 0
      ) ||
      goals[0] ||
      null
    );
  }, [goals]);

  const targetWeight = useMemo(() => {
    const goalWithTarget =
      goals.find(
        (g) =>
          g.status === "active" &&
          g.target_weight != null &&
          Number(g.target_weight) > 0
      ) ||
      goals.find(
        (g) => g.target_weight != null && Number(g.target_weight) > 0
      );
    if (goalWithTarget?.target_weight != null) {
      return Number(goalWithTarget.target_weight);
    }
    const logWithTarget = activeLogs.find(
      (l) =>
        l.measurements &&
        l.measurements.target_weight != null &&
        Number(l.measurements.target_weight) > 0
    );
    if (logWithTarget) {
      return Number(logWithTarget.measurements.target_weight);
    }
    return null;
  }, [goals, activeLogs]);

  const targetBodyFat = useMemo(() => {
    const logWithTargetBf = activeLogs.find(
      (l) =>
        l.measurements &&
        l.measurements.target_body_fat != null &&
        Number(l.measurements.target_body_fat) > 0
    );
    if (logWithTargetBf) {
      return Number(logWithTargetBf.measurements.target_body_fat);
    }
    return null;
  }, [activeLogs]);

  // Filtered logs with valid weight / body fat
  const weightLogs = useMemo(
    () =>
      activeLogs.filter((l) => l.weight != null && Number(l.weight) > 0),
    [activeLogs]
  );
  const bodyFatLogs = useMemo(
    () =>
      activeLogs.filter(
        (l) =>
          l.body_fat_percentage != null && Number(l.body_fat_percentage) > 0
      ),
    [activeLogs]
  );

  // Real current metrics (no dummy fallbacks)
  const latestWeightLog = weightLogs[0] ?? null;
  const prevWeightLog = weightLogs[1] ?? null;
  const oldestWeightLog =
    weightLogs.length > 0 ? weightLogs[weightLogs.length - 1] : null;

  const currentWeight: number | null =
    latestWeightLog?.weight != null
      ? Number(latestWeightLog.weight)
      : profile?.weight != null && Number(profile.weight) > 0
        ? Number(profile.weight)
        : null;

  const currentBmi: number | null = useMemo(() => {
    if (latestWeightLog?.bmi != null && Number(latestWeightLog.bmi) > 0) {
      return Number(Number(latestWeightLog.bmi).toFixed(1));
    }
    const fromWeightAndHeight = computeBmiFromHeightWeight(
      currentWeight,
      heightCm
    );
    if (fromWeightAndHeight != null) {
      return fromWeightAndHeight;
    }
    const logWithBmi = activeLogs.find(
      (l) => l.bmi != null && Number(l.bmi) > 0
    );
    if (logWithBmi?.bmi != null) {
      return Number(Number(logWithBmi.bmi).toFixed(1));
    }
    if (profile?.bmi != null && Number(profile.bmi) > 0) {
      return Number(Number(profile.bmi).toFixed(1));
    }
    return null;
  }, [latestWeightLog, currentWeight, heightCm, activeLogs, profile?.bmi]);

  const latestBodyFatLog = bodyFatLogs[0] ?? null;
  const prevBodyFatLog = bodyFatLogs[1] ?? null;
  const currentBodyFat: number | null =
    latestBodyFatLog?.body_fat_percentage != null
      ? Number(latestBodyFatLog.body_fat_percentage)
      : null;

  // Real weight trend difference between latest 2 weight logs
  const weightTrendDiff: { text: string; positive: boolean } | null =
    useMemo(() => {
      if (latestWeightLog?.weight != null && prevWeightLog?.weight != null) {
        const diff =
          Number(latestWeightLog.weight) - Number(prevWeightLog.weight);
        const sign = diff > 0 ? "+" : "";
        const movingTowardTarget =
          targetWeight != null
            ? Math.abs(Number(latestWeightLog.weight) - targetWeight) <=
              Math.abs(Number(prevWeightLog.weight) - targetWeight)
            : diff <= 0;
        return {
          text: `~ ${sign}${diff.toFixed(1)} kg`,
          positive: movingTowardTarget,
        };
      }
      if (latestWeightLog?.weight != null) {
        return { text: "1st log", positive: true };
      }
      return null;
    }, [latestWeightLog, prevWeightLog, targetWeight]);

  // Real goal progress calculation
  const goalProgress: number | null = useMemo(() => {
    const latestLoggedGoalPct = activeLogs.find(
      (l) => l.goal_progress_percentage != null
    )?.goal_progress_percentage;

    if (targetWeight != null && currentWeight != null) {
      if (Math.abs(currentWeight - targetWeight) < 0.05) {
        return 100;
      }
      const startWeight =
        oldestWeightLog?.weight != null
          ? Number(oldestWeightLog.weight)
          : profile?.weight != null && Number(profile.weight) > 0
            ? Number(profile.weight)
            : null;
      if (
        startWeight != null &&
        Math.abs(startWeight - targetWeight) >= 0.05 &&
        Math.abs(startWeight - currentWeight) >= 0.05
      ) {
        const totalSpan = Math.abs(startWeight - targetWeight);
        const covered =
          targetWeight < startWeight
            ? startWeight - currentWeight
            : currentWeight - startWeight;
        return Math.round(Math.max(0, Math.min(100, (covered / totalSpan) * 100)));
      }
      if (latestLoggedGoalPct != null) {
        return Math.round(Number(latestLoggedGoalPct));
      }
      if (activeGoal?.progress_percentage != null) {
        return Math.round(Number(activeGoal.progress_percentage));
      }
      return 0;
    }

    if (latestLoggedGoalPct != null) {
      return Math.round(Number(latestLoggedGoalPct));
    }
    if (activeGoal?.progress_percentage != null) {
      return Math.round(Number(activeGoal.progress_percentage));
    }
    return null;
  }, [
    targetWeight,
    currentWeight,
    oldestWeightLog,
    profile?.weight,
    activeLogs,
    activeGoal,
  ]);

  const bmiCategory = useMemo(() => getBmiCategory(currentBmi), [currentBmi]);
  const bodyFatCategory = useMemo(
    () => getBodyFatCategory(currentBodyFat),
    [currentBodyFat]
  );

  const goalBadgeLabel = useMemo(() => {
    if (activeGoal?.goal_name && activeGoal.goal_name.trim()) {
      return activeGoal.goal_name.trim();
    }
    if (profile?.fitness_goal && profile.fitness_goal.trim()) {
      return profile.fitness_goal.trim();
    }
    return "No Goal Set";
  }, [activeGoal?.goal_name, profile?.fitness_goal]);

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  // Build display logs list from real backend logs
  const combinedLogs = useMemo(() => {
    const todayDateString = new Date().toDateString();

    const list: DisplayLogItem[] = activeLogs.map((l) => {
      const d = new Date(l.logged_at);
      const validDate = !Number.isNaN(d.getTime());
      const isToday = validDate && todayDateString === d.toDateString();
      const dateStr = validDate
        ? d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : l.logged_at;
      const timeStr = validDate
        ? d.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })
        : "";

      const wNum =
        l.weight != null && Number(l.weight) > 0 ? Number(l.weight) : null;
      const bNum =
        l.bmi != null && Number(l.bmi) > 0
          ? Number(l.bmi)
          : computeBmiFromHeightWeight(wNum, heightCm);
      const bfNum =
        l.body_fat_percentage != null && Number(l.body_fat_percentage) > 0
          ? Number(l.body_fat_percentage)
          : null;
      const calNum =
        l.calories_burned != null && Number(l.calories_burned) >= 0
          ? Number(l.calories_burned)
          : null;
      const gpNum =
        l.goal_progress_percentage != null
          ? Number(l.goal_progress_percentage)
          : null;

      return {
        id: l.progress_uuid,
        timestamp: validDate ? d.getTime() : 0,
        dateStr,
        timeStr,
        isToday,
        weightNum: wNum,
        bmiNum: bNum,
        bodyFatNum: bfNum,
        caloriesNum: calNum,
        goalProgressNum: gpNum,
        weight: wNum != null ? `${wNum.toFixed(1)} kg` : "--",
        bmi: bNum != null ? bNum.toFixed(1) : "--",
        bodyFat: bfNum != null ? `${bfNum.toFixed(1)}%` : undefined,
        calories: calNum != null ? `${calNum} kcal` : undefined,
        note:
          l.notes && l.notes.trim()
            ? l.notes.trim().startsWith('"')
              ? l.notes.trim()
              : `"${l.notes.trim()}"`
            : undefined,
        noteColor:
          l.notes && l.notes.toLowerCase().includes("goal")
            ? "#E91E63"
            : "#F2F2F7",
        rawLog: l,
      };
    });

    const searched = list.filter((item) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        item.dateStr.toLowerCase().includes(q) ||
        item.weight.toLowerCase().includes(q) ||
        item.bmi.toLowerCase().includes(q) ||
        (item.bodyFat && item.bodyFat.toLowerCase().includes(q)) ||
        (item.calories && item.calories.toLowerCase().includes(q)) ||
        (item.note && item.note.toLowerCase().includes(q))
      );
    });

    return searched.sort((a, b) =>
      sortOrder === "newest"
        ? b.timestamp - a.timestamp
        : a.timestamp - b.timestamp
    );
  }, [activeLogs, heightCm, search, sortOrder]);

  // Dynamic Weight & BMI Trend Chart Points from Real Logs
  const chartData = useMemo(() => {
    const nowMs = Date.now();
    const rangeDays: Record<TimeRange, number> = {
      "1W": 7,
      "1M": 30,
      "6M": 180,
      "1Y": 365,
    };
    const cutoffMs = nowMs - rangeDays[timeRange] * 24 * 60 * 60 * 1000;

    // Filter weight logs within the selected time window
    const inRange = weightLogs.filter((l) => {
      const t = new Date(l.logged_at).getTime();
      return Number.isFinite(t) && t >= cutoffMs;
    });

    // Chronological order (oldest -> newest), up to 8 points for clean X-axis labels
    const chronological = [...inRange]
      .sort(
        (a, b) =>
          new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
      )
      .slice(-8);

    // Check if multiple logs share the same calendar day so labels can disambiguate with time
    const dateCounts: Record<string, number> = {};
    chronological.forEach((l) => {
      const d = new Date(l.logged_at);
      const key = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      dateCounts[key] = (dateCounts[key] || 0) + 1;
    });

    const rawPoints = chronological.map((l) => {
      const d = new Date(l.logged_at);
      const dayLabel = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const label =
        (dateCounts[dayLabel] || 0) > 1
          ? `${dayLabel} ${d.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}`
          : dayLabel;
      const w = Number(l.weight);
      const b =
        l.bmi != null && Number(l.bmi) > 0
          ? Number(l.bmi)
          : computeBmiFromHeightWeight(w, heightCm);
      return {
        id: l.progress_uuid,
        weight: w,
        bmi: b,
        label,
      };
    });

    if (rawPoints.length === 0) {
      return {
        points: [] as Array<{
          id: string;
          x: number;
          y: number;
          bmiY: number | null;
          weight: number;
          bmi: number | null;
          label: string;
        }>,
        linePath: "",
        areaPath: "",
        bmiLinePath: "",
        netChange: null as number | null,
      };
    }

    const weights = rawPoints.map((p) => p.weight);
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    const spanW = maxW - minW;

    const bmis = rawPoints
      .map((p) => p.bmi)
      .filter((b): b is number => b != null);
    const minB = bmis.length > 0 ? Math.min(...bmis) : 0;
    const maxB = bmis.length > 0 ? Math.max(...bmis) : 0;
    const spanB = maxB - minB;

    const xStart = 45;
    const xEnd = 455;
    const yTop = 38;
    const yBottom = 118;

    const points = rawPoints.map((p, idx) => {
      const x =
        rawPoints.length === 1
          ? 250
          : Math.round(
              xStart + (idx / (rawPoints.length - 1)) * (xEnd - xStart)
            );
      const y =
        spanW < 0.01
          ? 78
          : Math.round(
              yBottom - ((p.weight - minW) / spanW) * (yBottom - yTop)
            );
      const bmiY =
        p.bmi == null
          ? null
          : spanB < 0.01
            ? 88
            : Math.round(
                yBottom - ((p.bmi - minB) / spanB) * (yBottom - yTop)
              );
      return {
        ...p,
        x,
        y,
        bmiY,
      };
    });

    let linePath = "";
    let areaPath = "";
    if (points.length === 1) {
      const pt = points[0];
      linePath = `M ${xStart},${pt.y} L ${xEnd},${pt.y}`;
      areaPath = `M ${xStart},${pt.y} L ${xEnd},${pt.y} L ${xEnd},142 L ${xStart},142 Z`;
    } else {
      linePath = points
        .map((pt, idx) => `${idx === 0 ? "M" : "L"} ${pt.x},${pt.y}`)
        .join(" ");
      areaPath = `${linePath} L ${points[points.length - 1].x},142 L ${points[0].x},142 Z`;
    }

    const bmiPoints = points.filter(
      (pt): pt is typeof pt & { bmiY: number } => pt.bmiY != null
    );
    const bmiLinePath =
      bmiPoints.length >= 2
        ? bmiPoints
            .map((pt, idx) => `${idx === 0 ? "M" : "L"} ${pt.x},${pt.bmiY}`)
            .join(" ")
        : "";

    const netChange =
      points.length >= 2
        ? Number((points[points.length - 1].weight - points[0].weight).toFixed(1))
        : null;

    return {
      points,
      linePath,
      areaPath,
      bmiLinePath,
      netChange,
    };
  }, [weightLogs, timeRange, heightCm]);

  const showNotice = (text: string, tone: "success" | "error" = "success") => {
    setBannerNotice({ text, tone });
    setTimeout(() => setBannerNotice(null), 3500);
  };

  // Open target/height configuration modal prefilled with current real values
  const handleOpenTargetModal = () => {
    setGoalNameInput(
      activeGoal?.goal_name || profile?.fitness_goal || ""
    );
    setTargetWeightInput(
      targetWeight != null ? String(targetWeight) : ""
    );
    setHeightInput(heightCm != null ? String(heightCm) : "");
    setTargetModalOpen(true);
  };

  const handleSaveTargets = () => {
    const parsedTargetWeight = targetWeightInput.trim()
      ? Number(targetWeightInput.trim())
      : null;
    const parsedHeight = heightInput.trim()
      ? Number(heightInput.trim())
      : null;

    if (
      parsedTargetWeight != null &&
      (!Number.isFinite(parsedTargetWeight) ||
        parsedTargetWeight <= 0 ||
        parsedTargetWeight > 500)
    ) {
      showNotice("Enter a valid target weight between 1 and 500 kg.", "error");
      return;
    }
    if (
      parsedHeight != null &&
      (!Number.isFinite(parsedHeight) || parsedHeight < 50 || parsedHeight > 280)
    ) {
      showNotice("Enter a valid height between 50 and 280 cm.", "error");
      return;
    }

    if (parsedHeight != null && updateProfileMutation?.mutate) {
      updateProfileMutation.mutate(
        {
          height: parsedHeight,
          fitness_goal: goalNameInput.trim() || undefined,
        },
        {
          onSuccess: () => {
            void profileQuery?.refetch?.();
            void query?.refetch?.();
          },
        }
      );
    }

    if (parsedTargetWeight != null || goalNameInput.trim()) {
      const nextGoalName =
        goalNameInput.trim() || activeGoal?.goal_name || "Fitness goal";
      if (activeGoal?.goal_uuid && updateGoalMutation?.mutate) {
        updateGoalMutation.mutate(
          {
            goalUuid: activeGoal.goal_uuid,
            payload: {
              goal_name: nextGoalName,
              target_weight: parsedTargetWeight,
            },
          },
          {
            onSuccess: () => {
              void goalsQuery?.refetch?.();
            },
          }
        );
      } else if (createGoalMutation?.mutate) {
        createGoalMutation.mutate(
          {
            goal_name: nextGoalName,
            target_weight: parsedTargetWeight,
            calories_goal: null,
            progress_percentage: goalProgress ?? 0,
          },
          {
            onSuccess: () => {
              void goalsQuery?.refetch?.();
            },
          }
        );
      }
    }

    setTargetModalOpen(false);
    showNotice("Targets and profile metrics updated!");
  };

  // Handle Log Submission with 100% real member inputs
  const handleSaveLog = () => {
    const trimmedWeight = weight.trim();
    const parsedWeight = Number(trimmedWeight);
    if (
      !trimmedWeight ||
      !Number.isFinite(parsedWeight) ||
      parsedWeight <= 0 ||
      parsedWeight > 500
    ) {
      showNotice("Please enter a valid weight in kg (e.g. 65.5).", "error");
      return;
    }

    const trimmedBodyFat = bodyFat.trim();
    const parsedBodyFat = trimmedBodyFat ? Number(trimmedBodyFat) : null;
    if (
      parsedBodyFat != null &&
      (!Number.isFinite(parsedBodyFat) ||
        parsedBodyFat <= 0 ||
        parsedBodyFat >= 100)
    ) {
      showNotice("Please enter a valid body fat percentage (1 - 99%).", "error");
      return;
    }

    const trimmedCalories = activeCalories.trim();
    const parsedCalories = trimmedCalories
      ? parseInt(trimmedCalories, 10)
      : null;
    if (
      parsedCalories != null &&
      (!Number.isFinite(parsedCalories) ||
        parsedCalories < 0 ||
        parsedCalories > 100000)
    ) {
      showNotice("Please enter active calories between 0 and 100000 kcal.", "error");
      return;
    }

    const computedBmi = computeBmiFromHeightWeight(parsedWeight, heightCm);

    // Compute real goal progress percentage if targetWeight is set
    let computedGoalPct: number | null = null;
    if (targetWeight != null) {
      if (Math.abs(parsedWeight - targetWeight) < 0.05) {
        computedGoalPct = 100;
      } else {
        const startW =
          oldestWeightLog?.weight != null
            ? Number(oldestWeightLog.weight)
            : currentWeight ?? parsedWeight;
        const totalSpan = Math.abs(startW - targetWeight);
        if (totalSpan >= 0.05) {
          const covered =
            targetWeight < startW
              ? startW - parsedWeight
              : parsedWeight - startW;
          computedGoalPct = Math.round(
            Math.max(0, Math.min(100, (covered / totalSpan) * 100))
          );
        } else {
          computedGoalPct = 0;
        }
      }
    }

    createLogMutation?.mutate(
      {
        weight: parsedWeight,
        bmi: computedBmi,
        body_fat_percentage: parsedBodyFat,
        calories_burned: parsedCalories,
        goal_progress_percentage: computedGoalPct,
        notes: notes.trim() || null,
        measurements: heightCm != null ? { height_cm: heightCm } : {},
      },
      {
        onSuccess: () => {
          setWeight("");
          setBodyFat("");
          setActiveCalories("");
          setNotes("");
          showNotice("Progress log saved successfully!");
          void query?.refetch?.();
          void profileQuery?.refetch?.();
          void goalsQuery?.refetch?.();
          if (
            computedGoalPct != null &&
            activeGoal?.goal_uuid &&
            updateGoalMutation?.mutate
          ) {
            updateGoalMutation.mutate({
              goalUuid: activeGoal.goal_uuid,
              payload: { progress_percentage: computedGoalPct },
            });
          }
        },
        onError: () => {
          showNotice("Could not save progress log. Please try again.", "error");
        },
      }
    );
  };

  const handleDeleteLog = (id: string) => {
    setDeletedIds((prev) => ({ ...prev, [id]: true }));
    deleteLogMutation?.mutate(id, {
      onSuccess: () => {
        void query?.refetch?.();
        void profileQuery?.refetch?.();
      },
    });
  };

  const rangePeriodLabel: Record<TimeRange, string> = {
    "1W": "past 7 days",
    "1M": "past 30 days",
    "6M": "past 6 months",
    "1Y": "past year",
  };

  return (
    <Screen
      scroll
      maxWidth="none"
      style={styles.screenContainer}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={Boolean(query?.isRefetching)}
          onRefresh={() => {
            void query?.refetch?.();
            void profileQuery?.refetch?.();
            void goalsQuery?.refetch?.();
          }}
          tintColor="#E91E63"
        />
      }
    >
      {/* =================================================================== */}
      {/* 1. TOP HEADER BAR                                                   */}
      {/* =================================================================== */}
      <View style={[styles.headerRow, isNarrow && styles.headerRowNarrow]}>
        <View style={styles.headerLeft}>
          <View style={styles.headerTitleGroup}>
            <Ionicons
              name="pulse-outline"
              size={22}
              color="#E91E63"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.headerTitle}>Progress & Body Metrics</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Logs, health indicators, and goal charts
          </Text>
        </View>

        <View style={[styles.headerRight, isNarrow && styles.headerRightNarrow]}>
          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons
              name="search-outline"
              size={15}
              color="#F2F2F7"
              style={{ marginRight: 8 }}
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search logs & notes..."
              placeholderTextColor="#F2F2F7"
              style={styles.searchInput}
            />
          </View>

          {/* Edit Targets / Height Pill */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Set Targets & Height"
            onPress={handleOpenTargetModal}
            style={({ pressed }) => [
              styles.datePill,
              pressed && styles.btnPressed,
            ]}
          >
            <Ionicons
              name="options-outline"
              size={15}
              color="#E91E63"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.dateText}>Targets & Height</Text>
          </Pressable>

          {/* Real Current Date Pill */}
          <View style={styles.datePill}>
            <Ionicons
              name="calendar-outline"
              size={15}
              color="#E91E63"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.dateText}>{todayFormatted}</Text>
          </View>

          {/* User Avatar Circle */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Member Profile"
            onPress={() => navigation.navigate("MemberProfileHome")}
            style={({ pressed }) => [
              styles.avatarCircle,
              pressed && styles.btnPressed,
            ]}
          >
            <Text style={styles.avatarText}>
              {(
                profile?.member_name?.[0] ||
                user?.full_name?.[0] ||
                user?.email?.[0] ||
                "M"
              ).toUpperCase()}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Optional Success/Validation Banner */}
      {bannerNotice ? (
        <View
          style={[
            styles.noticeBanner,
            bannerNotice.tone === "error" && styles.noticeBannerError,
          ]}
        >
          <Ionicons
            name={
              bannerNotice.tone === "error"
                ? "alert-circle-outline"
                : "checkmark-circle-outline"
            }
            size={18}
            color={bannerNotice.tone === "error" ? "#E91E63" : "#34C759"}
            style={{ marginRight: 8 }}
          />
          <Text
            style={[
              styles.noticeText,
              bannerNotice.tone === "error" && styles.noticeTextError,
            ]}
          >
            {bannerNotice.text}
          </Text>
        </View>
      ) : null}

      {/* =================================================================== */}
      {/* 2. TOP 4 METRIC CARDS ROW (100% REAL MEMBER DATA)                   */}
      {/* =================================================================== */}
      <View style={[styles.metricsRow, isNarrow && styles.metricsRowNarrow]}>
        {/* Card 1: WEIGHT */}
        <View style={[styles.metricCard, isNarrow && styles.metricCardNarrow]}>
          <View style={styles.metricCardHeader}>
            <View
              style={[
                styles.squircleBadge,
                {
                  backgroundColor: "rgba(233, 30, 99, 0.15)",
                  borderColor: "rgba(233, 30, 99, 0.3)",
                },
              ]}
            >
              <Ionicons name="barbell-outline" size={17} color="#E91E63" />
            </View>
            <View
              style={[
                styles.metricPillBadge,
                {
                  backgroundColor:
                    currentWeight != null
                      ? "rgba(233, 30, 99, 0.12)"
                      : "rgba(255, 255, 255, 0.14)",
                },
              ]}
            >
              <Text
                style={[
                  styles.metricPillBadgeText,
                  { color: currentWeight != null ? "#E91E63" : "#F2F2F7" },
                ]}
              >
                {latestWeightLog
                  ? "Latest Log"
                  : currentWeight != null
                    ? "Profile"
                    : "No Logs"}
              </Text>
            </View>
          </View>

          <View style={styles.metricCardBody}>
            <Text style={styles.metricLabel}>WEIGHT</Text>
            <View style={styles.metricValueLine}>
              <Text style={styles.metricBigNumber}>
                {currentWeight != null ? currentWeight.toFixed(1) : "--"}
              </Text>
              <Text style={styles.metricUnitText}> kg</Text>
            </View>
          </View>

          <View style={styles.metricFooterRow}>
            <Pressable onPress={handleOpenTargetModal}>
              <Text style={styles.metricSubTarget}>
                {targetWeight != null
                  ? `Target: ${
                      Number.isInteger(targetWeight)
                        ? targetWeight
                        : targetWeight.toFixed(1)
                    } kg`
                  : "Target: Set target →"}
              </Text>
            </Pressable>
            {weightTrendDiff ? (
              <View
                style={[
                  styles.greenTrendPill,
                  !weightTrendDiff.positive && styles.amberTrendPill,
                ]}
              >
                <Text
                  style={[
                    styles.greenTrendText,
                    !weightTrendDiff.positive && styles.amberTrendText,
                  ]}
                >
                  {weightTrendDiff.text}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Card 2: BODY MASS INDEX */}
        <View style={[styles.metricCard, isNarrow && styles.metricCardNarrow]}>
          <View style={styles.metricCardHeader}>
            <View
              style={[
                styles.squircleBadge,
                {
                  backgroundColor: "rgba(52, 199, 89, 0.15)",
                  borderColor: "rgba(52, 199, 89, 0.3)",
                },
              ]}
            >
              <Ionicons name="heart-outline" size={17} color="#34C759" />
            </View>
            <View
              style={[
                styles.metricPillBadge,
                { backgroundColor: bmiCategory.bg },
              ]}
            >
              <Text
                style={[
                  styles.metricPillBadgeText,
                  { color: bmiCategory.color },
                ]}
              >
                {bmiCategory.label}
              </Text>
            </View>
          </View>

          <View style={styles.metricCardBody}>
            <Text style={styles.metricLabel}>BODY MASS INDEX</Text>
            <View style={styles.metricValueLine}>
              <Text style={styles.metricBigNumber}>
                {currentBmi != null ? currentBmi.toFixed(1) : "--"}
              </Text>
            </View>
          </View>

          <View style={styles.metricFooterRow}>
            {currentBmi == null && heightCm == null ? (
              <Pressable onPress={handleOpenTargetModal}>
                <Text style={[styles.metricSubTarget, { color: "#007AFF" }]}>
                  Set height to calculate BMI →
                </Text>
              </Pressable>
            ) : (
              <Text style={styles.metricSubTarget}>
                Healthy range: 18.5 - 24.9
              </Text>
            )}
          </View>
        </View>

        {/* Card 3: GOAL PROGRESS */}
        <View style={[styles.metricCard, isNarrow && styles.metricCardNarrow]}>
          <View style={styles.metricCardHeader}>
            <View
              style={[
                styles.squircleBadge,
                {
                  backgroundColor: "rgba(233, 30, 99, 0.15)",
                  borderColor: "rgba(233, 30, 99, 0.3)",
                },
              ]}
            >
              <Ionicons name="disc-outline" size={17} color="#E91E63" />
            </View>
            <Pressable
              onPress={handleOpenTargetModal}
              style={[
                styles.metricPillBadge,
                { backgroundColor: "rgba(233, 30, 99, 0.12)" },
              ]}
            >
              <Text style={[styles.metricPillBadgeText, { color: "#E91E63" }]}>
                {goalBadgeLabel}
              </Text>
            </Pressable>
          </View>

          <View style={styles.metricCardBody}>
            <Text style={styles.metricLabel}>GOAL PROGRESS</Text>
            <View style={styles.metricValueLine}>
              <Text style={styles.metricBigNumber}>
                {goalProgress != null ? `${goalProgress}%` : "--"}
              </Text>
            </View>
          </View>

          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(100, Math.max(0, goalProgress ?? 0))}%`,
                  backgroundColor: "#E91E63",
                },
              ]}
            />
          </View>
        </View>

        {/* Card 4: BODY FAT % */}
        <View style={[styles.metricCard, isNarrow && styles.metricCardNarrow]}>
          <View style={styles.metricCardHeader}>
            <View
              style={[
                styles.squircleBadge,
                {
                  backgroundColor: "rgba(0, 122, 255, 0.15)",
                  borderColor: "rgba(0, 122, 255, 0.3)",
                },
              ]}
            >
              <Text style={styles.percentBadgeIcon}>%</Text>
            </View>
            <View
              style={[
                styles.metricPillBadge,
                { backgroundColor: bodyFatCategory.bg },
              ]}
            >
              <Text
                style={[
                  styles.metricPillBadgeText,
                  { color: bodyFatCategory.color },
                ]}
              >
                {bodyFatCategory.label}
              </Text>
            </View>
          </View>

          <View style={styles.metricCardBody}>
            <Text style={styles.metricLabel}>BODY FAT %</Text>
            <View style={styles.metricValueLine}>
              <Text style={styles.metricBigNumber}>
                {currentBodyFat != null ? currentBodyFat.toFixed(1) : "--"}
              </Text>
              <Text style={styles.metricUnitText}> %</Text>
            </View>
          </View>

          <View style={styles.metricFooterRow}>
            <Text style={styles.metricSubTarget}>
              {targetBodyFat != null
                ? `Target: ${targetBodyFat.toFixed(1)}%`
                : prevBodyFatLog?.body_fat_percentage != null &&
                    currentBodyFat != null
                  ? `Prev: ${Number(prevBodyFatLog.body_fat_percentage).toFixed(1)}%`
                  : currentBodyFat != null
                    ? "Latest logged reading"
                    : "Log body fat % below"}
            </Text>
          </View>
        </View>
      </View>

      {/* =================================================================== */}
      {/* 3. ROW 3: LOG PROGRESS (FORM) + WEIGHT TREND CHART                 */}
      {/* =================================================================== */}
      <View style={[styles.middleRow, isNarrow && styles.middleRowNarrow]}>
        {/* Left Card: Log Progress Form */}
        <View style={styles.logFormCard}>
          <View style={styles.cardHeaderRow}>
            <View
              style={[
                styles.squircleIconBox,
                { backgroundColor: "rgba(233, 30, 99, 0.15)" },
              ]}
            >
              <Ionicons name="pencil" size={16} color="#E91E63" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Log Progress</Text>
              <Text style={styles.cardSubtitle}>
                Record today's metrics & fitness notes
              </Text>
            </View>
          </View>

          {/* Field: Active Calories */}
          <View style={styles.fieldBlock}>
            <View style={styles.fieldLabelRow}>
              <Ionicons
                name="flame"
                size={14}
                color="#E91E63"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.fieldLabelText}>
                Active Calories Burned (kcal)
              </Text>
            </View>
            <TextInput
              value={activeCalories}
              onChangeText={setActiveCalories}
              placeholder="Enter calories burned (optional)"
              placeholderTextColor="#F2F2F7"
              keyboardType="numeric"
              style={styles.fieldInput}
            />
          </View>

          {/* 2 Column Row: Weight & Body Fat */}
          <View style={styles.twoColRow}>
            <View style={[styles.fieldBlock, { flex: 1 }]}>
              <View style={styles.fieldLabelRow}>
                <Ionicons
                  name="barbell-outline"
                  size={14}
                  color="#E91E63"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.fieldLabelText}>Weight (kg) *</Text>
              </View>
              <TextInput
                value={weight}
                onChangeText={setWeight}
                placeholder={
                  currentWeight != null
                    ? `Current: ${currentWeight.toFixed(1)}`
                    : "Enter weight (kg)"
                }
                placeholderTextColor="#F2F2F7"
                keyboardType="numeric"
                style={styles.fieldInput}
              />
            </View>

            <View style={[styles.fieldBlock, { flex: 1 }]}>
              <View style={styles.fieldLabelRow}>
                <Ionicons
                  name="pie-chart-outline"
                  size={14}
                  color="#007AFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.fieldLabelText}>% Body Fat (%)</Text>
              </View>
              <TextInput
                value={bodyFat}
                onChangeText={setBodyFat}
                placeholder={
                  currentBodyFat != null
                    ? `Current: ${currentBodyFat.toFixed(1)}`
                    : "Optional (%)"
                }
                placeholderTextColor="#F2F2F7"
                keyboardType="numeric"
                style={styles.fieldInput}
              />
            </View>
          </View>

          {/* Field: Daily Notes / Goals */}
          <View style={styles.fieldBlock}>
            <View style={styles.fieldLabelRow}>
              <Ionicons
                name="journal-outline"
                size={14}
                color="#007AFF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.fieldLabelText}>Daily Notes / Goals</Text>
            </View>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Felt strong today, stuck to calorie targets..."
              placeholderTextColor="#F2F2F7"
              multiline
              numberOfLines={3}
              style={[styles.fieldInput, styles.notesTextarea]}
            />
          </View>

          {/* Submit Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Save Progress Log"
            disabled={Boolean(createLogMutation?.isPending)}
            onPress={handleSaveLog}
            style={({ pressed }) => [
              styles.saveLogBtn,
              (pressed || createLogMutation?.isPending) && styles.btnPressed,
            ]}
          >
            <Ionicons
              name="save-outline"
              size={17}
              color="#FFFFFF"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.saveLogBtnText}>
              {createLogMutation?.isPending
                ? "Saving..."
                : "Save Progress Log"}
            </Text>
          </Pressable>
        </View>

        {/* Right Card: Weight Trend Chart (100% Real Logged Data) */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeaderRow}>
            <View style={styles.cardHeaderRow}>
              <View
                style={[
                  styles.squircleIconBox,
                  { backgroundColor: "rgba(0, 122, 255, 0.15)" },
                ]}
              >
                <Ionicons
                  name="trending-up-outline"
                  size={17}
                  color="#007AFF"
                />
              </View>
              <View>
                <Text style={styles.cardTitle}>Weight Trend Chart</Text>
                <Text style={styles.cardSubtitle}>
                  Historical weight and calculated BMI curve
                </Text>
              </View>
            </View>

            {/* Time Filter Pills */}
            <View style={styles.timeFilterPills}>
              {(["1W", "1M", "6M", "1Y"] as TimeRange[]).map((t) => {
                const active = timeRange === t;
                return (
                  <Pressable
                    key={t}
                    onPress={() => setTimeRange(t)}
                    style={[
                      styles.timeFilterBtn,
                      active && styles.timeFilterBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.timeFilterText,
                        active && styles.timeFilterTextActive,
                      ]}
                    >
                      {t}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Real SVG Line Chart */}
          <View style={styles.svgChartContainer}>
            {chartData.points.length === 0 ? (
              <View style={styles.emptyChartBox}>
                <Ionicons
                  name="analytics-outline"
                  size={28}
                  color="#F2F2F7"
                  style={{ marginBottom: 8 }}
                />
                <Text style={styles.emptyChartTitle}>
                  No weight logs in the {rangePeriodLabel[timeRange]}
                </Text>
                <Text style={styles.emptyChartSub}>
                  Log your weight on the left to plot your real weight and BMI
                  trend curve.
                </Text>
              </View>
            ) : (
              <>
                <Svg
                  width="100%"
                  height={170}
                  viewBox="0 0 500 170"
                  preserveAspectRatio="none"
                >
                  <Defs>
                    <SvgGradient
                      id="chartRedGlow"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <Stop
                        offset="0%"
                        stopColor="#E91E63"
                        stopOpacity={0.4}
                      />
                      <Stop
                        offset="100%"
                        stopColor="#E91E63"
                        stopOpacity={0.0}
                      />
                    </SvgGradient>
                  </Defs>

                  {/* Subtle Horizontal Grid Guides */}
                  <Path
                    d="M 20,38 L 480,38 M 20,78 L 480,78 M 20,118 L 480,118"
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeDasharray="4 4"
                    strokeWidth={1}
                  />

                  {/* Filled Glow Gradient Area */}
                  <Path d={chartData.areaPath} fill="url(#chartRedGlow)" />

                  {/* Optional Calculated BMI Curve */}
                  {chartData.bmiLinePath ? (
                    <Path
                      d={chartData.bmiLinePath}
                      fill="none"
                      stroke="#007AFF"
                      strokeWidth={2}
                      strokeDasharray="5 4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : null}

                  {/* Red Glowing Weight Path Line */}
                  <Path
                    d={chartData.linePath}
                    fill="none"
                    stroke="#E91E63"
                    strokeWidth={3.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Real Data Nodes & Weight Labels */}
                  {chartData.points.map((pt) => (
                    <React.Fragment key={pt.id}>
                      <Circle
                        cx={pt.x}
                        cy={pt.y}
                        r={6}
                        fill="#E91E63"
                        stroke="#FFFFFF"
                        strokeWidth={2}
                      />
                      <Circle cx={pt.x} cy={pt.y} r={2.5} fill="#FFFFFF" />
                      <SvgText
                        x={pt.x}
                        y={Math.max(16, pt.y - 12)}
                        fill="#FFFFFF"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {`${pt.weight.toFixed(1)}kg`}
                      </SvgText>
                    </React.Fragment>
                  ))}
                </Svg>

                {/* Real X-Axis Date Labels */}
                <View
                  style={[
                    styles.chartXLabelsRow,
                    chartData.points.length === 1 && {
                      justifyContent: "center",
                    },
                  ]}
                >
                  {chartData.points.map((pt) => (
                    <Text key={pt.id} style={styles.chartXLabel}>
                      {pt.label}
                    </Text>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* Chart Footer Row */}
          <View style={styles.chartFooterRow}>
            {chartData.netChange != null ? (
              <Text style={styles.chartFooterText}>
                Total Change:{" "}
                <Text style={styles.greenHighlight}>
                  {chartData.netChange > 0 ? "+" : ""}
                  {chartData.netChange.toFixed(1)} kg
                </Text>{" "}
                ({rangePeriodLabel[timeRange]})
              </Text>
            ) : chartData.points.length === 1 ? (
              <Text style={styles.chartFooterText}>
                Latest logged:{" "}
                <Text style={styles.greenHighlight}>
                  {chartData.points[0].weight.toFixed(1)} kg
                </Text>
                {chartData.points[0].bmi != null
                  ? ` • BMI ${chartData.points[0].bmi.toFixed(1)}`
                  : ""}
              </Text>
            ) : (
              <Text style={styles.chartFooterText}>
                Total Change: <Text style={styles.metricBold}>--</Text>
              </Text>
            )}
            <View style={styles.autoSyncRow}>
              <Ionicons
                name="sync-outline"
                size={14}
                color="#007AFF"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.autoSyncText}>
                { `${activeLogs.length} log${activeLogs.length === 1 ? "" : "s"} synced` }
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* =================================================================== */}
      {/* 4. ROW 4: LOG HISTORY FEED                                          */}
      {/* =================================================================== */}
      <View style={styles.historyFeedCard}>
        <View style={styles.historyHeaderRow}>
          <View style={styles.cardHeaderRow}>
            <View
              style={[
                styles.squircleIconBox,
                { backgroundColor: "rgba(0, 122, 255, 0.15)" },
              ]}
            >
              <Ionicons name="time-outline" size={17} color="#007AFF" />
            </View>
            <View>
              <Text style={styles.cardTitle}>Log History Feed</Text>
              <Text style={styles.cardSubtitle}>
                Previous weight, BMI logs, and custom notes
              </Text>
            </View>
          </View>

          {/* Sort Dropdown Pill */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sort Logs"
            onPress={() =>
              setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))
            }
            style={({ pressed }) => [
              styles.sortPill,
              pressed && styles.btnPressed,
            ]}
          >
            <Text style={styles.sortPillText}>
              Sort:{" "}
              <Text style={{ fontWeight: "600", color: "#FFFFFF" }}>
                {sortOrder === "newest" ? "Newest First" : "Oldest First"}
              </Text>
            </Text>
            <Ionicons
              name="chevron-down"
              size={13}
              color="#F2F2F7"
              style={{ marginLeft: 6 }}
            />
          </Pressable>
        </View>

        {/* Feed List Items */}
        <View style={styles.feedList}>
          {combinedLogs.length === 0 ? (
            <View style={styles.emptyFeedBox}>
              <Text style={styles.emptyFeedText}>
                No progress logs recorded yet. Use the form above to log your
                first entry.
              </Text>
            </View>
          ) : (
            combinedLogs.map((item) => (
              <View key={item.id} style={styles.feedItemCard}>
                <View style={styles.feedItemLeft}>
                  {/* Icon */}
                  <View
                    style={[
                      styles.feedIconBox,
                      {
                        backgroundColor: item.isToday
                          ? "rgba(233, 30, 99, 0.15)"
                          : "#1C1C1E",
                      },
                    ]}
                  >
                    <Ionicons
                      name={item.isToday ? "pulse" : "calendar-outline"}
                      size={16}
                      color={item.isToday ? "#E91E63" : "#F2F2F7"}
                    />
                  </View>

                  {/* Copy Details */}
                  <View style={styles.feedDetailsCol}>
                    <View style={styles.feedDateLine}>
                      <Text style={styles.feedDateText}>
                        {item.dateStr}
                        {item.timeStr ? ` • ${item.timeStr}` : ""}
                      </Text>
                      {item.isToday ? (
                        <View style={styles.todayPill}>
                          <Text style={styles.todayPillText}>Today</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Metric Values */}
                    <Text style={styles.feedMetricsLine}>
                      Weight:{" "}
                      <Text style={styles.metricBold}>{item.weight}</Text>
                      {"   •   "}
                      BMI: <Text style={styles.metricBold}>{item.bmi}</Text>
                      {item.bodyFat ? (
                        <>
                          {"   •   "}
                          Body Fat:{" "}
                          <Text style={styles.metricBold}>{item.bodyFat}</Text>
                        </>
                      ) : null}
                      {item.calories ? (
                        <>
                          {"   •   "}
                          Burned:{" "}
                          <Text style={styles.metricBold}>{item.calories}</Text>
                        </>
                      ) : null}
                    </Text>

                    {/* Optional Note */}
                    {item.note ? (
                      <Text
                        style={[
                          styles.feedNoteText,
                          { color: item.noteColor || "#F2F2F7" },
                        ]}
                      >
                        {item.note}
                      </Text>
                    ) : null}
                  </View>
                </View>

                {/* Right Actions: Details Button + Trash Icon */}
                <View style={styles.feedItemRight}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="View Details"
                    onPress={() => setSelectedLog(item)}
                    style={({ pressed }) => [
                      styles.detailsPillBtn,
                      pressed && styles.btnPressed,
                    ]}
                  >
                    <Text style={styles.detailsPillText}>Details</Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Delete Log"
                    onPress={() => handleDeleteLog(item.id)}
                    style={({ pressed }) => [
                      styles.trashIconBtn,
                      pressed && styles.btnPressed,
                    ]}
                  >
                    <Ionicons name="trash-outline" size={17} color="#F2F2F7" />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Details Modal */}
      <Modal
        visible={!!selectedLog}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedLog(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Measurement Details</Text>
              <Pressable onPress={() => setSelectedLog(null)}>
                <Ionicons name="close" size={20} color="#F2F2F7" />
              </Pressable>
            </View>

            {selectedLog ? (
              <View style={styles.modalBody}>
                <Text style={styles.modalDate}>
                  {selectedLog.dateStr}
                  {selectedLog.timeStr ? ` • ${selectedLog.timeStr}` : ""}
                </Text>

                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Weight:</Text>
                  <Text style={styles.modalValue}>{selectedLog.weight}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>BMI:</Text>
                  <Text style={styles.modalValue}>{selectedLog.bmi}</Text>
                </View>
                {selectedLog.bodyFat ? (
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Body Fat:</Text>
                    <Text style={styles.modalValue}>{selectedLog.bodyFat}</Text>
                  </View>
                ) : null}
                {selectedLog.calories ? (
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Active Calories:</Text>
                    <Text style={styles.modalValue}>
                      {selectedLog.calories}
                    </Text>
                  </View>
                ) : null}
                {selectedLog.goalProgressNum != null ? (
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Goal Progress:</Text>
                    <Text style={styles.modalValue}>
                      {Math.round(selectedLog.goalProgressNum)}%
                    </Text>
                  </View>
                ) : null}
                {selectedLog.note ? (
                  <View style={styles.modalNoteBox}>
                    <Text style={styles.modalLabel}>Notes:</Text>
                    <Text style={styles.modalNote}>{selectedLog.note}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            <Pressable
              onPress={() => setSelectedLog(null)}
              style={styles.modalCloseBtn}
            >
              <Text style={styles.modalCloseText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Targets & Height Modal */}
      <Modal
        visible={targetModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setTargetModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Body Targets & Height</Text>
              <Pressable onPress={() => setTargetModalOpen(false)}>
                <Ionicons name="close" size={20} color="#F2F2F7" />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabelText}>Goal Name</Text>
                <TextInput
                  value={goalNameInput}
                  onChangeText={setGoalNameInput}
                  placeholder="e.g. Lean Muscle / Weight Loss"
                  placeholderTextColor="#F2F2F7"
                  style={styles.fieldInput}
                />
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabelText}>Target Weight (kg)</Text>
                <TextInput
                  value={targetWeightInput}
                  onChangeText={setTargetWeightInput}
                  placeholder="e.g. 58"
                  placeholderTextColor="#F2F2F7"
                  keyboardType="numeric"
                  style={styles.fieldInput}
                />
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabelText}>
                  Height (cm) — used to calculate BMI
                </Text>
                <TextInput
                  value={heightInput}
                  onChangeText={setHeightInput}
                  placeholder="e.g. 165"
                  placeholderTextColor="#F2F2F7"
                  keyboardType="numeric"
                  style={styles.fieldInput}
                />
              </View>
            </View>

            <Pressable
              onPress={handleSaveTargets}
              style={styles.modalCloseBtn}
            >
              <Text style={styles.modalCloseText}>Save Targets</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

// --------------------------------------------------------------------------
// STYLESHEET (Cyberpunk Dark Glassmorphic Apple Fitness Theme)
// --------------------------------------------------------------------------
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 48,
  },

  // 1. Header Bar
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 16,
  },
  headerRowNarrow: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#F2F2F7",
    marginTop: 4,
    fontWeight: "400",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerRightNarrow: {
    flexWrap: "wrap",
  },
  searchBar: {
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 190,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    color: "#FFFFFF",
    fontSize: 13,
    padding: 0,
  },
  datePill: {
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E91E63",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  noticeBanner: {
    backgroundColor: "rgba(52, 199, 89, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(52, 199, 89, 0.3)",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  noticeBannerError: {
    backgroundColor: "rgba(233, 30, 99, 0.12)",
    borderColor: "rgba(233, 30, 99, 0.3)",
  },
  noticeText: {
    color: "#34C759",
    fontSize: 13,
    fontWeight: "600",
  },
  noticeTextError: {
    color: "#E91E63",
  },

  // 2. 4 Metric Cards
  metricsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  metricsRowNarrow: {
    flexWrap: "wrap",
  },
  metricCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 18,
    justifyContent: "space-between",
  },
  metricCardNarrow: {
    flexBasis: "47%",
  },
  metricCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  squircleBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  percentBadgeIcon: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "800",
  },
  metricPillBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  metricPillBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  metricCardBody: {
    marginTop: 14,
    marginBottom: 10,
  },
  metricLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: "#F2F2F7",
  },
  metricValueLine: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 6,
  },
  metricBigNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    fontVariant: ["tabular-nums"],
  },
  metricUnitText: {
    fontSize: 13,
    color: "#F2F2F7",
    fontWeight: "500",
  },
  metricFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metricSubTarget: {
    fontSize: 12,
    color: "#F2F2F7",
  },
  greenTrendPill: {
    backgroundColor: "rgba(52, 199, 89, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  amberTrendPill: {
    backgroundColor: "rgba(233, 30, 99, 0.14)",
  },
  greenTrendText: {
    color: "#34C759",
    fontSize: 11,
    fontWeight: "700",
  },
  amberTrendText: {
    color: "#E91E63",
  },
  progressBarTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: "#1C1C1E",
    overflow: "hidden",
    marginTop: 6,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },

  // 3. Middle Row: Log Progress (Form) + Weight Trend Chart
  middleRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  middleRowNarrow: {
    flexDirection: "column",
  },
  logFormCard: {
    flex: 0.88,
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 20,
    gap: 14,
  },
  chartCard: {
    flex: 1.12,
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 20,
    justifyContent: "space-between",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  squircleIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 12.5,
    color: "#F2F2F7",
    marginTop: 2,
  },

  // Form Fields
  fieldBlock: {
    gap: 6,
  },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  fieldLabelText: {
    fontSize: 12.5,
    fontWeight: "500",
    color: "#F2F2F7",
  },
  twoColRow: {
    flexDirection: "row",
    gap: 12,
  },
  fieldInput: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#FFFFFF",
    fontSize: 13.5,
  },
  notesTextarea: {
    height: 64,
    textAlignVertical: "top",
  },
  saveLogBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E91E63",
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 4,
  },
  saveLogBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  // Chart specifics
  chartHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  timeFilterPills: {
    flexDirection: "row",
    backgroundColor: "#1C1C1E",
    borderRadius: 10,
    padding: 3,
  },
  timeFilterBtn: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeFilterBtnActive: {
    backgroundColor: "#1C1C1E",
  },
  timeFilterText: {
    color: "#F2F2F7",
    fontSize: 11.5,
    fontWeight: "600",
  },
  timeFilterTextActive: {
    color: "#FFFFFF",
  },
  svgChartContainer: {
    width: "100%",
    minHeight: 195,
    justifyContent: "center",
    marginVertical: 4,
  },
  emptyChartBox: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyChartTitle: {
    color: "#F2F2F7",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyChartSub: {
    color: "#F2F2F7",
    fontSize: 12.5,
    textAlign: "center",
    marginTop: 4,
    maxWidth: 320,
  },
  chartXLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginTop: 4,
  },
  chartXLabel: {
    color: "#F2F2F7",
    fontSize: 11.5,
    fontWeight: "500",
  },
  chartFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  chartFooterText: {
    color: "#F2F2F7",
    fontSize: 12.5,
  },
  greenHighlight: {
    color: "#34C759",
    fontWeight: "700",
  },
  autoSyncRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  autoSyncText: {
    color: "#007AFF",
    fontSize: 12,
    fontWeight: "500",
  },

  // 4. Log History Feed
  historyFeedCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 20,
  },
  historyHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sortPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sortPillText: {
    color: "#F2F2F7",
    fontSize: 12,
  },
  feedList: {
    gap: 12,
  },
  feedItemCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  feedItemLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    flex: 1,
  },
  feedIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  feedDetailsCol: {
    flex: 1,
    gap: 3,
  },
  feedDateLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  feedDateText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  todayPill: {
    backgroundColor: "rgba(52, 199, 89, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  todayPillText: {
    color: "#34C759",
    fontSize: 10.5,
    fontWeight: "700",
  },
  feedMetricsLine: {
    fontSize: 12.5,
    color: "#F2F2F7",
  },
  metricBold: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  feedNoteText: {
    fontSize: 12.5,
    marginTop: 2,
    fontStyle: "italic",
  },
  feedItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailsPillBtn: {
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
  },
  detailsPillText: {
    color: "#F2F2F7",
    fontSize: 12,
    fontWeight: "600",
  },
  trashIconBtn: {
    padding: 6,
  },
  emptyFeedBox: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyFeedText: {
    color: "#F2F2F7",
    fontSize: 13,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  modalBody: {
    gap: 12,
    marginBottom: 20,
  },
  modalDate: {
    fontSize: 15,
    fontWeight: "700",
    color: "#E91E63",
    marginBottom: 4,
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
    paddingBottom: 8,
  },
  modalLabel: {
    fontSize: 13,
    color: "#F2F2F7",
  },
  modalValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  modalNoteBox: {
    marginTop: 4,
    gap: 4,
  },
  modalNote: {
    fontSize: 13,
    color: "#F2F2F7",
    fontStyle: "italic",
  },
  modalCloseBtn: {
    backgroundColor: "#E91E63",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  modalCloseText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  btnPressed: {
    opacity: 0.82,
  },
});
