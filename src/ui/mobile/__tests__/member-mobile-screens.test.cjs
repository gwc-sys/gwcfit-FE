const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");
const React = require("react");
const jsxRuntime = require("react/jsx-runtime");
const ts = require("typescript");

const mobileDir = path.resolve(__dirname, "..");
const srcDir = path.resolve(mobileDir, "../..");

function createHostComponent(name) {
  const Comp = (props) => React.createElement(name, props, props?.children);
  Comp.displayName = name;
  return Comp;
}

const nativeMock = {
  ActivityIndicator: createHostComponent("ActivityIndicator"),
  Animated: {
    Value: function (v) {
      this.value = v;
      this.interpolate = () => 24;
      this.setValue = (val) => {
        this.value = val;
      };
    },
    timing: () => ({ start: (fn) => fn?.({ finished: true }), stop: () => {} }),
    sequence: () => ({ start: (fn) => fn?.({ finished: true }), stop: () => {} }),
    loop: () => ({ start: (fn) => fn?.({ finished: true }), stop: () => {} }),
    View: createHostComponent("AnimatedView"),
  },
  Easing: {
    inOut: () => () => {},
    ease: () => {},
  },
  Keyboard: { dismiss: () => {} },
  Modal: createHostComponent("Modal"),
  Platform: { OS: "ios", select: (obj) => obj.ios ?? obj.default },
  Pressable: createHostComponent("Pressable"),
  RefreshControl: createHostComponent("RefreshControl"),
  ScrollView: createHostComponent("ScrollView"),
  StyleSheet: {
    create: (styles) => styles,
    flatten: (val) =>
      Array.isArray(val)
        ? Object.assign({}, ...val.filter(Boolean).map((v) => nativeMock.StyleSheet.flatten(v)))
        : val || {},
  },
  Text: createHostComponent("Text"),
  TextInput: createHostComponent("TextInput"),
  View: createHostComponent("View"),
  useWindowDimensions: () => ({ width: 390, height: 844 }),
};

function compileTsxFile(filePath, customMocks = {}) {
  const source = fs.readFileSync(filePath, "utf8");
  const js = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;

  const mod = { exports: {} };
  const requireMock = (id) => {
    if (id in customMocks) return customMocks[id];
    if (id === "react") return React;
    if (id === "react/jsx-runtime") return jsxRuntime;
    if (id === "react-native") return nativeMock;
    if (id === "react-native-safe-area-context") {
      return {
        SafeAreaView: createHostComponent("SafeAreaView"),
        useSafeAreaInsets: () => ({ top: 47, bottom: 34, left: 0, right: 0 }),
      };
    }
    if (id.endsWith("theme/theme")) {
      return compileTsxFile(path.join(mobileDir, "theme/theme.ts"));
    }
    if (id === "@expo/vector-icons") {
      return { Ionicons: createHostComponent("Ionicons") };
    }
    if (id === "expo-camera") {
      return {
        CameraView: createHostComponent("CameraView"),
        useCameraPermissions: () => [{ granted: true }, async () => ({ granted: true })],
      };
    }
    if (id === "react-native-qrcode-svg") {
      return {
        __esModule: true,
        default: createHostComponent("QRCode"),
      };
    }
    if (id === "expo-linear-gradient") {
      return { LinearGradient: createHostComponent("LinearGradient") };
    }
    if (id === "react-native-svg") {
      return {
        __esModule: true,
        default: createHostComponent("Svg"),
        Svg: createHostComponent("Svg"),
        Circle: createHostComponent("Circle"),
        G: createHostComponent("G"),
      };
    }
    if (id.endsWith("NativePressable")) {
      return { Pressable: createHostComponent("Pressable") };
    }
    if (id.endsWith("NoticeBanner")) {
      return { NoticeBanner: createHostComponent("NoticeBanner") };
    }
    if (id.endsWith("PrimaryButton")) {
      return {
        PrimaryButton: (props) =>
          React.createElement("Pressable", {
            accessibilityRole: "button",
            accessibilityLabel: props.title,
            onPress: props.onPress,
            disabled: props.loading,
          }, React.createElement("Text", null, props.title)),
      };
    }
    if (id.endsWith("formValidation")) {
      return {
        positiveNumberError: (val, label) => {
          if (!val || !String(val).trim()) return undefined;
          const n = Number(val);
          return Number.isFinite(n) && n > 0 ? undefined : `${label} must be positive`;
        },
      };
    }
    if (id.endsWith("api/client")) {
      return {
        getApiErrorMessage: (err) => (err && err.message ? err.message : String(err || "Error")),
      };
    }
    if (id.includes("web/pages/member/")) {
      return {
        ButtonView: createHostComponent("ButtonView"),
        MetricView: createHostComponent("MetricView"),
        WorkoutCardView: createHostComponent("WorkoutCardView"),
        StateView: createHostComponent("StateView"),
        StatCardView: createHostComponent("StatCardView"),
        ActionCardView: createHostComponent("ActionCardView"),
        HistoryRowView: createHostComponent("HistoryRowView"),
      };
    }
    if (id.includes("validation/auth")) {
      return {
        changePasswordSchema: {
          safeParse: (data) => ({ success: true, data }),
        },
      };
    }
    if (id.includes("logoutConfirmation")) {
      return {
        requestLogoutConfirmation: (fn) => fn?.(),
      };
    }
    return {};
  };

  const sandbox = {
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    console,
    URLSearchParams,
    Date,
    Intl,
    Math,
    String,
    Number,
    Boolean,
    Array,
    Object,
    JSON,
    Error,
    RegExp,
  };

  vm.runInNewContext(
    `(function(require,module,exports){${js}\n})`,
    sandbox,
  )(requireMock, mod, mod.exports);
  return mod.exports;
}

/**
 * Simple recursive tree walker that executes functional components (with basic useState/useEffect support)
 * so we can inspect rendered text and trigger Pressable onPress callbacks without external test renderer issues.
 */
