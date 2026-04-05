// lib/queries/diet.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

// =============================================
// Types
// =============================================
export type FoodItem = {
  _id: string;
  name: string;
  category: string;
  servingSize: number;
  servingUnit: string;
  nutrition: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber?: number;
    sugar?: number;
  };
  micronutrients?: {
    sodium?: number;
    potassium?: number;
    calcium?: number;
    iron?: number;
    vitaminA?: number;
    vitaminC?: number;
    vitaminD?: number;
  };
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isDairyFree?: boolean;
  isNutFree?: boolean;
  allergens?: string[];
  thumbnailUrl?: string;
  isActive: boolean;
  isCustom?: boolean;
  createdBy?: { _id: string; name: string };
};

export type DietDay = {
  dayOfWeek?: number;
  dayNumber?: number;
  dayName?: string;
  meals?: Meal[];
  notes?: string;
};

export type DietTemplate = {
  _id: string;
  name: string;
  description?: string;
  goal?: string;
  dietaryType?: string;
  dailyTargets?: DailyTargets;
  mealsPerDay?: number;
  sampleMeals?: Meal[];
  weeklySchedule?: DietDay[];
  daysPerWeek?: number;
  foodsToAvoid?: string[];
  guidelines?: string[];
  recommendedFoods?: Array<string | FoodItem>;
  tags?: string[];
  difficulty?: "easy" | "moderate" | "challenging";
  thumbnailUrl?: string;
  isFeatured?: boolean;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
};

export type DietTemplateMetadata = {
  goals: string[];
  dietaryTypes: string[];
  mealTypes: string[];
};

export type DailyTargets = {
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  water?: number;
};

export type Meal = {
  mealType: string;
  name?: string;
  time?: string;
  foods?: MealFood[];
  alternatives?: { foodItemId?: string; foodName?: string }[];
  notes?: string;
};

export type MealFood = {
  foodItemId?: string;
  foodName?: string;
  quantity: number;
  unit?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  notes?: string;
};

export type CoachDietPlan = {
  _id: string;
  coachId: string;
  name: string;
  description?: string;
  goal?: string;
  subscriptionPlanIds: Array<{ _id: string; title: string }>;
  dailyTargets?: DailyTargets;
  mealsPerDay?: number;
  daysPerWeek?: number;
  meals?: Meal[];
  todaysMeals?: Meal[];
  weeklySchedule?: Array<{
    dayOfWeek: number;
    dayNumber?: number;
    dayName?: string;
    meals: Meal[];
    notes?: string;
  }>;
  dietaryType?: string;
  dietaryRestrictions?: string[];
  allergyNotes?: string;
  foodsToAvoid?: string[];
  customInstructions?: string;
  supplements?: Supplement[];
  isActive: boolean;
  isDraft: boolean;
  createdAt: string;
};

export type Supplement = {
  name: string;
  dosage?: string;
  timing?: string;
  notes?: string;
};

export type ClientDietLog = {
  _id: string;
  clientId: string;
  dietPlanId: { _id: string; name: string; goal?: string };
  date: string;
  meals?: LoggedMeal[];
  dailyTotals?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
  };
  dailyTargets?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  // Canonical persisted field
  waterIntake?: number;
  // Backward-compatible alias accepted by APIs
  waterIntakeLiters?: number;
  waterGoal?: number;
  supplementsTaken?: { name: string; taken: boolean; notes?: string }[];
  adherenceScore?: number;
  // Legacy alias (maps to clientNotes on backend)
  notes?: string;
  clientNotes?: string;
  createdAt: string;
};

export type LoggedMeal = {
  _id?: string;
  mealType: string;
  time?: string;
  foods?: LoggedFood[];
  adherenceStatus?: "followed" | "modified" | "skipped" | "extra";
  notes?: string;
  photoUrl?: string;
  totalCalories?: number;
  totalProtein?: number;
  totalCarbs?: number;
  totalFat?: number;
};

export type LoggedFood = {
  foodItemId?: string;
  foodName: string;
  quantity: number;
  unit?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  isCustom?: boolean;
};

// =============================================
// Query Keys
// =============================================
export const FOOD_ITEMS_KEY = ["foodItems"] as const;
export const DIET_TEMPLATES_KEY = ["dietTemplates"] as const;
export const COACH_DIET_PLANS_KEY = ["coachDietPlans"] as const;
export const CLIENT_DIET_PLANS_KEY = ["clientDietPlans"] as const;
export const CLIENT_DIET_LOGS_KEY = ["clientDietLogs"] as const;

