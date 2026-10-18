const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");
const React = require("react");
const ts = require("typescript");

const mobile = path.resolve(__dirname, "..");
function harness(
  width,
  scheme = "dark",
  { os = "ios", fontScale = 1, reduceMotion = false } = {},
) {
  const cache = new Map();
  const contexts = new Map();
  let colors;
  const rn = {
    Platform: { OS: os, select: (v) => v[os] ?? v.default },
    StyleSheet: {
      create: (v) => v,
      hairlineWidth: 0.5,
      flatten: (value) =>
        Array.isArray(value)
          ? Object.assign(
              {},
              ...value
                .filter(Boolean)
                .map((item) => rn.StyleSheet.flatten(item)),
            )
          : value,
    },
    useWindowDimensions: () => ({ width, height: 844, fontScale }),
    View: "View",
    Text: "Text",
    Pressable: "Pressable",
    ScrollView: "ScrollView",
    Modal: "Modal",
    TextInput: "TextInput",
    KeyboardAvoidingView: "KeyboardAvoidingView",
    Image: "Image",
    ActivityIndicator: "ActivityIndicator",
  };
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const module = { exports: {} };
    cache.set(file, module.exports);
    const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    function requireMock(request) {
      if (request === "react")
        return {
          ...React,
          useMemo: (fn) => fn(),
          useContext: (ctx) => contexts.get(ctx) ?? ctx?._currentValue ?? false,
          useState: (initial) => [initial, () => {}],
        };
      if (request === "react/jsx-runtime") return require(request);
      if (request === "react-native") return rn;
      if (request === "@expo/vector-icons") return { Ionicons: "Icon" };
      if (request === "expo-linear-gradient")
        return { LinearGradient: "Gradient" };
      if (request === "react-native-svg")
        return {
          __esModule: true,
          default: "Svg",
          Path: "Path",
          Defs: "Defs",
          LinearGradient: "SvgGradient",
          Stop: "Stop",
        };
      if (request === "expo-constants")
        return {
          __esModule: true,
          default: { expoConfig: { version: "1.0.0" } },
        };
      if (request.endsWith("/hooks/useAnalyticsMembers"))
        return {
          useAnalyticsMembers: () => ({
            query: { data: [], isLoading: false, error: null },
            permitted: true,
          }),
        };
      if (request === "react-native-reanimated")
        return { useReducedMotion: () => reduceMotion };
      if (request === "@react-navigation/native")
        return {
          NavigationContainer: "NavigationContainer",
          useNavigation: () => ({
            getState: () => ({ type: "tab" }),
            canGoBack: () => false,
          }),
        };
      if (request === "@react-navigation/bottom-tabs")
        return { BottomTabBar: "BottomTabBar" };
      if (request.includes("data/onboarding"))
        return {
          onboardingSlides: [{ id: "one" }, { id: "two" }, { id: "three" }],
        };
      if (request === "react-native-safe-area-context")
        return {
          SafeAreaView: "SafeAreaView",
          useSafeAreaInsets: () => ({ top: 47, bottom: 34, left: 0, right: 0 }),
        };
      if (request.includes("AppThemeProvider"))
        return {
          useAppTheme: () => ({
            colors,
            isDark: scheme === "dark",
            themeMode: scheme,
          }),
        };
      if (request.includes("utils/formatters"))
        return load(path.resolve(path.dirname(file), request + ".ts"));
      if (request.includes("utils/logoutConfirmation"))
        return { requestLogoutConfirmation: (fn) => fn() };
      const base = path.resolve(path.dirname(file), request);
      const resolved = [base + ".tsx", base + ".ts"].find((p) =>
        fs.existsSync(p),
      );
      assert.ok(resolved, request);
      if (!resolved.startsWith(mobile + path.sep))
        return new Proxy(
          {},
          {
            get: () =>
              function SharedComponentStub() {
                return null;
              },
          },
        );
      return load(resolved);
    }
    vm.runInThisContext(`(function(require,module,exports){${source}\n})`, {
      filename: file,
    })(requireMock, module, module.exports);
    cache.set(file, module.exports);
    return module.exports;
  }
  colors = load(path.join(mobile, "theme/theme.ts")).getThemeColors(scheme);
  function expand(element) {
    if (Array.isArray(element)) return element.flatMap(expand);
    if (!React.isValidElement(element)) return [];
    if (element.type === "Modal" && !element.props.visible) return [];
    if (element.type?.$$typeof === Symbol.for("react.context")) {
      const previous = contexts.get(element.type);
      contexts.set(element.type, element.props.value);
      const children = expand(element.props.children);
      contexts.set(element.type, previous);
      return children;
    }
    if (typeof element.type === "function")
      return expand(element.type(element.props));
    return [element, ...expand(element.props.children)];
  }
  return { load, expand, colors };
}

