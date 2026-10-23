export const memberServices = [
  { title: "Membership", description: "Plan, status and renewal dates", icon: "ribbon-outline", route: "MemberMembership" },
  { title: "Payments", description: "Recorded payments and balances", icon: "card-outline", route: "MemberPayments" },
  { title: "Meal plan", description: "Meals, nutrition and water tracking", icon: "restaurant-outline", route: "MemberMealPlan" },
  { title: "My trainer", description: "Trainer details and assigned plans", icon: "person-outline", route: "MemberTrainer" },
  { title: "Classes", description: "Book or cancel gym classes", icon: "calendar-outline", route: "MemberClasses" },
  { title: "Goals", description: "Create and track your goals", icon: "flag-outline", route: "MemberGoals" },
  { title: "Rewards", description: "Your challenges and badges", icon: "trophy-outline", route: "MemberRewards" },
  { title: "Notifications", description: "Gym updates and unread messages", icon: "notifications-outline", route: "MemberNotifications" },
  { title: "Support", description: "Send a request to your gym", icon: "chatbubbles-outline", route: "MemberSupport" },
  { title: "Settings", description: "Appearance, password and sign out", icon: "settings-outline", route: "MemberSettings" },
] as const;

export type MemberServiceRoute = typeof memberServices[number]["route"];