// =============================================
// Food Item Queries (Admin)
// =============================================
type FoodItemsResponse = {
  success: boolean;
  data: FoodItem[];
  pagination: { total: number; page: number; totalPages: number; limit: number };
};

export const fetchFoodItems = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
}): Promise<FoodItemsResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.category) searchParams.append("category", params.category);
  if (params?.isVegetarian !== undefined) searchParams.append("isVegetarian", params.isVegetarian.toString());
  if (params?.isVegan !== undefined) searchParams.append("isVegan", params.isVegan.toString());

  const res = await api.get(`/food-items?${searchParams.toString()}`);
  return res.data;
};

export function useFoodItems(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
}) {
  return useQuery({
    queryKey: [...FOOD_ITEMS_KEY, params],
    queryFn: () => fetchFoodItems(params),
  });
}

export function useFoodItemMetadata() {
  return useQuery({
    queryKey: [...FOOD_ITEMS_KEY, "metadata"],
    queryFn: async () => {
      const res = await api.get("/food-items/metadata");
      return res.data.data;
    },
  });
}

// =============================================
// Diet Template Queries (Admin)
// =============================================
type DietTemplatesResponse = {
  success: boolean;
  data: DietTemplate[];
  pagination: { total: number; page: number; totalPages: number; limit: number };
};

export const fetchDietTemplates = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  goal?: string;
  dietaryType?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}): Promise<DietTemplatesResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.goal) searchParams.append("goal", params.goal);
  if (params?.dietaryType) searchParams.append("dietaryType", params.dietaryType);
  if (params?.isActive !== undefined) searchParams.append("isActive", params.isActive.toString());
  if (params?.isFeatured !== undefined) searchParams.append("isFeatured", params.isFeatured.toString());

  const res = await api.get(`/diet-templates?${searchParams.toString()}`);
  return res.data;
};

export function useDietTemplates(params?: {
  page?: number;
  limit?: number;
  search?: string;
  goal?: string;
  dietaryType?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}) {
  return useQuery({
    queryKey: [...DIET_TEMPLATES_KEY, params],
    queryFn: () => fetchDietTemplates(params),
  });
}

export function useDietTemplateMetadata() {
  return useQuery({
    queryKey: [...DIET_TEMPLATES_KEY, "metadata"],
    queryFn: async () => {
      const res = await api.get("/diet-templates/metadata");
      return res.data.data as DietTemplateMetadata;
    },
  });
}

export function useDietTemplate(id: string) {
  return useQuery({
    queryKey: [...DIET_TEMPLATES_KEY, id],
    queryFn: async () => {
      const res = await api.get(`/diet-templates/${id}`);
      return res.data.data as DietTemplate;
    },
    enabled: !!id,
  });
}

// =============================================
// Coach Diet Plan Queries
// =============================================
type CoachDietPlansResponse = {
  success: boolean;
  data: CoachDietPlan[];
  pagination: { total: number; page: number; totalPages: number; limit: number };
};

export const fetchCoachDietPlans = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  goal?: string;
  isActive?: boolean;
}): Promise<CoachDietPlansResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.goal) searchParams.append("goal", params.goal);
  if (params?.isActive !== undefined) searchParams.append("isActive", params.isActive.toString());

  const res = await api.get(`/coach/diet-plans?${searchParams.toString()}`);
  return res.data;
};

export function useCoachDietPlans(params?: {
  page?: number;
  limit?: number;
  search?: string;
  goal?: string;
  isActive?: boolean;
}) {
  return useQuery({
    queryKey: [...COACH_DIET_PLANS_KEY, params],
    queryFn: () => fetchCoachDietPlans(params),
  });
}

export function useCoachDietPlan(id: string) {
  return useQuery({
    queryKey: [...COACH_DIET_PLANS_KEY, id],
    queryFn: async () => {
      const res = await api.get(`/coach/diet-plans/${id}`);
      return res.data.data as CoachDietPlan;
    },
    enabled: !!id,
  });
}

// =============================================
// Client Diet Queries
// =============================================
export function useClientDietPlans() {
  return useQuery({
    queryKey: CLIENT_DIET_PLANS_KEY,
    queryFn: async () => {
      const res = await api.get("/client/diet/plans");
      return res.data.data as CoachDietPlan[];
    },
  });
}