const flattenStyle = (value) =>
  Object.assign(
    {},
    ...[value].flat(Infinity).filter((v) => v && typeof v === "object"),
  );

test("native feature pages have one scroller and preserve their refresh and keyboard handling", () => {
  for (const width of [320, 390, 768, 1024]) {
    const h = harness(width);
    const { Screen } = h.load(path.join(mobile, "components/Screen.tsx"));
    const { PulseDashboardLayoutView } = h.load(
      path.join(mobile, "layouts/PulseDashboardLayout.tsx"),
    );
    const refreshControl = React.createElement("RefreshControl", {
      onRefresh() {},
    });
    const props = {
      styles: {},
      colors: h.colors,
      activeLabel: "Members",
      resolvedRoleLabel: "Gym Owner",
      userName: "Long Owner Name",
      navigation: { navigate() {} },
      setAccountMenuOpen() {},
      isGymOwner: true,
      children: React.createElement(
        Screen,
        { scroll: true, keyboard: true, refreshControl },
        React.createElement("Text", null, "Members"),
      ),
    };
    const nodes = h.expand(
      PulseDashboardLayoutView({ model: { kind: "view1", props } }),
    );
    const scrollers = nodes.filter((n) => n.type === "ScrollView");
    assert.equal(scrollers.length, 1, `one scroll owner at ${width}`);
    assert.equal(scrollers[0].props.refreshControl, refreshControl);
    assert.equal(scrollers[0].props.keyboardShouldPersistTaps, "handled");
    assert.equal(
      nodes.filter((n) => n.type === "KeyboardAvoidingView").length,
      1,
    );
    const safeAreas = nodes.filter((n) => n.type === "SafeAreaView");
    assert.deepEqual(
      safeAreas.map((n) => n.props.edges),
      [["top", "right", "bottom", "left"], []],
    );
    assert.equal(
      nodes.filter((n) => n.props.accessibilityLabel === "Add member").length,
      0,
    );
  }
});

test("native dashboard shortcuts and account access retain their original destinations", () => {
  const h = harness(320);
  const { PulseDashboardLayoutView } = h.load(
    path.join(mobile, "layouts/PulseDashboardLayout.tsx"),
  );
  const destinations = [];
  let opened = false;
  const props = {
    styles: {},
    colors: h.colors,
    activeLabel: "Dashboard",
    resolvedRoleLabel: "Gym Owner",
    userName: "Owner Name",
    firstName: (name) => name.split(" ")[0],
    ownerDate: "14 Oct 2026",
    unreadNotificationCount: 2,
    navigation: { navigate: (route) => destinations.push(route) },
    setAccountMenuOpen: (value) => (opened = value),
    isGymOwner: true,
    children: React.createElement("Text", null, "Summary"),
  };
  const nodes = h.expand(
    PulseDashboardLayoutView({ model: { kind: "view1", props } }),
  );
  assert.equal(nodes.filter((n) => n.type === "ScrollView").length, 1);
  for (const label of [
    "Add member",
    "Open attendance calendar",
    "Notifications, 2 unread",
    "Open account menu",
  ])
    nodes.find((n) => n.props.accessibilityLabel === label).props.onPress();
  assert.deepEqual(destinations, ["AddMember", "Attendance", "Notifications"]);
  assert.equal(opened, true);
});

test("direct-content plan pages keep workspace scrolling", () => {
  const h = harness(390);
  const { PulseDashboardLayoutView } = h.load(
    path.join(mobile, "layouts/PulseDashboardLayout.tsx"),
  );
  const props = {
    styles: {},
    colors: h.colors,
    activeLabel: "Membership plans",
    contentStyle: { gap: 20 },
    resolvedRoleLabel: "Gym Owner",
    userName: "Owner",
    navigation: { navigate() {} },
    setAccountMenuOpen() {},
    isGymOwner: true,
    children: React.createElement("View", null, "Plans"),
  };
  const nodes = h.expand(
    PulseDashboardLayoutView({ model: { kind: "view1", props } }),
  );
  assert.equal(nodes.filter((n) => n.type === "ScrollView").length, 1);
});

