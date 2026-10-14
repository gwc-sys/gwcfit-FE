import { type ReactNode } from "react";
import { View } from "react-native";
import type * as React from "react";
import type { useMemberDesktopLayoutPresentation } from "../../../components/member/MemberDesktopLayout";

export function MemberDesktopLayoutView({ model }: { model: ReturnType<typeof useMemberDesktopLayoutPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, colors, children } = model.props;
      return ((
      <View
        style={[styles.mobileShell, { backgroundColor: colors.background }]}
      >
        {children}
      </View>
    ));
    }
    case "view2": {
      const { styles, colors, content } = model.props;
      return <View style={[styles.mobileShell, { backgroundColor: colors.background }]}>{content}</View>;

    }
  }
}
