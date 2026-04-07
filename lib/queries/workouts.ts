// lib/queries/workouts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

// =============================================
// Types
// =============================================
export type Exercise = {
  _id: string;
  name: string;
  category: string;
  muscleGroups: string[];
  equipment?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  animationUrl?: string;
  thumbnailUrl?: string;
  instructions?: string[];
  tips?: string[];
  isActive: boolean;
  isCustom?: boolean;
  createdBy?: { _id: string; name: string };
};

export type WorkoutTemplate = {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  difficulty?: string;
  durationWeeks?: number;
  daysPerWeek?: number;
  weeklySchedule?: WorkoutTemplateDay[];
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  isFeatured?: boolean;
  targetAudience?: string;
  equipmentRequired?: string[];
  avgWorkoutDuration?: number;
  thumbnailUrl?: string;
  tags?: string[];
};

export type WorkoutTemplateExercise = {
  exerciseId: string | Exercise;
  order: number;
  reps?: number;
  duration?: number;
  weight?: string;
  restSeconds?: number;
  notes?: string;
};

export type WorkoutTemplateDay = {
  _id?: string;
  dayNumber: number;
  dayName?: string;
  isRestDay: boolean;
  focusArea?: string;
  estimatedDuration?: number;
  exercises?: WorkoutTemplateExercise[];
};

export type WeeklySchedule = {
  dayOfWeek: number;
  dayName: string;
  isRestDay: boolean;
  focusArea?: string;
  exercises?: WorkoutExercise[];
};

export type WorkoutExercise = {
  exerciseId?: string;
  exerciseName: string;
  reps?: string;
  weight?: string;
  duration?: string;
  restSeconds?: number;
  notes?: string;
  order: number;
};

export type CoachWorkoutPlan = {
  _id: string;
  coachId: string;
  name: string;
  description?: string;
  category?: string;
  difficulty?: string;
  durationWeeks?: number;
  daysPerWeek?: number;
  subscriptionPlanIds: Array<{ _id: string; title: string }>;
  weeklySchedule?: WorkoutDay[];
  equipmentRequired?: string[];
  isActive: boolean;
  isDraft: boolean;
  createdAt: string;
};

export type WorkoutDay = {
  _id?: string;
  dayOfWeek?: number;
  dayNumber?: number;
  dayName?: string;
  isRestDay: boolean;
  restDayNotes?: string;
  focusArea?: string;
  workouts?: WorkoutSession[];
};

export type WorkoutSession = {
  _id?: string;
  name?: string;
  description?: string;
  estimatedDuration?: number;
  exercises?: PlanExercise[];
};

export type PlanExercise = {
  _id?: string;
  exerciseId?: string | Exercise;
  exerciseName?: string;
  exerciseAnimationUrl?: string;
  order: number;
  reps?: number;
  duration?: number;
  restSeconds?: number;
  weight?: string;
  notes?: string;
};

export type ClientWorkoutLog = {
  _id: string;
  clientId: string;
  workoutPlanId: string | { _id: string; name: string };
  scheduledDate: string;
  date?: string;
  dayOfWeek: number;
  workoutName?: string;
  sessionName?: string;
  status: "rest_day" | "scheduled" | "in_progress" | "completed" | "missed" | "partial";
  exerciseLogs?: ExerciseLog[];
  actualDuration?: number;
  caloriesBurned?: number;
  clientNotes?: string;
  createdAt: string;
};

export type CompleteWorkoutPayload = {
  exerciseLogs?: ExerciseLog[];
  actualDuration?: number;
  caloriesBurned?: number;
  overallDifficulty?: number;
  energyLevel?: number;
  moodAfter?: number;
  clientNotes?: string;
  // Backward-compat aliases (older UI)
  totalDuration?: number;
  notes?: string;
};

export type MarkWorkoutMissedPayload = {
  reason?: string;
};