test("phone directories expose full-width search and readable themed profile cards", () => {
  for (const scheme of ["light", "dark"]) {
    const h = harness(320, scheme);
    const memberStyles = h
      .load(path.join(mobile, "styles/screens/saas/MemberListScreen.styles.ts"))
      .createStyles(h.colors);
    assert.equal(memberStyles.pageHeader.flexDirection, "column");
    assert.equal(memberStyles.toolbarSearch.width, "100%");
    assert.equal(memberStyles.headerActions.flexWrap, "wrap");
    assert.equal(memberStyles.memberRow.flexDirection, "column");
    assert.ok(memberStyles.iconButton.width >= 44);
    const profile = h
      .load(path.join(mobile, "styles/screens/saas/ProfileScreen.styles.ts"))
      .createStyles(h.colors);
    assert.notEqual(profile.hero.backgroundColor, profile.name.color);
    assert.notEqual(profile.hero.backgroundColor, profile.email.color);
    const dashboard = h
      .load(
        path.join(
          mobile,
          "styles/screens/saas/GymAdminDashboardScreen.styles.ts",
        ),
      )
      .createOwnerDashboardStyles(h.colors);
    assert.notEqual(dashboard.statusRingValue.color, h.colors.card);
    assert.equal(dashboard.metric.minWidth, 0);
    assert.equal(dashboard.metric.width, "100%");
    assert.equal(dashboard.metricGrid.flexDirection, "column");
    assert.equal(dashboard.dashboardGrid.flexDirection, "column");
    assert.equal(dashboard.quickActions.flexDirection, "column");
    assert.equal(dashboard.distributionBody.flexDirection, "row");
    assert.equal(dashboard.distributionBody.flexWrap, "wrap");
    assert.equal(dashboard.statusContent.flexDirection, "row");
    assert.equal(dashboard.statusContent.flexWrap, "wrap");
  }
});

test("platform control targets use 44 points on iOS and 48 dp on Android", () => {
  for (const [os, minimum] of [
    ["ios", 44],
    ["android", 48],
  ]) {
    const h = harness(320, "light", { os, fontScale: 2 });
    const { controlMetrics } = h.load(path.join(mobile, "theme/theme.ts"));
    assert.equal(controlMetrics.minimumTouchSize, minimum);
    const chrome = h
      .load(path.join(mobile, "layouts/WorkspaceChrome.styles.ts"))
      .createWorkspaceChromeStyles(h.colors, 320);
    assert.ok(chrome.iconButton.width >= minimum);
    assert.ok(chrome.iconButton.height >= minimum);
    const { SegmentedControl } = h.load(
      path.join(mobile, "components/SegmentedControl.tsx"),
    );
    let selected;
    const nodes = h.expand(
      SegmentedControl({
        options: ["All memberships", "Active memberships"],
        value: "All memberships",
        onChange: (value) => (selected = value),
      }),
    );
    const buttons = nodes.filter((n) => n.type === "Pressable");
    assert.equal(buttons.length, 2);
    assert.ok(flattenStyle(buttons[0].props.style).minHeight >= minimum);
    assert.equal(buttons[0].props.accessibilityState.selected, true);
    assert.equal(
      nodes
        .filter((n) => n.type === "Text")
        .every((n) => n.props.numberOfLines === undefined),
      true,
    );
    buttons[1].props.onPress();
    assert.equal(selected, "Active memberships");
  }
});

test("buttons retain pending/disabled semantics and remove scaling feedback for reduced motion", () => {
  for (const reduceMotion of [false, true]) {
    const h = harness(390, "dark", { reduceMotion });
    const { PrimaryButton } = h.load(
      path.join(mobile, "components/PrimaryButton.tsx"),
    );
    const onPress = () => {};
    const ready = PrimaryButton({ title: "Save changes", onPress });
    assert.equal(ready.props.onPress, onPress);
    assert.equal(ready.props.accessibilityLabel, "Save changes");
    const pressed = flattenStyle(ready.props.style({ pressed: true }));
    assert.equal(Boolean(pressed.transform), !reduceMotion);
    const pending = PrimaryButton({
      title: "Save changes",
      onPress,
      loading: true,
    });
    assert.equal(pending.props.disabled, true);
    assert.deepEqual(pending.props.accessibilityState, {
      disabled: true,
      busy: true,
    });
    assert.equal(
      h.expand(pending).some((n) => n.type === "ActivityIndicator"),
      true,
    );
    const disabled = PrimaryButton({
      title: "Save changes",
      onPress,
      disabled: true,
    });
    assert.equal(disabled.props.disabled, true);
  }
});

