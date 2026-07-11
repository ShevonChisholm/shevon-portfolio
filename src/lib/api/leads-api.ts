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
  id?: string;
  lead_id?: string;
  title?: string | null;
  description?: string | null;
  due_at?: string | null;
  status?: string | null;
  created_at?: string | null;
};

export type DiscoveryResponse = {
  id?: string;
  lead_id?: string;
  question_key?: string | null;
  question_label?: string | null;
  response?: unknown;
  created_at?: string | null;
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
  }),
});

export const {
  useListLeadsQuery,
  useGetLeadQuery,
  useUpdateLeadStatusMutation,
  useArchiveLeadMutation,
  useCreateLeadNoteMutation,
} = leadsApi;