export type ExerciseLog = {
  exerciseId?: string;
  exerciseName: string;
  plannedReps?: number;
  plannedDuration?: number;
  actualReps?: number[];
  weightUsed?: number[];
  actualDuration?: number;
  completed: boolean;
  skipped?: boolean;
  skipReason?: string;
  difficultyRating?: number;
  notes?: string;
};

export type ClientTodayWorkout = {
  _id?: string;
  planId?: string;
  planName?: string;
  workoutPlanId?: string;
  workoutPlanName?: string;
  dayOfWeek?: number;
  dayName?: string;
  focus?: string;
  isRestDay?: boolean;
  restDayNotes?: string;
  status?: ClientWorkoutLog["status"];
  exercises?: Array<{
    _id?: string;
    order?: number;
    exerciseId?: string | Exercise;
    exerciseName?: string;
    name?: string;
    reps?: number;
    repsMin?: number;
    repsMax?: number;
    duration?: number;
    restSeconds?: number;
    weight?: string;
    notes?: string;
  }>;
  completed?: boolean;
  log?: ClientWorkoutLog;
};

export type WorkoutStats = {
  totalWorkouts: number;
  completed: number;
  partial: number;
  missed: number;
  scheduled: number;
  completionRate: number;
  totalDuration: number;
  totalCaloriesBurned: number;
  averageDifficulty: number;
  streak: number;
  todayCompleted: boolean;
  yesterdayCompleted: boolean;
};

// =============================================
// Query Keys
// =============================================
export const EXERCISES_KEY = ["exercises"] as const;
export const WORKOUT_TEMPLATES_KEY = ["workoutTemplates"] as const;
export const COACH_WORKOUT_PLANS_KEY = ["coachWorkoutPlans"] as const;
export const CLIENT_WORKOUT_PLANS_KEY = ["clientWorkoutPlans"] as const;
export const CLIENT_WORKOUT_LOGS_KEY = ["clientWorkoutLogs"] as const;
export const CLIENT_TODAY_WORKOUT_KEY = [...CLIENT_WORKOUT_PLANS_KEY, "today"] as const;
export const COACH_CLIENT_WORKOUT_LOGS_KEY = ["coachClientWorkoutLogs"] as const;
export const COACH_CLIENT_WORKOUT_STATS_KEY = ["coachClientWorkoutStats"] as const;

// =============================================
// Exercise Queries (Admin)
// =============================================
type ExercisesResponse = {
  success: boolean;
  data: Exercise[];
  pagination: { total: number; page: number; totalPages: number; limit: number };
};

export const fetchExercises = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  muscleGroup?: string;
  difficulty?: string;
}): Promise<ExercisesResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.category) searchParams.append("category", params.category);
  if (params?.muscleGroup) searchParams.append("muscleGroup", params.muscleGroup);
  if (params?.difficulty) searchParams.append("difficulty", params.difficulty);

  const res = await api.get(`/exercises?${searchParams.toString()}`);
  return res.data;
};

export function useExercises(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  muscleGroup?: string;
  difficulty?: string;
}) {
  return useQuery({
    queryKey: [...EXERCISES_KEY, params],
    queryFn: () => fetchExercises(params),
  });
}

export function useExerciseMetadata() {
  return useQuery({
    queryKey: [...EXERCISES_KEY, "metadata"],
    queryFn: async () => {
      const res = await api.get("/exercises/metadata");
      return res.data.data;
    },
  });
}

// =============================================
// Workout Template Queries (Admin)
// =============================================
type WorkoutTemplatesResponse = {
  success: boolean;
  data: WorkoutTemplate[];
  pagination: { total: number; page: number; totalPages: number; limit: number };
};

export const fetchWorkoutTemplates = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  difficulty?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}): Promise<WorkoutTemplatesResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.category) searchParams.append("category", params.category);
  if (params?.difficulty) searchParams.append("difficulty", params.difficulty);
  if (params?.isActive !== undefined) searchParams.append("isActive", params.isActive.toString());
  if (params?.isFeatured !== undefined) searchParams.append("isFeatured", params.isFeatured.toString());

  const res = await api.get(`/workout-templates?${searchParams.toString()}`);
  return res.data;
};