test("form fields preserve input callbacks and announce required/error information", () => {
  const h = harness(320, "light", { os: "android", fontScale: 2 });
  const { FormTextField } = h.load(
    path.join(mobile, "components/FormTextField.tsx"),
  );
  let changes = [],
    focus = 0,
    blur = 0;
  const onChangeText = (value) => changes.push(value);
  const nodes = h.expand(
    FormTextField({
      label: "Email",
      required: true,
      error: "Enter a valid email",
      value: "invalid",
      keyboardType: "email-address",
      maxLength: 120,
      onChangeText,
      onFocus: () => focus++,
      onBlur: () => blur++,
    }),
  );
  const input = nodes.find((n) => n.type === "TextInput");
  assert.equal(input.props.value, "invalid");
  assert.equal(input.props.keyboardType, "email-address");
  assert.equal(input.props.maxLength, 120);
  assert.equal(
    input.props.accessibilityLabel,
    "Email, required, invalid entry",
  );
  assert.equal(input.props.accessibilityHint, "Enter a valid email");
  assert.equal(input.props.onChangeText, onChangeText);
  input.props.onChangeText("member@example.com");
  input.props.onFocus({});
  input.props.onBlur({});
  assert.deepEqual(changes, ["member@example.com"]);
  assert.equal(focus, 1);
  assert.equal(blur, 1);
  assert.equal(
    nodes.some((n) => n.props.accessibilityRole === "alert"),
    true,
  );
  assert.equal(
    nodes.some((n) => flattenStyle(n.props.style).borderWidth === 2),
    true,
  );
});

test("onboarding preserves skip, next, final-account and sign-in actions", () => {
  const h = harness(320, "light", { fontScale: 2 });
  const { OnboardingScreenView } = h.load(
    path.join(mobile, "screens/auth/OnboardingScreen.tsx"),
  );
  const calls = [];
  for (const last of [false, true]) {
    const props = {
      slide: {
        image: 1,
        title: "Build a stronger life",
        body: "Track your existing fitness journey.",
      },
      navigation: {
        replace: (route) => calls.push(["replace", route]),
        navigate: (route) => calls.push(["navigate", route]),
      },
      index: last ? 2 : 0,
      last,
      goNext: () => calls.push(["next", last]),
    };
    const nodes = h.expand(
      OnboardingScreenView({ model: { kind: "view1", props } }),
    );
    const primary = nodes.find(
      (n) => n.props.accessibilityLabel === (last ? "Create Account" : "Next"),
    );
    primary.props.onPress();
    const buttons = nodes.filter((n) => n.type === "Pressable");
    buttons[0].props.onPress();
    buttons.at(-1).props.onPress();
    assert.equal(nodes.filter((n) => n.type === "ScrollView").length, 1);
    assert.equal(
      nodes.some((n) => n.props.accessibilityRole === "header"),
      true,
    );
  }
  assert.deepEqual(calls, [
    ["next", false],
    ["replace", "Login"],
    ["navigate", "Login"],
    ["next", true],
    ["replace", "Login"],
    ["navigate", "Login"],
  ]);
});

test("central text and button colors meet 4.5:1 against their primary surfaces", () => {
  function luminance(hex) {
    const rgb = [1, 3, 5]
      .map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255)
      .map((value) =>
        value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
      );
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  }
  function contrast(a, b) {
    const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y);
    return (high + 0.05) / (low + 0.05);
  }
  for (const scheme of ["light", "dark"]) {
    const { colors } = harness(390, scheme);
    for (const background of ["background", "surface"]) {
      for (const foreground of [
        "ink",
        "muted",
        "primary",
        "success",
        "warning",
        "danger",
      ]) {
        assert.ok(
          contrast(colors[foreground], colors[background]) >= 4.5,
          `${scheme}: ${foreground} on ${background}`,
        );
      }
    }
    assert.ok(contrast(colors.white, colors.primaryButton) >= 4.5);
    assert.ok(contrast(colors.white, colors.dangerButton) >= 4.5);
  }
});