export function useClientDietPlan(id: string) {
  return useQuery({
    queryKey: [...CLIENT_DIET_PLANS_KEY, id],
    queryFn: async () => {
      const res = await api.get(`/client/diet/plans/${id}`);
      return res.data.data as CoachDietPlan;
    },
    enabled: !!id,
  });
}

export function useClientDietLogs(params?: {
  page?: number;
  limit?: number;
  dietPlanId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.dietPlanId) searchParams.append("dietPlanId", params.dietPlanId);
  if (params?.startDate) searchParams.append("startDate", params.startDate);
  if (params?.endDate) searchParams.append("endDate", params.endDate);

  return useQuery({
    queryKey: [...CLIENT_DIET_LOGS_KEY, params],
    queryFn: async () => {
      const res = await api.get(`/client/diet/logs?${searchParams.toString()}`);
      return res.data;
    },
  });
}

export function useClientDietLogByDate(date: string, dietPlanId?: string) {
  const searchParams = new URLSearchParams();
  if (dietPlanId) searchParams.append("dietPlanId", dietPlanId);

  return useQuery({
    queryKey: [...CLIENT_DIET_LOGS_KEY, "date", date, dietPlanId],
    queryFn: async () => {
      const res = await api.get(`/client/diet/logs/date/${date}?${searchParams.toString()}`);
      return res.data.data as ClientDietLog | null;
    },
    enabled: !!date,
  });
}

export function useClientDietStats(days = 7) {
  return useQuery({
    queryKey: [...CLIENT_DIET_LOGS_KEY, "stats", days],
    queryFn: async () => {
      const res = await api.get(`/client/diet/logs/stats/summary?days=${days}`);
      return res.data.data;
    },
  });
}

// =============================================
// Mutations
// =============================================
export function useCreateFoodItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<FoodItem>) => {
      const res = await api.post("/food-items", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOOD_ITEMS_KEY });
    },
  });
}

export function useUpdateFoodItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FoodItem> }) => {
      const res = await api.patch(`/food-items/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOOD_ITEMS_KEY });
    },
  });
}

export function useDeleteFoodItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/food-items/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOOD_ITEMS_KEY });
    },
  });
}

export function useCreateCoachDietPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<CoachDietPlan>) => {
      const res = await api.post("/coach/diet-plans", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COACH_DIET_PLANS_KEY });
    },
  });
}

export function useUpdateCoachDietPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CoachDietPlan> }) => {
      const res = await api.patch(`/coach/diet-plans/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COACH_DIET_PLANS_KEY });
    },
  });
}

export function useDeleteCoachDietPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/coach/diet-plans/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COACH_DIET_PLANS_KEY, refetchType: 'active' });
      queryClient.refetchQueries({ queryKey: COACH_DIET_PLANS_KEY });
    },
  });
}

export function useCreateFromDietTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ templateId, data }: { templateId: string; data: { name?: string; subscriptionPlanIds?: string[] } }) => {
      const res = await api.post(`/coach/diet-plans/from-template/${templateId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COACH_DIET_PLANS_KEY });
    },
  });
}

export function useCreateDietTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<DietTemplate>) => {
      const res = await api.post("/diet-templates", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DIET_TEMPLATES_KEY });
    },
  });
}

export function useUpdateDietTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DietTemplate> }) => {
      const res = await api.patch(`/diet-templates/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DIET_TEMPLATES_KEY });
    },
  });
}

export function useDeleteDietTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/diet-templates/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DIET_TEMPLATES_KEY });
    },
  });
}

export function useCreateDietLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      dietPlanId: string;
      date: string;
      mealsLogged?: LoggedMeal[];
      waterIntake?: number;
      waterIntakeLiters?: number;
      supplementsTaken?: { name: string; taken: boolean; notes?: string }[];
      notes?: string;
      clientNotes?: string;
    }) => {
      const res = await api.post("/client/diet/logs", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENT_DIET_LOGS_KEY });
    },
  });
}

export function useUpdateDietLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ClientDietLog> }) => {
      const res = await api.patch(`/client/diet/logs/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENT_DIET_LOGS_KEY });
    },
  });
}

export function useAddMealToLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ logId, meal }: { logId: string; meal: LoggedMeal }) => {
      const res = await api.post(`/client/diet/logs/${logId}/meals`, meal);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENT_DIET_LOGS_KEY });
    },
  });
}
