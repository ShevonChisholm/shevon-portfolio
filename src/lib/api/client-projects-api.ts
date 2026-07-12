import { platformApi } from "@/lib/api/base-api";
import type { Client } from "@/lib/api/clients-api";
import type { Lead } from "@/lib/api/leads-api";
import type { ProposalSummary } from "@/lib/api/proposals-api";
import type { ApiResponse, PaginatedResult } from "@/lib/api/types";
import { unwrapApiResponse } from "@/lib/api/types";

export const clientProjectStatuses = [
  "Not Started",
  "In Progress",
  "Waiting on Client",
  "In Review",
  "Completed",
  "Paused",
  "Cancelled",
  "Archived",
] as const;

export const clientProjectStages = [
  "Discovery",
  "Content Collection",
  "Design",
  "Development",
  "Review",
  "Revisions",
  "Deployment",
  "Completed",
] as const;

export const clientProjectPaymentStatuses = [
  "Unpaid",
  "Deposit Paid",
  "Partially Paid",
  "Paid",
  "Overdue",
] as const;

export const projectMilestoneStatuses = [
  "Not Started",
  "In Progress",
  "Completed",
  "Blocked",
  "Waiting on Client",
] as const;

export type ClientProjectStatus = (typeof clientProjectStatuses)[number];
export type ClientProjectStage = (typeof clientProjectStages)[number];
export type ClientProjectPaymentStatus =
  (typeof clientProjectPaymentStatuses)[number];
export type ProjectMilestoneStatus = (typeof projectMilestoneStatuses)[number];

export type CatalogSummary = {
  id?: string;
  name?: string | null;
  slug?: string | null;
};

