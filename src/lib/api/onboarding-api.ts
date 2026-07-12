import { platformApi } from "@/lib/api/base-api";
import type { ApiResponse, PaginatedResult } from "@/lib/api/types";
import { unwrapApiResponse } from "@/lib/api/types";

export const onboardingFlowStatuses = ["Not Started", "In Progress", "Completed", "Blocked", "Cancelled"] as const;
export const onboardingStepStatuses = ["Pending", "In Progress", "Completed", "Skipped", "Blocked"] as const;
export const onboardingStepTypes = ["Welcome", "Business Details", "Contact Confirmation", "Scope Confirmation", "Asset Upload", "Payment Confirmation", "Communication Preferences", "Timeline Confirmation", "Portal Walkthrough"] as const;

export type OnboardingFlowStatus = (typeof onboardingFlowStatuses)[number];
export type OnboardingStepStatus = (typeof onboardingStepStatuses)[number];
export type OnboardingStepType = (typeof onboardingStepTypes)[number];

export type OnboardingStep = {
  id: string;
  onboarding_flow_id: string;
  title?: string | null;
  description?: string | null;
  step_type?: OnboardingStepType | string | null;
  status?: OnboardingStepStatus | string | null;
  sort_order?: number | null;
  required?: boolean | null;
  completed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type OnboardingProgress = {
  total_steps?: number;
  required_steps?: number;
  completed_required_steps?: number;
  progress_percentage?: number;
};

export type OnboardingFlow = {
  id: string;
  client_id?: string | null;
  client_project_id?: string | null;
  name?: string | null;
  status?: OnboardingFlowStatus | string | null;
  current_step?: string | null;
  completed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  progress_percentage?: number;
  client?: { id?: string; business_name?: string | null; status?: string | null } | null;
  project?: { id?: string; title?: string | null; name?: string | null; status?: string | null; current_stage?: string | null } | null;
};

export type OnboardingFlowDetail = OnboardingFlow & {
  steps: OnboardingStep[];
  progress?: OnboardingProgress;
  blocked_step_count?: number;
  required_remaining_count?: number;
  next_action?: Record<string, unknown> | null;
};

export type ListOnboardingQuery = {
  page?: number;
  limit?: number;
  search?: string;
  client_id?: string;
  client_project_id?: string;
  status?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
};

export type OnboardingStepInput = {
  title: string;
  description?: string;
  step_type?: OnboardingStepType;
  status?: OnboardingStepStatus;
  required?: boolean;
  sort_order?: number;
};

export const onboardingApi = platformApi.injectEndpoints({
  endpoints: (builder) => ({
    listAdminOnboarding: builder.query<PaginatedResult<OnboardingFlow>, ListOnboardingQuery | void>({
      query: (params) => ({ url: "/admin/onboarding", params: { page: 1, limit: 50, sort_by: "created_at", sort_order: "desc", ...(params ?? {}) } }),
      transformResponse: (response: ApiResponse<PaginatedResult<OnboardingFlow>>) => unwrapApiResponse(response),
      providesTags: ["Onboarding"],
    }),
    getAdminOnboarding: builder.query<OnboardingFlowDetail, string>({
      query: (id) => `/admin/onboarding/${id}`,
      transformResponse: (response: ApiResponse<OnboardingFlowDetail>) => unwrapApiResponse(response),
      providesTags: (_result, _error, id) => [{ type: "Onboarding", id }, "Onboarding"],
    }),
    createOnboardingFlow: builder.mutation<OnboardingFlowDetail, { projectId: string; clientId?: string }>({
      query: ({ projectId, clientId }) => ({ url: `/admin/client-projects/${projectId}/onboarding`, method: "POST", body: { client_id: clientId || undefined, use_default_steps: true } }),
      transformResponse: (response: ApiResponse<OnboardingFlowDetail>) => unwrapApiResponse(response),
      invalidatesTags: ["Onboarding", "ClientProjects"],
    }),
    updateOnboardingFlow: builder.mutation<OnboardingFlowDetail, { id: string; status?: OnboardingFlowStatus; current_step?: string }>({
      query: ({ id, ...body }) => ({ url: `/admin/onboarding/${id}`, method: "PATCH", body }),
      transformResponse: (response: ApiResponse<OnboardingFlowDetail>) => unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Onboarding", id }, "Onboarding", "ClientProjects"],
    }),
    addOnboardingStep: builder.mutation<OnboardingStep, { flowId: string; body: OnboardingStepInput }>({
      query: ({ flowId, body }) => ({ url: `/admin/onboarding/${flowId}/steps`, method: "POST", body }),
      transformResponse: (response: ApiResponse<OnboardingStep>) => unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { flowId }) => [{ type: "Onboarding", id: flowId }, "Onboarding", "ClientProjects"],
    }),
    updateOnboardingStep: builder.mutation<OnboardingStep, { flowId: string; stepId: string; body: OnboardingStepInput }>({
      query: ({ flowId, stepId, body }) => ({ url: `/admin/onboarding/${flowId}/steps/${stepId}`, method: "PATCH", body }),
      transformResponse: (response: ApiResponse<OnboardingStep>) => unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { flowId }) => [{ type: "Onboarding", id: flowId }, "Onboarding", "ClientProjects"],
    }),
    completeOnboardingStep: builder.mutation<OnboardingStep, { flowId: string; stepId: string }>({
      query: ({ flowId, stepId }) => ({ url: `/admin/onboarding/${flowId}/steps/${stepId}/complete`, method: "POST" }),
      transformResponse: (response: ApiResponse<OnboardingStep>) => unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { flowId }) => [{ type: "Onboarding", id: flowId }, "Onboarding", "ClientProjects"],
    }),
    blockOnboardingStep: builder.mutation<OnboardingStep, { flowId: string; stepId: string }>({
      query: ({ flowId, stepId }) => ({ url: `/admin/onboarding/${flowId}/steps/${stepId}/block`, method: "POST" }),
      transformResponse: (response: ApiResponse<OnboardingStep>) => unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { flowId }) => [{ type: "Onboarding", id: flowId }, "Onboarding", "ClientProjects"],
    }),
    deleteOnboardingStep: builder.mutation<{ id: string; deleted: boolean }, { flowId: string; stepId: string }>({
      query: ({ flowId, stepId }) => ({ url: `/admin/onboarding/${flowId}/steps/${stepId}`, method: "DELETE" }),
      transformResponse: (response: ApiResponse<{ id: string; deleted: boolean }>) => unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { flowId }) => [{ type: "Onboarding", id: flowId }, "Onboarding", "ClientProjects"],
    }),
    listClientOnboarding: builder.query<OnboardingFlowDetail[], void>({
      query: () => "/client/onboarding",
      transformResponse: (response: ApiResponse<OnboardingFlowDetail[]>) => unwrapApiResponse(response),
      providesTags: ["Onboarding"],
    }),
    completeClientOnboardingStep: builder.mutation<OnboardingStep, { flowId: string; stepId: string }>({
      query: ({ flowId, stepId }) => ({ url: `/client/onboarding/${flowId}/steps/${stepId}/complete`, method: "POST" }),
      transformResponse: (response: ApiResponse<OnboardingStep>) => unwrapApiResponse(response),
      invalidatesTags: ["Onboarding", "ClientPortal", "ClientPortalProjects"],
    }),
  }),
});

export const {
  useListAdminOnboardingQuery,
  useGetAdminOnboardingQuery,
  useCreateOnboardingFlowMutation,
  useUpdateOnboardingFlowMutation,
  useAddOnboardingStepMutation,
  useUpdateOnboardingStepMutation,
  useCompleteOnboardingStepMutation,
  useBlockOnboardingStepMutation,
  useDeleteOnboardingStepMutation,
  useListClientOnboardingQuery,
  useCompleteClientOnboardingStepMutation,
} = onboardingApi;