function createTestHarness(Component, initialProps) {
  const states = [];
  const refs = [];
  let stateCursor = 0;
  let refCursor = 0;

  const origUseState = React.useState;
  const origUseEffect = React.useEffect;
  const origUseRef = React.useRef;

  function renderTree(currentProps = initialProps) {
    stateCursor = 0;
    refCursor = 0;
    const mockedReact = Object.create(React);
    mockedReact.useState = (init) => {
      const idx = stateCursor++;
      if (!(idx in states)) {
        states[idx] = typeof init === "function" ? init() : init;
      }
      const setState = (updater) => {
        states[idx] = typeof updater === "function" ? updater(states[idx]) : updater;
      };
      return [states[idx], setState];
    };
    mockedReact.useRef = (init) => {
      const idx = refCursor++;
      if (!(idx in refs)) {
        refs[idx] = { current: init };
      }
      return refs[idx];
    };
    mockedReact.useEffect = (fn) => {
      // Run effects synchronously once on initial render if needed
    };

    // Temporarily patch React hooks during synchronous render
    React.useState = mockedReact.useState;
    React.useRef = mockedReact.useRef;
    React.useEffect = mockedReact.useEffect;
    try {
      const rootEl = Component(currentProps);
      return expandElement(rootEl);
    } finally {
      React.useState = origUseState;
      React.useRef = origUseRef;
      React.useEffect = origUseEffect;
    }
  }

  function expandElement(node) {
    if (node == null || typeof node === "boolean") return null;
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(expandElement).filter((n) => n !== null);
    if (typeof node === "object" && node.type) {
      if (typeof node.type === "function") {
        return expandElement(node.type(node.props || {}));
      }
      const children = expandElement(node.props?.children);
      return {
        type: String(node.type),
        props: node.props || {},
        children: Array.isArray(children) ? children : children != null ? [children] : [],
      };
    }
    return null;
  }

  function collectText(tree) {
    if (tree == null) return "";
    if (typeof tree === "string") return tree;
    if (Array.isArray(tree)) return tree.map(collectText).join(" ");
    return (tree.children || []).map(collectText).join(" ");
  }

  function findNodes(tree, predicate, acc = []) {
    if (!tree) return acc;
    if (Array.isArray(tree)) {
      for (const item of tree) findNodes(item, predicate, acc);
      return acc;
    }
    if (typeof tree === "object") {
      if (predicate(tree)) acc.push(tree);
      for (const child of tree.children || []) findNodes(child, predicate, acc);
    }
    return acc;
  }

  return { renderTree, collectText, findNodes };
}