export type ProjectMilestone = {
  id?: string;
  client_project_id?: string;
  title?: string;
  description?: string | null;
  stage?: ClientProjectStage | string | null;
  status?: ProjectMilestoneStatus | string | null;
  start_date?: string | null;
  completed_at?: string | null;
  sort_order?: number | null;
  visible_to_client?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ProjectUpdate = {
  id?: string;
  client_project_id?: string;
  title?: string;
  description?: string | null;
  stage?: ClientProjectStage | string | null;
  visible_to_client?: boolean | null;
  requires_client_action?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ProjectMilestoneInput = {
  title: string;
  description?: string;
  stage?: ClientProjectStage;
  status?: ProjectMilestoneStatus;
  start_date?: string;
  completed_at?: string;
  sort_order?: number;
  visible_to_client?: boolean;
};

export type ProjectUpdateInput = {
  title: string;
  description: string;
  stage?: ClientProjectStage;
  visible_to_client?: boolean;
  requires_client_action?: boolean;
};

export type ProjectCounterSummary = {
  total?: number;
  pending?: number;
  submitted?: number;
  missing_required?: number;
};

export type ClientProjectSummary = {
  id: string;
  title?: string | null;
  description?: string | null;
  status?: ClientProjectStatus | string | null;
  current_stage?: ClientProjectStage | string | null;
  progress_percent?: number | null;
  client_id?: string | null;
  lead_id?: string | null;
  proposal_id?: string | null;
  package_id?: string | null;
  start_date?: string | null;
  estimated_completion_date?: string | null;
  completed_at?: string | null;
  total_value?: number | null;
  payment_status?: ClientProjectPaymentStatus | string | null;
  internal_notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  client?: Pick<Client, "id" | "business_name" | "status"> | null;
  lead?: Pick<Lead, "id" | "full_name" | "business_name" | "email" | "status"> | null;
  proposal?: Pick<ProposalSummary, "id" | "title" | "status" | "total_amount"> | null;
  package?: CatalogSummary | null;
};

export type ClientProjectDetail = ClientProjectSummary & {
  milestones?: ProjectMilestone[];
  updates?: ProjectUpdate[];
  activity?: Array<Record<string, unknown>>;
  tasks_summary?: ProjectCounterSummary;
  assets_summary?: ProjectCounterSummary;
  approvals_summary?: ProjectCounterSummary;
  pending_client_actions_count?: number;
  missing_required_assets_count?: number;
  onboarding_summary?: Record<string, unknown> | null;
  document_summary?: Record<string, unknown> | null;
  change_request_summary?: Record<string, unknown> | null;
  active_care_plan_subscription?: Record<string, unknown> | null;
  support_request_summary?: Record<string, unknown> | null;
  launch_checklist_progress?: Record<string, unknown> | null;
  testimonial_request_status?: string | null;
  case_study_request_status?: string | null;
};

export type ClientProjectsSummary = {
  total_projects?: number;
  active_projects?: number;
  waiting_on_client?: number;
  in_review?: number;
  completed_projects?: number;
  overdue_projects?: number;
  total_project_value?: number;
  projects_by_status?: Record<string, number>;
  projects_by_stage?: Record<string, number>;
};

export type ListClientProjectsQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: ClientProjectStatus | string;
  client_id?: string;
  package_id?: string;
  payment_status?: ClientProjectPaymentStatus | string;
  current_stage?: ClientProjectStage | string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
};

export type UpsertClientProjectInput = {
  client_id: string;
  lead_id?: string;
  proposal_id?: string;
  package_id?: string;
  title: string;
  description?: string;
  status?: ClientProjectStatus;
  current_stage?: ClientProjectStage;
  progress_percent?: number;
  start_date?: string;
  estimated_completion_date?: string;
  total_value?: number;
  payment_status?: ClientProjectPaymentStatus;
  internal_notes?: string;
};

export const clientProjectsApi = platformApi.injectEndpoints({
  endpoints: (builder) => ({
    getClientProjectsSummary: builder.query<ClientProjectsSummary, void>({
      query: () => "/admin/client-projects/summary",
      transformResponse: (response: ApiResponse<ClientProjectsSummary>) =>
        unwrapApiResponse(response),
      providesTags: ["ClientProjects"],
    }),
    listClientProjects: builder.query<
      PaginatedResult<ClientProjectSummary>,
      ListClientProjectsQuery | void
    >({
      query: (params) => ({
        url: "/admin/client-projects",
        params: {
          page: 1,
          limit: 25,
          sort_by: "created_at",
          sort_order: "desc",
          ...(params ?? {}),
        },
      }),
      transformResponse: (
        response: ApiResponse<PaginatedResult<ClientProjectSummary>>
      ) => unwrapApiResponse(response),
      providesTags: ["ClientProjects"],
    }),
    getClientProject: builder.query<ClientProjectDetail, string>({
      query: (id) => `/admin/client-projects/${id}`,
      transformResponse: (response: ApiResponse<ClientProjectDetail>) =>
        unwrapApiResponse(response),
      providesTags: (_result, _error, id) => [{ type: "ClientProjects", id }],
    }),
    createClientProject: builder.mutation<
      ClientProjectDetail,
      UpsertClientProjectInput
    >({
      query: (body) => ({
        url: "/admin/client-projects",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ClientProjectDetail>) =>
        unwrapApiResponse(response),
      invalidatesTags: ["ClientProjects", "Clients", "Proposals"],
    }),
    updateClientProject: builder.mutation<
      ClientProjectDetail,
      { id: string; body: UpsertClientProjectInput }
    >({
      query: ({ id, body }) => ({
        url: `/admin/client-projects/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: ApiResponse<ClientProjectDetail>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "ClientProjects", id },
        "ClientProjects",
      ],
    }),
    completeClientProject: builder.mutation<ClientProjectDetail, string>({
      query: (id) => ({
        url: `/admin/client-projects/${id}/complete`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<ClientProjectDetail>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, id) => [
        { type: "ClientProjects", id },
        "ClientProjects",
      ],
    }),
    archiveClientProject: builder.mutation<
      { id: string; status: string; archived: boolean },
      string
    >({
      query: (id) => ({
        url: `/admin/client-projects/${id}`,
        method: "DELETE",
      }),
      transformResponse: (
        response: ApiResponse<{ id: string; status: string; archived: boolean }>
      ) => unwrapApiResponse(response),
      invalidatesTags: ["ClientProjects"],
    }),
    createProjectMilestone: builder.mutation<
      ProjectMilestone,
      { projectId: string; body: ProjectMilestoneInput }
    >({
      query: ({ projectId, body }) => ({
        url: `/admin/client-projects/${projectId}/milestones`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ProjectMilestone>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "ClientProjects", id: projectId },
        "ClientProjects",
      ],
    }),
    updateProjectMilestone: builder.mutation<
      ProjectMilestone,
      { projectId: string; milestoneId: string; body: ProjectMilestoneInput }
    >({
      query: ({ projectId, milestoneId, body }) => ({
        url: `/admin/client-projects/${projectId}/milestones/${milestoneId}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: ApiResponse<ProjectMilestone>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "ClientProjects", id: projectId },
        "ClientProjects",
      ],
    }),
    completeProjectMilestone: builder.mutation<
      ProjectMilestone,
      { projectId: string; milestoneId: string }
    >({
      query: ({ projectId, milestoneId }) => ({
        url: `/admin/client-projects/${projectId}/milestones/${milestoneId}/complete`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<ProjectMilestone>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "ClientProjects", id: projectId },
        "ClientProjects",
      ],
    }),
    deleteProjectMilestone: builder.mutation<
      { id: string; deleted: boolean },
      { projectId: string; milestoneId: string }
    >({
      query: ({ projectId, milestoneId }) => ({
        url: `/admin/client-projects/${projectId}/milestones/${milestoneId}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<{ id: string; deleted: boolean }>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "ClientProjects", id: projectId },
        "ClientProjects",
      ],
    }),
    createProjectUpdate: builder.mutation<
      ProjectUpdate,
      { projectId: string; body: ProjectUpdateInput }
    >({
      query: ({ projectId, body }) => ({
        url: `/admin/client-projects/${projectId}/updates`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ProjectUpdate>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "ClientProjects", id: projectId },
        "ClientProjects",
      ],
    }),
    updateProjectUpdate: builder.mutation<
      ProjectUpdate,
      { projectId: string; updateId: string; body: ProjectUpdateInput }
    >({
      query: ({ projectId, updateId, body }) => ({
        url: `/admin/client-projects/${projectId}/updates/${updateId}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: ApiResponse<ProjectUpdate>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "ClientProjects", id: projectId },
        "ClientProjects",
      ],
    }),
    deleteProjectUpdate: builder.mutation<
      { id: string; deleted: boolean },
      { projectId: string; updateId: string }
    >({
      query: ({ projectId, updateId }) => ({
        url: `/admin/client-projects/${projectId}/updates/${updateId}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<{ id: string; deleted: boolean }>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "ClientProjects", id: projectId },
        "ClientProjects",
      ],
    }),
  }),
});

export const {
  useGetClientProjectsSummaryQuery,
  useListClientProjectsQuery,
  useGetClientProjectQuery,
  useCreateClientProjectMutation,
  useUpdateClientProjectMutation,
  useCompleteClientProjectMutation,
  useArchiveClientProjectMutation,
  useCreateProjectMilestoneMutation,
  useUpdateProjectMilestoneMutation,
  useCompleteProjectMilestoneMutation,
  useDeleteProjectMilestoneMutation,
  useCreateProjectUpdateMutation,
  useUpdateProjectUpdateMutation,
  useDeleteProjectUpdateMutation,
} = clientProjectsApi;