test("narrow and large-text calendars keep restrictions, selected state and date callbacks", () => {
  for (const [os, width, fontScale] of [
    ["android", 320, 1],
    ["ios", 390, 2],
  ]) {
    const h = harness(width, "light", { os, fontScale, reduceMotion: true });
    const { DatePickerFieldView } = h.load(
      path.join(mobile, "components/DatePickerField.tsx"),
    );
    const styles = h
      .load(path.join(mobile, "styles/components/DatePickerField.styles.ts"))
      .createStyles(h.colors);
    const changed = [],
      opened = [],
      months = [];
    const valueOf = (date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const props = {
      styles,
      label: "Start date",
      displayDate: (value) => value,
      value: "2026-10-02",
      open: true,
      show() {},
      colors: h.colors,
      setOpen: (value) => opened.push(value),
      width,
      setVisibleMonth: (value) => months.push(value),
      year: 2026,
      month: 9,
      MONTHS: Array.from({ length: 12 }, (_, i) => String(i + 1)),
      WEEKDAYS: ["S", "M", "T", "W", "T", "F", "S"],
      cells: [null, 1, 2],
      dateValue: valueOf,
      minimum: new Date(2026, 9, 2),
      onChange: (value) => changed.push(value),
      todayDisabled: false,
    };
    const nodes = h.expand(
      DatePickerFieldView({ model: { kind: "view1", props } }),
    );
    assert.equal(
      nodes.find((n) => n.type === "Modal").props.animationType,
      "none",
    );
    const day = (label) =>
      nodes.find(
        (n) => n.type === "Pressable" && n.props.accessibilityLabel === label,
      );
    assert.equal(day("2026-10-01").props.disabled, true);
    assert.equal(day("2026-10-02").props.accessibilityState.selected, true);
    const style = flattenStyle(
      day("2026-10-02").props.style({ pressed: false }),
    );
    assert.equal(style.width, "100%");
    assert.ok(style.minHeight >= (os === "android" ? 48 : 44));
    day("2026-10-02").props.onPress();
    assert.deepEqual(changed, ["2026-10-02"]);
    assert.deepEqual(opened, [false]);
    nodes
      .find((n) => n.props.accessibilityLabel === "Next month")
      .props.onPress();
    assert.equal(months[0].getMonth(), 10);
  }
});

test("network error guidance preserves the original error and leaves empty/loading states intact", () => {
  const h = harness(390);
  const { DataState } = h.load(path.join(mobile, "components/DataState.tsx"));
  const failed = h.expand(DataState({ error: "Network Error" }));
  assert.equal(
    failed.some((n) => n.props.accessibilityRole === "alert"),
    true,
  );
  assert.equal(
    failed.some(
      (n) => n.type === "Text" && n.props.children === "Network Error",
    ),
    true,
  );
  assert.equal(
    failed.some(
      (n) =>
        n.type === "Text" &&
        String(n.props.children).startsWith("Check your connection"),
    ),
    true,
  );
  const loading = h.expand(DataState({ loading: true }));
  assert.equal(
    loading.some((n) => n.props.accessibilityState?.busy),
    true,
  );
});

test("member workout tab uses the selected tint and grows with system font size", () => {
  for (const fontScale of [1, 2]) {
    const h = harness(390, "light", { fontScale });
    const { MemberTabsNavigatorView } = h.load(
      path.join(mobile, "navigation/RootNavigator.tsx"),
    );
    const styles = h
      .load(path.join(mobile, "styles/navigation/RootNavigator.styles.ts"))
      .createMemberTabStyles(h.colors, 390, 34);
    const props = {
      MemberTabs: { Navigator: "TabNavigator", Screen: "TabScreen" },
      memberTabNames: ["MemberHome", "MemberWorkout"],
      colors: h.colors,
      styles,
      getMemberTabIcon: () => "barbell",
    };
    const navigator = MemberTabsNavigatorView({
      model: { kind: "view1", props },
    });
    const options = navigator.props.screenOptions({
      route: { name: "MemberWorkout" },
    });
    assert.equal(
      flattenStyle(options.tabBarStyle).height,
      styles.tabBar.height + (fontScale - 1) * 24,
    );
    const icon = h
      .expand(
        options.tabBarIcon({ color: "#6E6E73", focused: false, size: 24 }),
      )
      .find((n) => n.type === "Icon");
    assert.equal(icon.props.color, "#6E6E73");
  }
});

test("keyboard avoidance uses one iOS inset strategy and Android height behavior", () => {
  for (const os of ["ios", "android"]) {
    const h = harness(390, "light", { os });
    const { Screen } = h.load(path.join(mobile, "components/Screen.tsx"));
    const nodes = h.expand(
      Screen({ scroll: true, keyboard: true, children: null }),
    );
    assert.equal(
      nodes.find((n) => n.type === "ScrollView").props
        .automaticallyAdjustKeyboardInsets,
      false,
    );
    assert.equal(
      nodes.find((n) => n.type === "KeyboardAvoidingView").props.behavior,
      os === "ios" ? "padding" : "height",
    );
  }
});

test("reference operation grid keeps permitted actions and destinations in both themes", () => {
  for (const scheme of ["light", "dark"]) {
    const h = harness(320, scheme);
    const { OperationsHubScreenView } = h.load(
      path.join(mobile, "screens/saas/OperationsHubScreen.tsx"),
    );
    const routes = [];
    const model = {
      kind: "view1",
      props: {
        hasPermission: () => true,
        canManageStaff: true,
        navigation: { navigate: (route) => routes.push(route) },
      },
    };
    const nodes = h.expand(OperationsHubScreenView({ model }));
    for (const title of [
      "Add Member",
      "Check-In",
      "Manage Plans",
      "Payments",
      "Attendance",
      "Announcements",
      "Equipment",
      "Reports",
    ]) {
      const action = nodes.find(
        (node) =>
          node.type === "Pressable" && node.props.accessibilityLabel === title,
      );
      assert.ok(action, title);
      const style = flattenStyle(action.props.style({ pressed: false }));
      assert.equal(style.flexBasis, "45%");
      assert.ok(style.minHeight >= 124);
      action.props.onPress();
    }
    assert.deepEqual(routes, [
      "AddMember",
      "Attendance",
      "MembershipPlans",
      "Payments",
      "Attendance",
      "Notifications",
      "WorkoutPlans",
      "Reports",
    ]);
    const restricted = h.expand(
      OperationsHubScreenView({
        model: {
          kind: "view1",
          props: {
            ...model.props,
            hasPermission: () => false,
            canManageStaff: false,
          },
        },
      }),
    );
    assert.ok(
      !restricted.some((node) => node.props.accessibilityLabel === "Payments"),
    );
    assert.ok(
      !restricted.some(
        (node) => node.props.accessibilityLabel === "Add Member",
      ),
    );
  }
});

test("reference members toolbar maps status filters and preserves search, reset and creation", () => {
  const h = harness(390, "light");
  const { MemberListScreenView } = h.load(
    path.join(mobile, "screens/saas/MemberListScreen.tsx"),
  );
  const calls = [];
  const nodes = h.expand(
    MemberListScreenView({
      model: {
        kind: "view3",
        props: {
          colors: h.colors,
          styles: {},
          compact: true,
          memberFilter: "all",
          search: "",
          page: 0,
          sortDirection: "az",
          visibleMembers: [],
          canManageMembers: true,
          membersQuery: { data: [], isLoading: false, isFetching: false },
          deleteMember: {},
          setMemberFilter: (value) => calls.push(["filter", value]),
          setSearch: (value) => calls.push(["search", value]),
          setPage: (value) => calls.push(["page", value]),
          navigation: { navigate: (value) => calls.push(["navigate", value]) },
        },
      },
    }),
  );
  nodes
    .find((node) => node.props.accessibilityLabel === "Add member")
    .props.onPress();
  nodes
    .find((node) => node.props.accessibilityLabel === "Search members")
    .props.onChangeText("Alex");
  const filters = nodes.filter(
    (node) =>
      node.type === "Pressable" &&
      node.props.accessibilityState?.selected !== undefined,
  );
  assert.equal(filters.length, 4);
  filters[3].props.onPress();
  assert.deepEqual(calls, [
    ["navigate", "AddMember"],
    ["search", "Alex"],
    ["page", 0],
    ["filter", "all"],
    ["page", 0],
  ]);
});

test("reference notification rows open details and retain the unread mutation guard", () => {
  for (const scheme of ["light", "dark"]) {
    const h = harness(390, scheme);
    const { NotificationsScreenView } = h.load(
      path.join(mobile, "screens/saas/NotificationsScreen.tsx"),
    );
    const marked = [];
    const data = [
      {
        id: "unread",
        title: "Payment received",
        body: "Receipt ready",
        created_at: new Date().toISOString(),
        status: "unread",
      },
      {
        id: "read",
        title: "Announcement",
        body: "Class update",
        created_at: new Date().toISOString(),
        status: "read",
      },
    ];
    const nodes = h.expand(
      NotificationsScreenView({
        model: {
          kind: "view1",
          props: {
            colors: h.colors,
            query: { data, isLoading: false },
            markRead: { mutate: (id) => marked.push(id), isPending: false },
          },
        },
      }),
    );
    for (const node of nodes.filter((node) =>
      node.props.accessibilityLabel?.includes("Open notification"),
    ))
      node.props.onPress();
    assert.deepEqual(marked, ["unread"]);
    assert.ok(
      nodes.some(
        (node) => node.type === "Icon" && node.props.name === "wallet",
      ),
    );
    assert.ok(
      nodes.some(
        (node) => node.type === "Icon" && node.props.name === "megaphone",
      ),
    );
  }
});

test("reference home and analytics render real zero states rather than sample metrics in both themes", () => {
  for (const scheme of ["light", "dark"]) {
    const h = harness(320, scheme, { fontScale: 2 });
    const { OwnerMobileOverview } = h.load(
      path.join(mobile, "components/OwnerMobileOverview.tsx"),
    );
    const { PulseAnalytics } = h.load(
      path.join(mobile, "components/PulseAnalytics.tsx"),
    );
    const home = h.expand(
      OwnerMobileOverview({
        totalMembers: 0,
        activeMembers: 0,
        revenue: 0,
        onMembers() {},
        onReports() {},
        onMember() {},
      }),
    );
    const analytics = h.expand(PulseAnalytics({ payments: [] }));
    const homeText = home
      .filter((node) => node.type === "Text")
      .map((node) => node.props.children)
      .flat()
      .join(" ");
    assert.ok(homeText.includes("Total Members"));
    assert.ok(homeText.includes("New Members"));
    assert.ok(homeText.includes("Expiring Soon"));
    assert.ok(!homeText.includes("248"));
    const chartText = analytics
      .filter((node) => node.type === "Text")
      .map((node) => node.props.children)
      .flat()
      .join(" ");
    assert.ok(chartText.includes("New Members"));
    assert.ok(chartText.includes("Member Growth"));
    assert.ok(!chartText.includes("12,480"));
    const chips = analytics.filter(
      (node) =>
        node.type === "Pressable" &&
        node.props.accessibilityState?.selected !== undefined,
    );
    assert.equal(chips.length, 4);
  }
});

test("reference profile exposes grouped settings while preserving staff and subscription permissions", () => {
  for (const scheme of ["light", "dark"]) {
    const h = harness(390, scheme);
    const { ProfileScreenView } = h.load(
      path.join(mobile, "screens/saas/ProfileScreen.tsx"),
    );
    const destinations = [];
    const props = {
      styles: {},
      user: {
        full_name: "Owner Name",
        email: "owner@example.test",
        role: "gym_owner",
        permissions: ["manage_membership_plans"],
      },
      canManageStaff: true,
      navigation: { navigate: (route) => destinations.push(route) },
      logout: {},
      confirmLogout() {},
    };
    const nodes = h.expand(
      ProfileScreenView({ model: { kind: "view1", props } }),
    );
    for (const label of [
      "Account Settings",
      "Manage Staff",
      "Subscription & Billing",
    ])
      nodes
        .find((node) => node.props.accessibilityLabel === label)
        .props.onPress();
    assert.deepEqual(destinations, ["Settings", "Staff", "MembershipPlans"]);
    for (const label of [
      "Gym Information",
      "App Preferences",
      "Help & Support",
      "About",
    ])
      assert.ok(nodes.some((node) => node.props.accessibilityLabel === label));
    const restricted = h.expand(
      ProfileScreenView({
        model: {
          kind: "view1",
          props: {
            ...props,
            canManageStaff: false,
            user: { ...props.user, role: "trainer", permissions: [] },
          },
        },
      }),
    );
    assert.ok(
      !restricted.some(
        (node) => node.props.accessibilityLabel === "Manage Staff",
      ),
    );
    assert.ok(
      !restricted.some(
        (node) => node.props.accessibilityLabel === "Subscription & Billing",
      ),
    );
  }
});

test("video regression: gym fields stretch in phone and tablet containers", () => {
  for (const width of [320, 375, 390, 768]) {
    const h = harness(width, "dark", { fontScale: 2 });
    const { createStyles } = h.load(
      path.join(mobile, "styles/features/operations/GymPanels.styles.ts"),
    );
    const grid = createStyles(h.colors, width).fieldGrid;
    assert.equal(grid.flexDirection, "column");
    assert.equal(grid.alignItems, "stretch");
    const { FormTextField } = h.load(
      path.join(mobile, "components/FormTextField.tsx"),
    );
    const nodes = h.expand(
      FormTextField({
        label: "Public business email",
        leftIcon: "mail-outline",
        value: "",
        onChangeText() {},
      }),
    );
    const field = flattenStyle(nodes[0].props.style);
    assert.equal(field.width, "100%");
    assert.equal(field.alignSelf, "stretch");
    assert.equal(field.minWidth, 0);
    const input = nodes.find((node) => node.type === "TextInput");
    assert.equal(input.props.accessibilityLabel, "Public business email");
  }
});

test("video regression: empty revenue avoids fabricated or duplicated axis ticks", () => {
  const h = harness(375);
  const { PulseAnalytics } = h.load(
    path.join(mobile, "components/PulseAnalytics.tsx"),
  );
  const nodes = h.expand(PulseAnalytics({ payments: [] }));
  const text = nodes
    .filter((node) => node.type === "Text")
    .flatMap((node) => node.props.children)
    .join(" ");
  assert.ok(text.includes("No paid revenue in this period."));
  assert.ok(!text.includes("0.01"));
});

test("video regression: phone Staff hides the desktop column header", () => {
  const h = harness(375);
  const { StaffScreenView } = h.load(
    path.join(mobile, "screens/saas/StaffScreen.tsx"),
  );
  const props = {
    styles: {},
    colors: h.colors,
    compact: true,
    usersQuery: { data: [], isLoading: false },
    countsQuery: {},
    users: [],
    counts: { trainer: 0, receptionist: 0, sub_admin: 0 },
    roleOptions: [],
    roleFilter: "all",
    deactivateUser: {},
    user: { role: "gym_owner" },
    CountCard: () => null,
    search: "",
  };
  const nodes = h.expand(StaffScreenView({ model: { kind: "view2", props } }));
  assert.ok(
    !nodes.some(
      (node) => node.type === "Text" && node.props.children === "Joined On",
    ),
  );
  assert.ok(
    !nodes.some(
      (node) => node.type === "Text" && node.props.children === "Actions",
    ),
  );
});

test("expanded mobile redesign keeps Attendance and workout cards within phone widths", () => {
  for (const width of [320, 375, 390, 768]) {
    for (const scheme of ["light", "dark"]) {
      const h = harness(width, scheme);
      const attendance = h.load(
        path.join(mobile, "styles/screens/saas/AttendanceScreen.styles.ts"),
      );
      const styles = attendance.createStyles(h.colors);
      assert.equal(styles.middleGrid.flexDirection, "column");
      assert.equal(styles.middleCard.width, "100%");
      assert.equal(styles.activityList.minWidth, 0);
      assert.equal(styles.activityList.width, "100%");
      assert.ok(styles.activityRing.width <= 160);
      const metric = attendance.createDashboardStyles(h.colors).statCard;
      assert.equal(metric.minWidth, 0);
      assert.equal(metric.flexBasis, "45%");
      const workout = h
        .load(
          path.join(mobile, "styles/screens/saas/WorkoutPlansScreen.styles.ts"),
        )
        .createStyles(h.colors);
      assert.equal(workout.stats.flexWrap, "wrap");
      assert.equal(workout.stat.minWidth, 0);
      const qr = h
        .load(
          path.join(
            mobile,
            "styles/components/dashboard/DailyAttendancePanel.styles.ts",
          ),
        )
        .makeStyles(h.colors, true);
      assert.equal(qr.layout.flexDirection, "column");
      assert.equal(qr.metrics.flexWrap, "wrap");
    }
  }
});

test("workout redesign retains create action and live records without hardcoded metric cards", () => {
  const h = harness(375);
  const { WorkoutPlansScreenView } = h.load(
    path.join(mobile, "screens/saas/WorkoutPlansScreen.tsx"),
  );
  let createRequested = false;
  const nodes = h.expand(
    WorkoutPlansScreenView({
      model: {
        kind: "view2",
        props: {
          styles: {},
          createRequest: 0,
          setCreateRequest: () => {
            createRequested = true;
          },
        },
      },
    }),
  );
  nodes
    .find((node) => node.props.accessibilityLabel === "Create New Plan")
    .props.onPress();
  assert.equal(createRequested, true);
  assert.ok(
    !nodes.some(
      (node) =>
        node.type === "Text" && node.props.children === "No plans created yet",
    ),
  );
});

test("shared headers and panel sizing adapt to phones, split windows and tablets", () => {
  for (const width of [280, 320, 390, 600, 768, 1024, 1366]) {
    const h = harness(width, "light", { fontScale: 2 });
    const theme = h.load(path.join(mobile, "theme/theme.ts"));
    const font = theme.getResponsiveFontSize(width, 28);
    assert.ok(font >= 26 && font <= 32, `${width}: ${font}`);
    const adapt = h.load(
      path.join(mobile, "styles/adaptPageStyles.ts"),
    ).adaptPageStyles;
    const styles = adapt({
      panel: { width: 315, minWidth: 250 },
      actions: { flexDirection: "row" },
    });
    assert.equal(styles.panel.width, "100%");
    assert.equal(styles.panel.minWidth, 0);
    assert.equal(styles.actions.flexWrap, "wrap");
  }
});
