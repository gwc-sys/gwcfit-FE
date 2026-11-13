export type MemberWorkoutRouteParams =
  | {
      tab?: "plans" | "classes" | "schedule";
      workoutPlanUuid?: string;
      authUid?: string | null;
    }
  | undefined;

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
  AccountRecovery: undefined;
  AppTabs: { screen?: keyof MemberTabParamList; params?: Record<string, unknown> } | undefined;
  MemberProfileHome: undefined;
  MemberMembership: undefined;
  MemberAttendance: undefined;
  MemberWorkout: MemberWorkoutRouteParams;
  MemberWorkoutDetail: { workoutPlanUuid: string };
  MemberExerciseDetail: { workoutPlanUuid: string; exerciseIndex: number };
  MemberWorkoutSession: { workoutPlanUuid: string; exerciseIndex?: number };
  MemberMealPlan: undefined;
  MemberProgress: undefined;
  MemberTrainer: undefined;
  MemberClasses: MemberWorkoutRouteParams;
  MemberNotifications: undefined;
  MemberGoals: undefined;
  MemberRewards: undefined;
  MemberSupport: undefined;
  MemberSettings: undefined;
  ManageGyms: undefined;
  CreateGymAdmin: undefined;
  Invitations: { enquiryId?: string } | undefined;
  Staff: undefined;
  MemberList: undefined;
  MemberClaims: undefined;
  AddMember: undefined;
  EditMember: { memberId: string };
  MemberProfile: { memberId?: string } | undefined;
  Attendance: undefined;
  FeaturePlaceholder: { title: string; message: string } | undefined;
  Payments: undefined;
  MembershipPlans: undefined;
  Trainers: undefined;
  WorkoutPlans: undefined;
  DietPlans: { view?: "foods" | "plans" } | undefined;
  Reports: undefined;
  RatingsFeedback: undefined;
  Notifications: undefined;
  Settings: undefined;
  Profile: undefined;
  AccessDenied: { reason?: string } | undefined;
  MainTabs: undefined;
  AIWorkoutGenerator: undefined;
  Operations: undefined;
  WorkoutPlan: { planId?: string } | undefined;
  ExerciseDetail: { exerciseId?: string } | undefined;
  DietPlan: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Directory: undefined;
  Workflows: undefined;
  Reports: undefined;
  Profile: undefined;
};

export type MemberTabParamList = {
  MemberHome: { authUid?: string | null } | undefined;
  MemberAttendance: undefined;
  MemberWorkout: MemberWorkoutRouteParams;
  MemberMealPlan: undefined;
  MemberProgress: undefined;
  MemberProfileHome: undefined;
};