export function useWorkoutTemplates(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  difficulty?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}) {
  return useQuery({
    queryKey: [...WORKOUT_TEMPLATES_KEY, params],
    queryFn: () => fetchWorkoutTemplates(params),
  });
}

export function useWorkoutTemplate(id: string) {
  return useQuery({
    queryKey: [...WORKOUT_TEMPLATES_KEY, id],
    queryFn: async () => {
      const res = await api.get(`/workout-templates/${id}`);
      return res.data.data as WorkoutTemplate;
    },
    enabled: !!id,
  });
}

// =============================================
// Coach Workout Plan Queries
// =============================================
type CoachWorkoutPlansResponse = {
  success: boolean;
  data: CoachWorkoutPlan[];
  pagination: { total: number; page: number; totalPages: number; limit: number };
};

export const fetchCoachWorkoutPlans = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
}): Promise<CoachWorkoutPlansResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.category) searchParams.append("category", params.category);
  if (params?.isActive !== undefined) searchParams.append("isActive", params.isActive.toString());

  const res = await api.get(`/coach/workout-plans?${searchParams.toString()}`);
  return res.data;
};

export function useCoachWorkoutPlans(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
}) {
  return useQuery({
    queryKey: [...COACH_WORKOUT_PLANS_KEY, params],
    queryFn: () => fetchCoachWorkoutPlans(params),
  });
}

export function useCoachWorkoutPlan(id: string) {
  return useQuery({
    queryKey: [...COACH_WORKOUT_PLANS_KEY, id],
    queryFn: async () => {
      const res = await api.get(`/coach/workout-plans/${id}`);
      return res.data.data as CoachWorkoutPlan;
    },
    enabled: !!id,
  });
}

// =============================================
// Client Workout Queries
// =============================================
export function useClientWorkoutPlans() {
  return useQuery({
    queryKey: CLIENT_WORKOUT_PLANS_KEY,
    queryFn: async () => {
      const res = await api.get("/client/workouts/plans");
      return res.data.data as CoachWorkoutPlan[];
    },
  });
}

export function useClientWorkoutPlan(id: string) {
  return useQuery({
    queryKey: [...CLIENT_WORKOUT_PLANS_KEY, id],
    queryFn: async () => {
      const res = await api.get(`/client/workouts/plans/${id}`);
      return res.data.data as CoachWorkoutPlan;
    },
    enabled: !!id,
  });
}

export function useClientTodayWorkout() {
  return useQuery<ClientTodayWorkout[]>({
    queryKey: CLIENT_TODAY_WORKOUT_KEY,
    queryFn: async () => {
      const res = await api.get("/client/workouts/today");
      const data = res.data.data;
      return Array.isArray(data) ? (data as ClientTodayWorkout[]) : [];
    },
  });
}

export function useClientWorkoutLogs(params?: {
  page?: number;
  limit?: number;
  workoutPlanId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.workoutPlanId) searchParams.append("workoutPlanId", params.workoutPlanId);
  if (params?.startDate) searchParams.append("startDate", params.startDate);
  if (params?.endDate) searchParams.append("endDate", params.endDate);

  return useQuery({
    queryKey: [...CLIENT_WORKOUT_LOGS_KEY, params],
    queryFn: async () => {
      const res = await api.get(`/client/workouts/history?${searchParams.toString()}`);
      return res.data;
    },
  });
}

export function useClientWorkoutStats(days = 30) {
  return useQuery({
    queryKey: [...CLIENT_WORKOUT_LOGS_KEY, "stats", days],
    queryFn: async () => {
      const res = await api.get(`/client/workouts/stats?period=${days}`);
      return res.data.data;
    },
  });
}