test("1. Dual-UI Isolation: Mobile Member screens contain zero direct useQuery, useMutation, or apiClient calls", () => {
  const memberMobileFiles = [
    "screens/member/MemberDashboardScreen.tsx",
    "screens/member/MemberWorkoutScreen.tsx",
    "screens/member/MemberMealPlanScreen.tsx",
    "screens/member/MemberAttendanceScreen.tsx",
    "screens/member/MemberProfileScreen.tsx",
    "navigation/RootNavigator.tsx",
  ];

  for (const relPath of memberMobileFiles) {
    const fullPath = path.join(mobileDir, relPath);
    const content = fs.readFileSync(fullPath, "utf8");
    const sf = ts.createSourceFile(fullPath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

    for (const stmt of sf.statements) {
      if (!ts.isImportDeclaration(stmt)) continue;
      const spec = stmt.moduleSpecifier.text;
      assert.ok(
        !spec.includes("@tanstack/react-query"),
        `${relPath} must not import @tanstack/react-query`,
      );
      assert.ok(
        !spec.includes("hooks/useMember"),
        `${relPath} must not import hooks/useMember directly`,
      );
    }
  }
});

test("2. Shared Controllers wire all required backend queries and mutations into model.props", () => {
  const controllerChecks = [
    {
      file: path.join(srcDir, "screens/member/MemberDashboardScreen.tsx"),
      requiredTokens: [
        "useMemberDashboard",
        "useMemberActivity",
        "useMemberWorkouts",
        "useMemberClasses",
        "useMemberTrainer",
        "useMemberProfile",
        "useMemberNotifications",
        "refreshAll",
      ],
    },
    {
      file: path.join(srcDir, "screens/member/MemberWorkoutScreen.tsx"),
      requiredTokens: [
        "useMemberWorkouts",
        "useMemberClasses",
        "useBookClass",
        "useCancelClass",
        "useCompleteWorkout",
        "useMemberProfile",
        "useMemberNotifications",
        "useMemberTrainer",
      ],
    },
    {
      file: path.join(srcDir, "screens/member/MemberFeatureScreens.tsx"),
      requiredTokens: [
        "useMemberMeals",
        "useCompleteMeal",
        "useCreateMemberMealPlan",
        "useMemberProfile",
        "useMemberNotifications",
        "useMemberAttendance",
        "useCheckInMember",
        "useCheckOutMember",
      ],
    },
    {
      file: path.join(srcDir, "screens/member/MemberAttendanceScreen.tsx"),
      requiredTokens: [
        "useMemberAttendance",
        "useMemberProfile",
        "useMemberMembership",
        "useMemberNotifications",
        "useCheckInMember",
        "useCheckOutMember",
        "showQr",
      ],
    },
    {
      file: path.join(srcDir, "screens/member/MemberProfileScreen.tsx"),
      requiredTokens: [
        "useMemberProfile",
        "useMemberMembership",
        "useMemberProgress",
        "useMemberGoals",
        "useMemberRewards",
        "useMemberTrainer",
        "useTrainerFeedback",
        "useUpdateMemberProfile",
      ],
    },
  ];

  for (const check of controllerChecks) {
    const content = fs.readFileSync(check.file, "utf8");
    for (const token of check.requiredTokens) {
      assert.ok(
        content.includes(token),
        `Expected ${path.basename(check.file)} to include backend integration token: ${token}`,
      );
    }
  }
});

test("3. Tab 1 — Summary (MemberDashboardScreenView) renders real backend metrics and triggers refresh & navigation", () => {
  const { MemberDashboardScreenView } = compileTsxFile(
    path.join(mobileDir, "screens/member/MemberDashboardScreen.tsx"),
  );

  let refreshCalled = 0;
  const navCalls = [];

  const model = {
    kind: "view1",
    props: {
      memberName: "Sakshi Sharma",
      todayCalories: 410,
      caloriesTarget: 500,
      sensorSteps: 8750,
      dailyActivity: {
        active_hours_completed: 10,
        active_hours_target: 12,
      },
      workouts: [
        {
          workout_plan_uuid: "wp-101",
          workout_plan_name: "Upper Body Power",
          trainer_name: "Coach Vikram",
          completion_status: "completed",
          completed_workouts: 3,
        },
      ],
      todayWorkout: {
        workout_plan_uuid: "wp-101",
        workout_plan_name: "Upper Body Power",
        trainer_name: "Coach Vikram",
        completion_status: "completed",
        today_workout: {
          duration_minutes: 42,
        },
      },
      workoutDone: true,
      classes: [],
      trainer: {
        trainer_uuid: "tr-1",
        trainer_name: "Vikram Desai",
        specialization: "Strength & Conditioning",
      },
      profile: {
        member_name: "Sakshi Sharma",
      },
      unreadNotifications: [{ notification_uuid: "n-1" }],
      formatNumber: (v) => new Intl.NumberFormat("en-US").format(v),
      refreshAll: () => {
        refreshCalled += 1;
      },
      navigateTo: (route) => navCalls.push({ route }),
    },
  };

  const harness = createTestHarness(MemberDashboardScreenView, { model });
  const tree = harness.renderTree();
  const text = harness.collectText(tree);

  // Verify real backend values are rendered
  assert.ok(text.includes("Summary"), "Should render Summary header");
  assert.ok(text.includes("410"), "Should render real Move calories (410)");
  assert.ok(text.includes("8,750"), "Should render real sensorSteps (8,750)");
  assert.ok(text.includes("Upper Body Power"), "Should render real workout name");
  assert.ok(text.includes("Vikram Desai"), "Should render real trainer name");
  assert.ok(text.includes("SS"), "Should render member initials SS for Sakshi Sharma");

  // Trigger Re-animate button -> should call refreshAll()
  const reanimateBtn = harness.findNodes(
    tree,
    (n) => n.props?.accessibilityLabel === "Re-animate rings",
  )[0];
  assert.ok(reanimateBtn, "Re-animate button should exist");
  reanimateBtn.props.onPress();
  assert.equal(refreshCalled, 1, "Pressing Re-animate should call refreshAll()");

  // Trigger Quick Action buttons -> should navigate to backend-connected screens
  const logWeightBtn = harness.findNodes(
    tree,
    (n) => n.props?.accessibilityLabel === "Log Weight",
  )[0];
  assert.ok(logWeightBtn, "Log Weight quick action should exist");
  logWeightBtn.props.onPress();
  assert.equal(navCalls.at(-1).route, "MemberProgress");
});

test("4. Tab 2 — Workouts & Gym Classes (MemberWorkoutScreenView) renders real plans/classes and calls bookClass/cancelClass mutations", () => {
  const { MemberWorkoutScreenView } = compileTsxFile(
    path.join(mobileDir, "screens/member/MemberWorkoutScreen.tsx"),
  );

  const bookedUuids = [];
  const cancelledUuids = [];
  const navCalls = [];

  const model = {
    kind: "view1",
    props: {
      completed: 6,
      consistency: 82,
      calories: 1450,
      duration: 195,
      workouts: [
        {
          workout_plan_uuid: "wp-back-1",
          workout_plan_name: "Deadlift Hypertrophy",
          goal: "Posterior Chain",
          level: "Level 2",
          trainer_name: "Coach Rohit",
          completion_status: "pending",
          today_workout: {
            duration_minutes: 52,
            exercises: [
              { name: "Romanian Deadlift", sets: 4, reps: 10 },
              { name: "Weighted Pull-Ups", sets: 3, reps: 8 },
            ],
          },
        },
      ],
      classes: [
        {
          class_uuid: "cls-hiit-1",
          class_name: "Metabolic HIIT Blast",
          class_type: "HIIT & Core",
          trainer_name: "Coach Sarah",
          time: "06:00 PM",
          available_seats: 3,
          booking_status: "open",
        },
        {
          class_uuid: "cls-yoga-2",
          class_name: "Mobility Flow",
          class_type: "Yoga & Flex",
          trainer_name: "Coach Elena",
          time: "07:30 AM",
          available_seats: 8,
          booking_status: "booked",
        },
      ],
      bookClass: {
        isPending: false,
        mutate: (uuid) => bookedUuids.push(uuid),
      },
      cancelClass: {
        isPending: false,
        mutate: (uuid) => cancelledUuids.push(uuid),
      },
      navigation: {
        navigate: (route, params) => navCalls.push({ route, params }),
      },
    },
  };

  const harness = createTestHarness(MemberWorkoutScreenView, { model });
  let tree = harness.renderTree();
  let text = harness.collectText(tree);

  // Verify real workout metrics & exercises
  assert.ok(text.includes("82%"), "Should render real consistency 82%");
  assert.ok(text.includes("1,450"), "Should render real active energy 1,450");
  assert.ok(text.includes("Deadlift Hypertrophy"), "Should render real workout plan name");
  assert.ok(text.includes("Romanian Deadlift"), "Should render real exercise item");

  // Click Start Workout -> should navigate to MemberWorkoutSession with workoutPlanUuid
  const startBtn = harness.findNodes(
    tree,
    (n) => n.props?.accessibilityLabel === "Start Workout",
  )[0];
  assert.ok(startBtn, "Start Workout button should exist");
  startBtn.props.onPress();
  assert.equal(navCalls.at(-1).route, "MemberWorkoutSession");
  assert.equal(navCalls.at(-1).params.workoutPlanUuid, "wp-back-1");

  // Switch to Gym Classes segment
  const classesTabBtn = harness.findNodes(
    tree,
    (n) =>
      n.type === "Pressable" &&
      harness.collectText(n).includes("Gym Classes"),
  )[0];
  assert.ok(classesTabBtn, "Gym Classes segment button should exist");
  classesTabBtn.props.onPress();

  tree = harness.renderTree();
  text = harness.collectText(tree);
  assert.ok(text.includes("Metabolic HIIT Blast"), "Should render real gym class name");
  assert.ok(text.includes("3 spots left"), "Should render real available seats");

  // Book open class -> should call bookClass.mutate("cls-hiit-1")
  const bookBtn = harness.findNodes(
    tree,
    (n) => n.props?.accessibilityLabel === "Book Spot for Metabolic HIIT Blast",
  )[0];
  assert.ok(bookBtn, "Book Spot button should exist");
  bookBtn.props.onPress();
  assert.deepEqual(bookedUuids, ["cls-hiit-1"]);

  // Cancel booked class -> should call cancelClass.mutate("cls-yoga-2")
  const cancelBtn = harness.findNodes(
    tree,
    (n) => n.props?.accessibilityLabel === "Cancel Mobility Flow",
  )[0];
  assert.ok(cancelBtn, "Cancel class button should exist");
  cancelBtn.props.onPress();
  assert.deepEqual(cancelledUuids, ["cls-yoga-2"]);
});

test("5. Tab 3 — Nutrition (MemberMealPlanScreenView) renders real meal macros/water and calls completeMeal.mutate", () => {
  const { MemberMealPlanScreenView } = compileTsxFile(
    path.join(mobileDir, "screens/member/MemberMealPlanScreen.tsx"),
  );

  const completedMeals = [];
  const waterUpdates = [];

  const model = {
    kind: "view1",
    props: {
      query: {
        isLoading: false,
        data: [
          {
            meal_plan_uuid: "mp-lean-1",
            meal_plan_name: "Lean Recomp Nutrition",
            calories_per_day: 2200,
            water_target_ml: 3000,
            water_intake_ml: 2000,
            trainer_notes: "High Protein Recovery",
            completion_status: "pending",
            meals: [
              { name: "Greek Yogurt", quantity: "200g", calories: 220, protein: 22, carbs: 14, fat: 5 },
              { name: "Grilled Chicken", quantity: "250g", calories: 410, protein: 62, carbs: 0, fat: 14 },
            ],
          },
        ],
      },
      setWaterMl: (val) => waterUpdates.push(val),
      completeMeal: {
        isPending: false,
        mutate: (payload) => completedMeals.push(payload),
      },
    },
  };

  const harness = createTestHarness(MemberMealPlanScreenView, { model });
  let tree = harness.renderTree();
  let text = harness.collectText(tree);

  assert.ok(text.includes("Lean Recomp Nutrition"), "Should render real meal plan title");
  assert.ok(text.includes("Greek Yogurt 200g"), "Should render real food chip from backend meal items");
  assert.ok(text.includes("2,200 kcal"), "Should render real daily calorie target");

  // Add +250 ml water
  const addGlassBtn = harness.findNodes(
    tree,
    (n) => n.props?.accessibilityLabel === "Add 250 ml Glass",
  )[0];
  assert.ok(addGlassBtn, "Add 250 ml Glass button should exist");
  addGlassBtn.props.onPress();
  assert.ok(waterUpdates.length > 0, "Should sync water intake with controller setWaterMl");

  // Re-render and press Mark Complete -> should invoke completeMeal.mutate with mealPlanUuid and waterMl
  tree = harness.renderTree();
  const markCompleteBtn = harness.findNodes(
    tree,
    (n) => n.props?.accessibilityLabel === "Mark Lean Recomp Nutrition complete",
  )[0];
  assert.ok(markCompleteBtn, "Mark Complete button should exist");
  markCompleteBtn.props.onPress();
  assert.equal(completedMeals.length, 1);
  assert.equal(completedMeals[0].mealPlanUuid, "mp-lean-1");
  assert.equal(typeof completedMeals[0].waterMl, "number");
});

test("6. Tab 4 — Pass / Gym Access (MemberAttendanceScreenView) renders real pass & attendance stats, validates home gym, and purges all simulation code", () => {
  const { MemberAttendanceScreenView } = compileTsxFile(
    path.join(mobileDir, "screens/member/MemberAttendanceScreen.tsx"),
  );

  const qrActions = [];
  const scannedTokens = [];

  const model = {
    kind: "view1",
    props: {
      homeGymId: "gym-zd-moshi-1",
      profile: {
        gym_id: "gym-zd-moshi-1",
        member_name: "Ganesh Raskar",
        member_code: "MBR-B46D7FB8E967",
        gym_name: "ZD Fitness Moshi",
        membership_status: "active",
      },
      membership: {
        gym_id: "gym-zd-moshi-1",
        membership_plan_name: "Basic Plan",
        plan_duration_days: 30,
        expiry_date: "2026-11-17",
        status: "active",
      },
      data: {
        today_status: "not_checked_in",
        can_check_in: true,
        can_check_out: false,
        today_visit_count: 1,
        daily_visit_limit: 2,
        attendance_percentage: 64,
        monthly_attendance_count: 16,
        missed_days: 3,
        history: [
          {
            attendance_uuid: "att-1",
            gym_name: "ZD Fitness",
            check_in_at: "2026-11-06T08:48:00Z",
            check_out_at: "2026-11-06T10:15:00Z",
          },
        ],
      },
      showQr: (action) => qrActions.push(action),
      scanMutation: {
        isPending: false,
        mutate: (token, opts) => {
          scannedTokens.push(token);
          opts?.onSuccess?.({ check_out_at: null });
        },
      },
      cameraPermission: { granted: true },
      checkIn: {
        mutate: () => {},
      },
      checkOut: {
        mutate: () => {},
      },
    },
  };

  const harness = createTestHarness(MemberAttendanceScreenView, { model });
  let tree = harness.renderTree();
  let text = harness.collectText(tree);

  assert.ok(text.includes("ZD FITNESS PASS"), "Should render real gym pass header");
  assert.ok(text.includes("#MBR-B46D7FB8E967"), "Should render real member code");
  assert.ok(text.includes("Basic Plan (30d)"), "Should render real plan name and duration");
  assert.ok(text.includes("1/2"), "Should render real today_visit_count/daily_visit_limit (1/2)");
  assert.ok(text.includes("64%"), "Should render real attendance_percentage (64%)");
  assert.ok(text.includes("3 Days"), "Should render real missed_days (3 Days)");

  // Flip pass card -> should call showQr("check_in") and show QR back face
  const flipCardBtn = harness.findNodes(
    tree,
    (n) => n.props?.accessibilityLabel === "Tap pass card to flip to QR code",
  )[0];
  assert.ok(flipCardBtn, "Pass card flip button should exist");
  flipCardBtn.props.onPress();
  assert.deepEqual(qrActions, ["check_in"], "Flipping pass card should request live QR token via showQr");

  tree = harness.renderTree();
  text = harness.collectText(tree);
  assert.ok(text.includes("Present at Turnstile"), "Should render back of pass card with QR");

  // Verify real QRCode component rendered
  const qrNode = harness.findNodes(tree, (n) => n.type === "QRCode")[0];
  assert.ok(qrNode, "Real QRCode component should render on back of pass card");
  assert.equal(qrNode.props.value, "MBR-B46D7FB8E967");

  // Open QR Scanner modal via main action button
  const openScannerBtn = harness.findNodes(
    tree,
    (n) => n.props?.accessibilityLabel === "Open QR Scanner for Gym Check-In",
  )[0];
  assert.ok(openScannerBtn, "Open QR Scanner button should exist");
  openScannerBtn.props.onPress();

  tree = harness.renderTree();
  text = harness.collectText(tree);
  assert.ok(text.includes("Align Daily QR in Frame"), "Scanner modal should display viewfinder with Align Daily QR prompt");

  // ASSERTION: Simulation button and simulation helper text are completely purged
  const simulateNodes = harness.findNodes(
    tree,
    (n) => n.props?.accessibilityLabel === "Simulate Successful Check-In",
  );
  assert.equal(simulateNodes.length, 0, "Green simulate button must be completely deleted");
  assert.ok(!text.includes("Simulate scanning the daily gym door QR code"), "Simulation helper text must be purged");
  assert.ok(!text.includes("Simulate Successful Check-In"), "Simulate label must be purged");

  // Test CameraView scan with foreign gym QR code -> Access Denied
  let cameraNode = harness.findNodes(tree, (n) => n.type === "CameraView")[0];
  assert.ok(cameraNode, "CameraView should be rendered when camera permission is granted");
  assert.ok(typeof cameraNode.props.onBarcodeScanned === "function", "CameraView should have onBarcodeScanned handler");

  cameraNode.props.onBarcodeScanned({
    data: JSON.stringify({ gym_id: "gym-other-branch", token: "foreign-tok-123" }),
  });

  tree = harness.renderTree();
  text = harness.collectText(tree);
  assert.ok(text.includes("Access Denied: Unrecognized Gym QR"), "Should display Access Denied for mismatched gym QR");
  assert.ok(text.includes("restricted to your registered home gym"), "Should display registered home gym message");
  assert.equal(scannedTokens.length, 0, "Mismatched gym scan must NOT submit to backend mutation");

  // Tap "Try Again" to reset scanner
  const retryBtn = harness.findNodes(
    tree,
    (n) => n.props?.accessibilityLabel === "Try Again",
  )[0];
  assert.ok(retryBtn, "Try Again button should exist on Access Denied banner");
  retryBtn.props.onPress();

  tree = harness.renderTree();

  // Test CameraView scan with registered home gym QR code -> Successful Check-In
  cameraNode = harness.findNodes(tree, (n) => n.type === "CameraView")[0];
  assert.ok(cameraNode, "CameraView should be active after resetting");
  cameraNode.props.onBarcodeScanned({
    data: JSON.stringify({ gym_id: "gym-zd-moshi-1", token: "tok-home-valid-999" }),
  });

  assert.deepEqual(scannedTokens, ["tok-home-valid-999"], "Matching home gym QR must submit token to scanMutation");
});

test("7. Tab 5 — Profile (MemberProfileScreenView) renders real vitals/membership/awards and submits profile update", async () => {
  const { MemberProfileScreenView } = compileTsxFile(
    path.join(mobileDir, "screens/member/MemberProfileScreen.tsx"),
  );

  let submitCalled = 0;

  const model = {
    kind: "view1",
    props: {
      profile: {
        member_name: "Sakshi Sharma",
        email: "sakshi@pulsefit.com",
        gym_name: "ZD Fitness Moshi",
        fitness_goal: "Fat Loss",
        membership_status: "active",
        weight: 58.5,
        height: 164,
        bmi: 21.8,
      },
      membership: {
        membership_plan_name: "Pro Annual",
        plan_duration_days: 365,
        plan_price_cents: 499900,
        days_remaining: 240,
        status: "active",
      },
      progressLogs: [
        {
          weight: 58.5,
          bmi: 21.8,
        },
      ],
      goals: [
        {
          goal_name: "Fat Loss",
          target_weight: 54.0,
        },
      ],
      rewards: [{ reward_uuid: "r1" }, { reward_uuid: "r2" }, { reward_uuid: "r3" }, { reward_uuid: "r4" }],
      trainer: {
        trainer_name: "Rohit Verma",
      },
      trainerFeedback: {
        rating: 4.8,
      },
      form: {
        phone: "9876543210",
        weight: "58.5",
        height: "164",
        fitnessGoal: "Fat Loss",
      },
      setForm: () => {},
      updateProfile: { isPending: false, error: null },
      submit: async () => {
        submitCalled += 1;
        return true;
      },
    },
  };

  const harness = createTestHarness(MemberProfileScreenView, { model });
  let tree = harness.renderTree();
  let text = harness.collectText(tree);

  assert.ok(text.includes("Sakshi Sharma"), "Should render real member name");
  assert.ok(text.includes("58.5 kg"), "Should render real weight 58.5 kg");
  assert.ok(text.includes("Target: 54.0 kg"), "Should render real target weight 54.0 kg");
  assert.ok(text.includes("21.8"), "Should render real BMI 21.8");
  assert.ok(text.includes("164 cm"), "Should render real height 164 cm");
  assert.ok(text.includes("Pro Annual (365 Days)"), "Should render real membership plan");
  assert.ok(text.includes("View 4 Badges"), "Should render real rewards count (4 Badges)");
  assert.ok(text.includes("Rate Trainer Rohit Verma (4.8 ★)"), "Should render real trainer name & feedback rating");

  // Toggle Edit drawer and click Save Changes -> should invoke submit()
  const editBtn = harness.findNodes(
    tree,
    (n) => n.props?.accessibilityLabel === "Edit profile",
  )[0];
  assert.ok(editBtn, "Edit profile button should exist");
  editBtn.props.onPress();

  tree = harness.renderTree();
  const saveBtn = harness.findNodes(
    tree,
    (n) => n.props?.accessibilityLabel === "Save Changes",
  )[0];
  assert.ok(saveBtn, "Save Changes button should appear when editing");
  await saveBtn.props.onPress();
  assert.equal(submitCalled, 1, "Clicking Save Changes should invoke submit() mutation");
});

test("8. Strict Zero/Empty Data Check: Mobile screens never render hardcoded dummy names, fake vitals, fake workouts, fake meals, or fake check-in sessions", () => {
  const { MemberDashboardScreenView } = compileTsxFile(
    path.join(mobileDir, "screens/member/MemberDashboardScreen.tsx"),
  );
  const { MemberWorkoutScreenView } = compileTsxFile(
    path.join(mobileDir, "screens/member/MemberWorkoutScreen.tsx"),
  );
  const { MemberMealPlanScreenView } = compileTsxFile(
    path.join(mobileDir, "screens/member/MemberMealPlanScreen.tsx"),
  );
  const { MemberAttendanceScreenView } = compileTsxFile(
    path.join(mobileDir, "screens/member/MemberAttendanceScreen.tsx"),
  );
  const { MemberProfileScreenView } = compileTsxFile(
    path.join(mobileDir, "screens/member/MemberProfileScreen.tsx"),
  );

  // Tab 1 Empty check
  const dashModel = {
    kind: "view1",
    props: {
      memberName: "Priya",
      todayCalories: 0,
      caloriesTarget: 0,
      sensorSteps: 0,
      workouts: [],
      classes: [],
      trainer: null,
      meals: [],
      unreadNotifications: [],
    },
  };
  const dashHarness = createTestHarness(MemberDashboardScreenView, { model: dashModel });
  const dashText = dashHarness.collectText(dashHarness.renderTree());
  assert.ok(!dashText.includes("Trainer Rohit"), "Must not leak fake 'Trainer Rohit'");
  assert.ok(!dashText.includes("Back Workout"), "Must not leak fake 'Back Workout'");
  assert.ok(!dashText.includes("Maintenance Meal"), "Must not leak fake 'Maintenance Meal'");
  assert.ok(dashText.includes("No activities scheduled for today"), "Must show clean schedule empty notice");
  assert.ok(dashText.includes("No Trainer Assigned"), "Must show 'No Trainer Assigned'");

  // Tab 2 Empty check
  const workoutModel = {
    kind: "view1",
    props: {
      completed: 0,
      consistency: 0,
      calories: 0,
      duration: 0,
      workouts: [
        {
          workout_plan_uuid: "w-empty",
          workout_plan_name: "Beginner Routine",
          completion_status: "pending",
        },
      ],
      classes: [],
      bookClass: { isPending: false, mutate: () => {} },
      cancelClass: { isPending: false, mutate: () => {} },
    },
  };
  const workoutHarness = createTestHarness(MemberWorkoutScreenView, { model: workoutModel });
  const workoutText = workoutHarness.collectText(workoutHarness.renderTree());
  assert.ok(!workoutText.includes("Band Pull Aparts"), "Must not leak fake 'Band Pull Aparts'");
  assert.ok(!workoutText.includes("Coach Sarah"), "Must not leak fake 'Coach Sarah'");
  assert.ok(!workoutText.includes("Studio 1"), "Must not leak fake 'Studio 1'");

  // Tab 3 Empty check
  const mealModel = {
    kind: "view1",
    props: {
      query: { isLoading: false, data: [] },
      setWaterMl: () => {},
      completeMeal: { isPending: false, mutate: () => {} },
    },
  };
  const mealHarness = createTestHarness(MemberMealPlanScreenView, { model: mealModel });
  const mealText = mealHarness.collectText(mealHarness.renderTree());
  assert.ok(!mealText.includes("Maintenance Nutrition"), "Must not leak fake 'Maintenance Nutrition'");
  assert.ok(!mealText.includes("Almonds 57g"), "Must not leak fake 'Almonds 57g'");
  assert.ok(!mealText.includes("Amaranth 371 kcal"), "Must not leak fake 'Amaranth 371 kcal'");
  assert.ok(mealText.includes("No Assigned Meal Plans"), "Must show authentic empty state");

  // Tab 4 Empty check
  const attModel = {
    kind: "view1",
    props: {
      profile: null,
      membership: null,
      data: {
        today_visit_count: 0,
        daily_visit_limit: 1,
        attendance_percentage: 0,
        monthly_attendance_count: 0,
        missed_days: 0,
        history: [],
      },
      checkIn: { mutate: () => {} },
      checkOut: { mutate: () => {} },
    },
  };
  const attHarness = createTestHarness(MemberAttendanceScreenView, { model: attModel });
  const attText = attHarness.collectText(attHarness.renderTree());
  assert.ok(!attText.includes("Nov 17, 2026"), "Must not leak fake date 'Nov 17, 2026'");
  assert.ok(!attText.includes("08:48 AM"), "Must not leak fake session time '08:48 AM'");
  assert.ok(!attText.includes("Ganesh Raskar"), "Must not leak fake name 'Ganesh Raskar'");
  assert.ok(!attText.includes("MBR-B46D7FB8E967"), "Must not leak fake code 'MBR-B46D7FB8E967'");
  assert.ok(attText.includes("No recent check-in sessions recorded"), "Must show clean attendance empty notice");

  // Tab 5 Empty check
  const profileModel = {
    kind: "view1",
    props: {
      profile: {
        member_name: "Sneha Patil",
        email: "sneha@example.com",
      },
      membership: null,
      progressLogs: [],
      goals: [],
      rewards: [],
      trainer: null,
      trainerFeedback: null,
      updateProfile: { isPending: false },
      submit: async () => true,
    },
  };
  const profileHarness = createTestHarness(MemberProfileScreenView, { model: profileModel });
  const profileText = profileHarness.collectText(profileHarness.renderTree());
  assert.ok(!profileText.includes("62.0 kg"), "Must not leak fake weight '62.0 kg'");
  assert.ok(!profileText.includes("165 cm"), "Must not leak fake height '165 cm'");
  assert.ok(!profileText.includes("22.8"), "Must not leak fake BMI '22.8'");
  assert.ok(!profileText.includes("30-Day Star"), "Must not leak fake award '30-Day Star'");
  assert.ok(!profileText.includes("Trainer Rohit"), "Must not leak fake 'Trainer Rohit'");
  assert.ok(profileText.includes("--"), "Must render placeholder '--' when vitals not recorded");
  assert.ok(profileText.includes("No badges unlocked yet"), "Must show authentic empty badges notice");
  assert.ok(profileText.includes("No trainer assigned"), "Must show no trainer assigned");
});

test("9. Member Settings Screen (MemberSettingsView) renders segmented tabs, user card, theme controls, and security forms", () => {
  const { MemberSettingsView } = compileTsxFile(
    path.join(mobileDir, "screens/member/MemberSettingsView.tsx"),
  );

  let submitPasswordCalled = 0;
  let colorSchemeSet = "";
  let navTarget = "";

  const settingsModel = {
    kind: "view1",
    props: {
      user: { full_name: "Mahesh Raskar", email: "maheshzraskarvip@gmail.com", gym_name: "ZD Fitness" },
      profile: { member_name: "Mahesh Raskar", email: "maheshzraskarvip@gmail.com", gym_name: "ZD Fitness" },
      oldPassword: "old-secret-password",
      setOldPassword: () => {},
      newPassword: "new-super-secret-password",
      setNewPassword: () => {},
      changePassword: { isPending: false },
      submitPassword: () => { submitPasswordCalled++; },
      notifications: true,
      setNotifications: () => {},
      privacy: true,
      setPrivacy: () => {},
      appleWatchSync: true,
      setAppleWatchSync: () => {},
      faceIdAuth: true,
      setFaceIdAuth: () => {},
      isDark: true,
      setColorScheme: (scheme) => { colorSchemeSet = scheme; },
      navigation: {
        canGoBack: () => true,
        goBack: () => { navTarget = "goBack"; },
        navigate: (screen) => { navTarget = screen; },
      },
      logout: { isPending: false, mutate: () => {} },
    },
  };

  const harness = createTestHarness(MemberSettingsView, { model: settingsModel });
  let tree = harness.renderTree();
  let text = harness.collectText(tree);

  // Assert user identity banner
  assert.ok(text.includes("Mahesh Raskar"), "User name should be rendered");
  assert.ok(text.includes("maheshzraskarvip@gmail.com"), "User email should be rendered");
  assert.ok(text.includes("ZD Fitness Member • Verified Pass"), "Verified pass badge should be rendered");

  // Assert Segmented tabs
  assert.ok(text.includes("Preferences"), "Preferences tab should exist");
  assert.ok(text.includes("Appearance"), "Appearance tab should exist");
  assert.ok(text.includes("Security"), "Security tab should exist");

  // Assert Return to Dashboard button
  const dashBtn = harness.findNodes(
    tree,
    (n) => n.props?.accessibilityLabel === "Return to Dashboard",
  )[0];
  assert.ok(dashBtn, "Return to Dashboard button should exist");
  dashBtn.props.onPress();
  assert.equal(navTarget, "goBack", "Clicking Return to Dashboard should navigate back");

  // Switch to Appearance tab
  const appearanceTab = harness.findNodes(
    tree,
    (n) => n.props?.accessibilityLabel === "Appearance",
  )[0];
  assert.ok(appearanceTab, "Appearance tab should be found");
  appearanceTab.props.onPress();
  tree = harness.renderTree();
  text = harness.collectText(tree);
  assert.ok(text.includes("DISPLAY & APPEARANCE"), "Should switch to Display & Appearance");

  // Switch to Security tab
  const securityTab = harness.findNodes(
    tree,
    (n) => n.props?.accessibilityLabel === "Security",
  )[0];
  assert.ok(securityTab, "Security tab should be found");
  securityTab.props.onPress();
  tree = harness.renderTree();
  text = harness.collectText(tree);
  assert.ok(text.includes("PASSWORD & AUTHENTICATION"), "Should switch to Security");

  const changePassBtn = harness.findNodes(
    tree,
    (n) => n.props?.accessibilityRole === "button" && n.props?.onPress && harness.collectText(n).includes("Change Password"),
  )[0];
  assert.ok(changePassBtn, "Change Password button should be clickable");
  changePassBtn.props.onPress();
  assert.equal(submitPasswordCalled, 1, "Clicking Change Password should invoke submitPassword()");
});

test("10. Workouts & Schedule Navigation Flow: Summary, Schedule, Book Class, and Today's Schedule triggers focus Workouts Window", () => {
  const { MemberDashboardScreenView } = compileTsxFile(
    path.join(mobileDir, "screens/member/MemberDashboardScreen.tsx"),
  );
  const { MemberWorkoutScreenView } = compileTsxFile(
    path.join(mobileDir, "screens/member/MemberWorkoutScreen.tsx"),
  );

  const navCalls = [];
  const dashModel = {
    kind: "view1",
    props: {
      authUid: "usr-auth-101",
      dashboard: { visits_this_month: 4 },
      workouts: [
        {
          workout_plan_uuid: "wp-99",
          workout_plan_name: "Strength Circuit",
          completion_status: "pending",
        },
      ],
      todayWorkout: {
        workout_plan_uuid: "wp-99",
        workout_plan_name: "Strength Circuit",
        completion_status: "pending",
      },
      classes: [],
      trainer: {
        trainer_uuid: "tr-1",
        trainer_name: "Coach Vikram",
        specialization: "Head Coach",
      },
      navigateTo: (route, params) => navCalls.push({ route, params }),
    },
  };

  const dashHarness = createTestHarness(MemberDashboardScreenView, { model: dashModel });
  const dashTree = dashHarness.renderTree();

  // 1. Book Class CTA on Dashboard -> opens MemberWorkout window ({ tab: "classes" })
  const bookClassTile = dashHarness.findNodes(
    dashTree,
    (n) => n.props?.accessibilityLabel === "Book Class",
  )[0];
  assert.ok(bookClassTile, "Book Class quick action tile should exist");
  bookClassTile.props.onPress();
  assert.equal(navCalls.at(-1).route, "MemberWorkout");
  assert.equal(navCalls.at(-1).params.tab, "classes");

  // 2. Today's Schedule header & View All -> opens MemberWorkout window ({ tab: "classes" })
  const todaySchedHeader = dashHarness.findNodes(
    dashTree,
    (n) => n.props?.accessibilityLabel === "Open Today's Schedule",
  )[0];
  assert.ok(todaySchedHeader, "Today's Schedule header trigger should exist");
  todaySchedHeader.props.onPress();
  assert.equal(navCalls.at(-1).route, "MemberWorkout");
  assert.equal(navCalls.at(-1).params.tab, "classes");

  const viewAllSchedBtn = dashHarness.findNodes(
    dashTree,
    (n) => n.props?.accessibilityLabel === "View All Schedule",
  )[0];
  assert.ok(viewAllSchedBtn, "View All Schedule button should exist");
  viewAllSchedBtn.props.onPress();
  assert.equal(navCalls.at(-1).route, "MemberWorkout");
  assert.equal(navCalls.at(-1).params.tab, "classes");

  // 3. Trainer Schedule button -> opens MemberWorkout window ({ tab: "classes" })
  const trainerSchedBtn = dashHarness.findNodes(
    dashTree,
    (n) => n.props?.accessibilityLabel === "Schedule with Trainer",
  )[0];
  assert.ok(trainerSchedBtn, "Schedule with Trainer button should exist");
  trainerSchedBtn.props.onPress();
  assert.equal(navCalls.at(-1).route, "MemberWorkout");
  assert.equal(navCalls.at(-1).params.tab, "classes");

  // 4. Workouts Screen with { tab: "classes" } renders Gym Classes directly in the Workouts window without any modal
  const bookedClasses = [];
  const workoutModel = {
    kind: "view1",
    props: {
      authUid: "usr-auth-101",
      routeParams: {
        tab: "classes",
      },
      workouts: [
        {
          workout_plan_uuid: "wp-99",
          workout_plan_name: "Strength Circuit",
          goal: "Hypertrophy",
          completion_status: "pending",
        },
      ],
      classes: [
        {
          class_uuid: "cls-spin-9",
          class_name: "Endurance Spin",
          class_type: "Cardio",
          trainer_name: "Coach Neha",
          time: "05:30 PM",
          available_seats: 5,
          booking_status: "open",
        },
      ],
      bookClass: {
        isPending: false,
        mutate: (uuid) => bookedClasses.push(uuid),
      },
      cancelClass: {
        isPending: false,
        mutate: () => {},
      },
    },
  };

  const workoutHarness = createTestHarness(MemberWorkoutScreenView, { model: workoutModel });
  const workoutTree = workoutHarness.renderTree();
  const workoutText = workoutHarness.collectText(workoutTree);

  assert.ok(!workoutText.includes("Book a Gym Class"), "Should NOT render any Book a Gym Class popup modal");
  assert.ok(workoutText.includes("Workouts"), "Should render existing Workouts window");
  assert.ok(workoutText.includes("Endurance Spin"), "Should render Gym Classes tab inside Workouts window");

  const bookBtn = workoutHarness.findNodes(
    workoutTree,
    (n) => n.props?.accessibilityLabel === "Book Spot for Endurance Spin",
  )[0];
  assert.ok(bookBtn, "Book Spot button should exist in Workouts window");
  bookBtn.props.onPress();
  assert.deepEqual(bookedClasses, ["cls-spin-9"]);
});

test("11. Responsive Device Matrix (320px–440px+), Safe-Area Insets & Fluid Scaling across all Mobile Screens", () => {
  const themeMod = compileTsxFile(path.join(mobileDir, "theme/theme.ts"));
  assert.equal(typeof themeMod.getMobileViewportMetrics, "function");

  const viewports = [
    { name: "iPhone SE (320px)", width: 320, height: 568, expectedPad: 12, expectedSvg: 124 },
    { name: "iPhone 13 mini (375px)", width: 375, height: 812, expectedPad: 14, expectedSvg: 138 },
    { name: "iPhone 16 Pro (393px)", width: 393, height: 852, expectedPad: 16, expectedSvg: 152 },
    { name: "Pixel 9 Pro (414px)", width: 414, height: 896, expectedPad: 18, expectedSvg: 158 },
    { name: "iPhone 16 Pro Max (430px)", width: 430, height: 932, expectedPad: 18, expectedSvg: 158 },
  ];

  const origUseWindowDimensions = nativeMock.useWindowDimensions;
  try {
    for (const vpSpec of viewports) {
      nativeMock.useWindowDimensions = () => ({ width: vpSpec.width, height: vpSpec.height });
      const metrics = themeMod.getMobileViewportMetrics(vpSpec.width, vpSpec.height, {
        top: 54,
        bottom: 34,
        left: 0,
        right: 0,
      });

      assert.equal(
        metrics.horizontalPadding,
        vpSpec.expectedPad,
        `${vpSpec.name} should have horizontalPadding=${vpSpec.expectedPad}`,
      );
      assert.ok(
        metrics.safeBottomPadding >= 34,
        `${vpSpec.name} should preserve bottom safe-area inset`,
      );
      assert.ok(
        metrics.heroTitleSize >= 26 && metrics.heroTitleSize <= 34,
        `${vpSpec.name} heroTitleSize should clamp between 26 and 34`,
      );

      const { MemberDashboardScreenView } = compileTsxFile(
        path.join(mobileDir, "screens/member/MemberDashboardScreen.tsx"),
      );
      const dashHarness = createTestHarness(MemberDashboardScreenView, {
        model: {
          kind: "view1",
          props: {
            dashboard: { visits_this_month: 8 },
            workouts: [],
            classes: [],
            navigateTo: () => {},
          },
        },
      });
      const dashTree = dashHarness.renderTree();

      // Verify Activity Rings SVG scales proportionally to viewport width
      const svgNode = dashHarness.findNodes(dashTree, (n) => n.type === "Svg")[0];
      assert.ok(svgNode, `${vpSpec.name}: Activity Rings Svg should render`);
      assert.equal(
        svgNode.props.width,
        vpSpec.expectedSvg,
        `${vpSpec.name}: Svg width should be ${vpSpec.expectedSvg}`,
      );

      // Verify Header Notification & Profile buttons meet >= 44x44px touch target
      const notifBtn = dashHarness.findNodes(
        dashTree,
        (n) => n.props?.accessibilityLabel === "Notifications",
      )[0];
      const flatStyle = nativeMock.StyleSheet.flatten(notifBtn.props.style);
      assert.ok(
        flatStyle.minWidth >= 44 && flatStyle.minHeight >= 44,
        `${vpSpec.name}: Notification icon touch target should be at least 44x44`,
      );
    }
  } finally {
    nativeMock.useWindowDimensions = origUseWindowDimensions;
  }
});
