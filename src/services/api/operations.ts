import { apiClient } from "./client";
import type {
  Attendance,
  AttendanceCreatePayload,
  AttendanceUpdatePayload,
  DietPlan,
  DietPlanCreatePayload,
  DietPlanUpdatePayload,
  Gym,
  DeveloperGym,
  GymCreatePayload,
  GymUpdatePayload,
  GymUser,
  ManagedUser,
  ManagedUserRole,
  MembershipPlan,
  MembershipPlanCreatePayload,
  MembershipPlanUpdatePayload,
  MessageResponse,
  Payment,
  PaymentCreatePayload,
  PaymentUpdatePayload,
  Trainer,
  TrainerCreatePayload,
  TrainerUpdatePayload,
  RoleName,
  UserCreatePayload,
  UserRoleCounts,
  UserUpdatePayload,
  WorkoutPlan,
  WorkoutPlanCreatePayload,
  WorkoutPlanUpdatePayload
} from "../../types/saas";

export type ListParams = {
  skip?: number;
  limit?: number;
  gym_id?: string;
};

export type StaffListParams = ListParams & {
  q?: string;
  role?: RoleName;
};

export type UserListParams = ListParams & {
  q?: string;
  role?: ManagedUserRole;
  gym_id?: string;
};

type CrudApi<TRead, TCreate, TUpdate> = {
  list: (params?: ListParams) => Promise<TRead[]>;
  get: (id: string) => Promise<TRead>;
  create: (payload: TCreate) => Promise<TRead>;
  update: (id: string, payload: TUpdate) => Promise<TRead>;
  remove: (id: string) => Promise<MessageResponse>;
};

function createCrudApi<TRead, TCreate, TUpdate>(basePath: string): CrudApi<TRead, TCreate, TUpdate> {
  return {
    async list(params?: ListParams) {
      const response = await apiClient.get<TRead[]>(basePath, { params });
      return response.data;
    },
    async get(id: string) {
      const response = await apiClient.get<TRead>(`${basePath}/${id}`);
      return response.data;
    },
    async create(payload: TCreate) {
      const response = await apiClient.post<TRead>(basePath, payload);
      return response.data;
    },
    async update(id: string, payload: TUpdate) {
      const response = await apiClient.patch<TRead>(`${basePath}/${id}`, payload);
      return response.data;
    },
    async remove(id: string) {
      const response = await apiClient.delete<MessageResponse>(`${basePath}/${id}`);
      return response.data;
    }
  };
}

export const gymsApi = {
  async list(params?: ListParams) {
    const response = await apiClient.get<Gym[]>("/gyms", { params });
    return response.data;
  },
  async create(payload: GymCreatePayload) {
    const response = await apiClient.post<Gym>("/gyms", payload);
    return response.data;
  },
  async getMyGym() {
    const response = await apiClient.get<Gym>("/gyms/me");
    return response.data;
  },
  async updateMyGym(payload: GymUpdatePayload) {
    const response = await apiClient.patch<Gym>("/gyms/me", payload);
    return response.data;
  },
  async get(gymId: string) {
    const response = await apiClient.get<Gym>(`/gyms/${gymId}`);
    return response.data;
  },
  async listDeveloper() {
    const response = await apiClient.get<DeveloperGym[]>("/developer/gyms");
    return response.data;
  },
  async suspend(gymId: string) {
    const response = await apiClient.post<Gym>(`/gyms/${gymId}/suspend`);
    return response.data;
  },
  async remove(gymId: string) {
    const response = await apiClient.delete<MessageResponse>(`/gyms/${gymId}`);
    return response.data;
  }
};

export const trainersApi = createCrudApi<Trainer, TrainerCreatePayload, TrainerUpdatePayload>("/trainers");
export const staffApi = {
  async list(params?: StaffListParams) {
    const response = await apiClient.get<GymUser[]>("/staff", { params });
    return response.data;
  }
};
export const usersApi = {
  async list(params?: UserListParams) {
    const response = await apiClient.get<ManagedUser[]>("/users", { params });
    return response.data;
  },
  async counts(params?: Pick<UserListParams, "gym_id">) {
    const response = await apiClient.get<UserRoleCounts>("/users/counts", { params });
    return response.data;
  },
  async create(payload: UserCreatePayload) {
    const response = await apiClient.post<ManagedUser>("/users", payload);
    return response.data;
  },
  async update(userId: string, payload: UserUpdatePayload) {
    const response = await apiClient.patch<ManagedUser>(`/users/${userId}`, payload);
    return response.data;
  },
  async remove(userId: string) {
    const response = await apiClient.delete<MessageResponse>(`/users/${userId}`);
    return response.data;
  }
};
export const attendanceApi = {
  ...createCrudApi<Attendance, AttendanceCreatePayload, AttendanceUpdatePayload>("/attendance"),
  async scanQr(token: string) {
    const response = await apiClient.post<Attendance>("/attendance/scan-qr", { token });
    return response.data;
  },
  async dailyQr() {
    const response = await apiClient.get<import("../../types/saas").DailyAttendanceQr>("/attendance/daily/qr");
    return response.data;
  },
  async today() {
    const response = await apiClient.get<import("../../types/saas").DailyAttendanceStats>("/attendance/daily/today");
    return response.data;
  },
  async scanDailyQr(token: string) {
    const response = await apiClient.post<Attendance>("/attendance/daily/scan", { token });
    return response.data;
  }
};
export const paymentsApi = createCrudApi<Payment, PaymentCreatePayload, PaymentUpdatePayload>("/payments");
export const membershipPlansApi = createCrudApi<
  MembershipPlan,
  MembershipPlanCreatePayload,
  MembershipPlanUpdatePayload
>("/membership-plans");
export const workoutPlansApi = createCrudApi<WorkoutPlan, WorkoutPlanCreatePayload, WorkoutPlanUpdatePayload>(
  "/workout-plans"
);
export const dietPlansApi = createCrudApi<DietPlan, DietPlanCreatePayload, DietPlanUpdatePayload>("/diet-plans");
