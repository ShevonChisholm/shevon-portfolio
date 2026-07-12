import { platformApi } from "@/lib/api/base-api";
import type { ApiResponse, PaginatedResult } from "@/lib/api/types";
import { unwrapApiResponse } from "@/lib/api/types";

export const leadStatuses = [
  "New Lead",
  "Contacted",
  "Discovery Sent",
  "Discovery Completed",
  "Proposal Sent",
  "Negotiating",
  "Won",
  "Lost",
  "Archived",
] as const;

export type LeadStatus = (typeof leadStatuses)[number];

export type Lead = {
  id: string;
  client_id?: string | null;
  converted_client_id?: string | null;
  converted_at?: string | null;
  full_name?: string | null;
  business_name?: string | null;
  email?: string | null;
  phone?: string | null;
  industry?: string | null;
  current_website_url?: string | null;
  social_url?: string | null;
  package_id?: string | null;
  source?: string | null;
  status?: LeadStatus | string | null;
  estimated_value?: number | null;
  budget_range?: string | null;
  desired_timeline?: string | null;
  project_goals?: string | null;
  problem_to_solve?: string | null;
  features_needed?: string[] | null;
  additional_notes?: string | null;
  last_contacted_at?: string | null;
  next_follow_up_at?: string | null;
  archived?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type LeadNote = {
  id: string;
  lead_id?: string;
  note?: string;
  created_by?: string | null;
  created_by_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type LeadStatusHistory = {
  id?: string;
  lead_id?: string;
  previous_status?: string | null;
  new_status?: string | null;
  changed_by?: string | null;
  changed_at?: string | null;
  created_at?: string | null;
};

export type LeadFollowUp = {
  id: string;
  lead_id: string;
  title?: string | null;
  notes?: string | null;
  due_at?: string | null;
  status?: string | null;
  assigned_admin_profile_id?: string | null;
  completed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type DiscoveryResponse = {
  id: string;
  lead_id: string;
  question_key?: string | null;
  question_label?: string | null;
  answer?: unknown;
  business_goals?: string | null;
  pain_points?: string | null;
  requested_features?: string[] | null;
  budget_range?: string | null;
  timeline?: string | null;
  recommended_package_id?: string | null;
  readiness_score?: number | null;
  internal_notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type FollowUpStatus = "Pending" | "Completed" | "Cancelled" | "Overdue";

export type FollowUpInput = {
  title: string;
  notes?: string;
  due_at: string;
  status?: FollowUpStatus;
};

export type ListFollowUpsQuery = {
  page?: number;
  limit?: number;
  lead_id?: string;
  status?: string;
  due_from?: string;
  due_to?: string;
  overdue?: "true" | "false";
  today?: "true" | "false";
  this_week?: "true" | "false";
  sort_by?: string;
  sort_order?: "asc" | "desc";
};

export type DiscoveryResponseInput = {
  business_goals?: string;
  pain_points?: string;
  requested_features?: string[];
  budget_range?: string;
  timeline?: string;
  recommended_package_id?: string;
  readiness_score?: number;
  internal_notes?: string;
};

export type LeadDetail = Lead & {
  notes?: LeadNote[];
  status_history?: LeadStatusHistory[];
  follow_ups?: LeadFollowUp[];
  discovery_responses?: DiscoveryResponse[];
};

export type ListLeadsQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  source?: string;
  package_id?: string;
  budget_range?: string;
  archived?: "true" | "false";
  sort_by?: string;
  sort_order?: "asc" | "desc";
};

export type UpdateLeadStatusInput = {
  status: LeadStatus;
  note?: string;
};

export const leadsApi = platformApi.injectEndpoints({
  endpoints: (builder) => ({
    listLeads: builder.query<PaginatedResult<Lead>, ListLeadsQuery | void>({
      query: (params) => ({
        url: "/admin/leads",
        params: {
          page: 1,
          limit: 25,
          sort_by: "created_at",
          sort_order: "desc",
          archived: "false",
          ...(params ?? {}),
        },
      }),
      transformResponse: (response: ApiResponse<PaginatedResult<Lead>>) =>
        unwrapApiResponse(response),
      providesTags: ["Leads"],
    }),
    getLead: builder.query<LeadDetail, string>({
      query: (id) => `/admin/leads/${id}`,
      transformResponse: (response: ApiResponse<LeadDetail>) =>
        unwrapApiResponse(response),
      providesTags: (_result, _error, id) => [{ type: "Leads", id }, "Leads"],
    }),
    updateLeadStatus: builder.mutation<
      Lead,
      { id: string; body: UpdateLeadStatusInput }
    >({
      query: ({ id, body }) => ({
        url: `/admin/leads/${id}/status`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<Lead>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Leads", id },
        "Leads",
      ],
    }),
    archiveLead: builder.mutation<{ id: string; archived: boolean }, string>({
      query: (id) => ({
        url: `/admin/leads/${id}`,
        method: "DELETE",
      }),
      transformResponse: (
        response: ApiResponse<{ id: string; archived: boolean }>
      ) => unwrapApiResponse(response),
      invalidatesTags: ["Leads"],
    }),
    createLeadNote: builder.mutation<
      LeadNote,
      { leadId: string; note: string }
    >({
      query: ({ leadId, note }) => ({
        url: `/admin/leads/${leadId}/notes`,
        method: "POST",
        body: { note },
      }),
      transformResponse: (response: ApiResponse<LeadNote>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { leadId }) => [
        { type: "Leads", id: leadId },
        "Leads",
      ],
    }),
    listFollowUps: builder.query<
      PaginatedResult<LeadFollowUp>,
      ListFollowUpsQuery | void
    >({
      query: (params) => ({
        url: "/admin/follow-ups",
        params: {
          page: 1,
          limit: 50,
          sort_by: "due_at",
          sort_order: "asc",
          ...(params ?? {}),
        },
      }),
      transformResponse: (response: ApiResponse<PaginatedResult<LeadFollowUp>>) =>
        unwrapApiResponse(response),
      providesTags: ["FollowUps"],
    }),
    createFollowUp: builder.mutation<
      LeadFollowUp,
      { leadId: string; body: FollowUpInput }
    >({
      query: ({ leadId, body }) => ({
        url: `/admin/leads/${leadId}/follow-ups`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<LeadFollowUp>) =>
        unwrapApiResponse(response),
      invalidatesTags: ["FollowUps", "Leads"],
    }),
    updateFollowUp: builder.mutation<
      LeadFollowUp,
      { id: string; body: FollowUpInput }
    >({
      query: ({ id, body }) => ({
        url: `/admin/follow-ups/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: ApiResponse<LeadFollowUp>) =>
        unwrapApiResponse(response),
      invalidatesTags: ["FollowUps", "Leads"],
    }),
    completeFollowUp: builder.mutation<LeadFollowUp, string>({
      query: (id) => ({
        url: `/admin/follow-ups/${id}/complete`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<LeadFollowUp>) =>
        unwrapApiResponse(response),
      invalidatesTags: ["FollowUps", "Leads"],
    }),
    deleteFollowUp: builder.mutation<{ id: string; deleted: boolean }, string>({
      query: (id) => ({ url: `/admin/follow-ups/${id}`, method: "DELETE" }),
      transformResponse: (response: ApiResponse<{ id: string; deleted: boolean }>) =>
        unwrapApiResponse(response),
      invalidatesTags: ["FollowUps", "Leads"],
    }),
    listDiscoveryResponses: builder.query<DiscoveryResponse[], void>({
      query: () => "/admin/discovery-responses",
      transformResponse: (response: ApiResponse<DiscoveryResponse[]>) =>
        unwrapApiResponse(response),
      providesTags: ["DiscoveryResponses"],
    }),
    updateDiscoveryResponse: builder.mutation<
      DiscoveryResponse,
      { id: string; body: DiscoveryResponseInput }
    >({
      query: ({ id, body }) => ({
        url: `/admin/discovery-responses/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: ApiResponse<DiscoveryResponse>) =>
        unwrapApiResponse(response),
      invalidatesTags: ["DiscoveryResponses", "Leads"],
    }),
  }),
});

export const {
  useListLeadsQuery,
  useGetLeadQuery,
  useUpdateLeadStatusMutation,
  useArchiveLeadMutation,
  useCreateLeadNoteMutation,
  useListFollowUpsQuery,
  useCreateFollowUpMutation,
  useUpdateFollowUpMutation,
  useCompleteFollowUpMutation,
  useDeleteFollowUpMutation,
  useListDiscoveryResponsesQuery,
  useUpdateDiscoveryResponseMutation,
} = leadsApi;