export function useCoachClientWorkoutLogs(
  clientId: string,
  params?: {
    page?: number;
    limit?: number;
    workoutPlanId?: string;
    startDate?: string;
    endDate?: string;
  }
) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.workoutPlanId) searchParams.append("workoutPlanId", params.workoutPlanId);
  if (params?.startDate) searchParams.append("startDate", params.startDate);
  if (params?.endDate) searchParams.append("endDate", params.endDate);

  const query = searchParams.toString();
  const endpoint = `/client/workouts/coach/clients/${clientId}/history${query ? `?${query}` : ""}`;

  return useQuery({
    queryKey: [...COACH_CLIENT_WORKOUT_LOGS_KEY, clientId, params],
    queryFn: async () => {
      const res = await api.get(endpoint);
      return res.data;
    },
    enabled: Boolean(clientId),
  });
}

export function useCoachClientWorkoutStats(clientId: string, days = 30) {
  return useQuery<WorkoutStats>({
    queryKey: [...COACH_CLIENT_WORKOUT_STATS_KEY, clientId, days],
    queryFn: async () => {
      const res = await api.get(`/client/workouts/coach/clients/${clientId}/stats?period=${days}`);
      return res.data.data as WorkoutStats;
    },
    enabled: Boolean(clientId),
  });
}

// =============================================
// Mutations
// =============================================
export function useCreateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Exercise>) => {
      const res = await api.post("/exercises", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXERCISES_KEY });
    },
  });
}

export function useUpdateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Exercise> }) => {
      const res = await api.patch(`/exercises/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXERCISES_KEY });
    },
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/exercises/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXERCISES_KEY });
    },
  });
}

export function useCreateCoachWorkoutPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<CoachWorkoutPlan>) => {
      const res = await api.post("/coach/workout-plans", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COACH_WORKOUT_PLANS_KEY });
    },
  });
}

export function useUpdateCoachWorkoutPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CoachWorkoutPlan> }) => {
      const res = await api.patch(`/coach/workout-plans/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COACH_WORKOUT_PLANS_KEY });
    },
  });
}

export function useDeleteCoachWorkoutPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/coach/workout-plans/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COACH_WORKOUT_PLANS_KEY });
    },
  });
}

export function useCreateFromWorkoutTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ templateId, data }: { templateId: string; data: { name?: string; subscriptionPlanIds?: string[] } }) => {
      const res = await api.post(`/coach/workout-plans/from-template/${templateId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COACH_WORKOUT_PLANS_KEY });
    },
  });
}

export function useCreateWorkoutTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<WorkoutTemplate>) => {
      const res = await api.post("/workout-templates", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKOUT_TEMPLATES_KEY });
    },
  });
}

export function useUpdateWorkoutTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WorkoutTemplate> }) => {
      const res = await api.patch(`/workout-templates/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKOUT_TEMPLATES_KEY });
    },
  });
}

export function useDeleteWorkoutTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/workout-templates/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKOUT_TEMPLATES_KEY });
    },
  });
}

export function useUpdateWorkoutLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ClientWorkoutLog> }) => {
      const res = await api.patch(`/client/workouts/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENT_WORKOUT_LOGS_KEY });
    },
  });
}

export function useCompleteWorkoutLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CompleteWorkoutPayload }) => {
      const payload: CompleteWorkoutPayload = { ...data };

      // Normalize legacy keys -> backend contract
      if (payload.actualDuration === undefined && payload.totalDuration !== undefined) {
        payload.actualDuration = payload.totalDuration;
      }
      if (payload.clientNotes === undefined && payload.notes !== undefined) {
        payload.clientNotes = payload.notes;
      }

      // Don't send legacy keys to backend
      delete payload.totalDuration;
      delete payload.notes;

      const res = await api.post(`/client/workouts/${id}/complete`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENT_WORKOUT_LOGS_KEY });
    },
  });
}

export function useMarkWorkoutMissed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data?: MarkWorkoutMissedPayload }) => {
      const res = await api.post(`/client/workouts/${id}/miss`, data || {});
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENT_WORKOUT_LOGS_KEY });
      queryClient.invalidateQueries({ queryKey: CLIENT_TODAY_WORKOUT_KEY });
      queryClient.invalidateQueries({ queryKey: CLIENT_WORKOUT_PLANS_KEY });
    },
  });
}
