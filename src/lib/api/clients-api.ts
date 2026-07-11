import { platformApi } from "@/lib/api/base-api";
import type { ApiResponse, PaginatedResult } from "@/lib/api/types";
import { unwrapApiResponse } from "@/lib/api/types";

export const clientStatuses = ["Active", "Inactive", "Archived"] as const;

export type ClientStatus = (typeof clientStatuses)[number];

export type ClientContact = {
  id: string;
  client_id?: string;
  user_id?: string | null;
  full_name?: string;
  email?: string;
  phone?: string | null;
  role?: string | null;
  is_primary?: boolean | null;
  portal_access_enabled?: boolean | null;
  last_login_at?: string | null;
  invited_at?: string | null;
  accepted_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type Client = {
  id: string;
  business_name?: string;
  industry?: string | null;
  website_url?: string | null;
  notes?: string | null;
  status?: ClientStatus | string | null;
  lead_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  primary_contact?: ClientContact | null;
  project_count?: number;
  proposal_count?: number;
};

export type ClientProposalSummary = {
  id?: string;
  title?: string | null;
  status?: string | null;
  total_amount?: number | null;
  expires_at?: string | null;
  accepted_at?: string | null;
};

export type ClientProjectSummary = {
  id?: string;
  title?: string | null;
  status?: string | null;
  current_stage?: string | null;
  progress_percent?: number | null;
};

export type ClientCarePlanSummary = {
  id?: string;
  status?: string | null;
  starts_on?: string | null;
  ends_on?: string | null;
};

export type ClientActivity = {
  id?: string;
  action?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  created_at?: string | null;
  metadata?: Record<string, unknown>;
};

export type ClientDetail = Client & {
  contacts?: ClientContact[];
  linked_leads?: Array<Record<string, unknown>>;
  proposals?: ClientProposalSummary[];
  client_projects?: ClientProjectSummary[];
  care_plan_summary?: ClientCarePlanSummary[];
  recent_activity?: ClientActivity[];
};

export type ListClientsQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: ClientStatus;
  industry?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
};

export type UpsertClientContactInput = {
  full_name: string;
  email: string;
  phone?: string;
  role?: string;
  is_primary?: boolean;
  portal_access_enabled?: boolean;
};

export type UpsertClientInput = {
  business_name: string;
  industry?: string;
  website_url?: string;
  notes?: string;
  status?: ClientStatus;
  primary_contact?: UpsertClientContactInput;
};

export const clientsApi = platformApi.injectEndpoints({
  endpoints: (builder) => ({
    listClients: builder.query<PaginatedResult<Client>, ListClientsQuery | void>({
      query: (params) => ({
        url: "/admin/clients",
        params: {
          page: 1,
          limit: 25,
          sort_by: "created_at",
          sort_order: "desc",
          ...(params ?? {}),
        },
      }),
      transformResponse: (response: ApiResponse<PaginatedResult<Client>>) =>
        unwrapApiResponse(response),
      providesTags: ["Clients"],
    }),
    getClient: builder.query<ClientDetail, string>({
      query: (id) => `/admin/clients/${id}`,
      transformResponse: (response: ApiResponse<ClientDetail>) =>
        unwrapApiResponse(response),
      providesTags: (_result, _error, id) => [{ type: "Clients", id }, "Clients"],
    }),
    createClient: builder.mutation<ClientDetail, UpsertClientInput>({
      query: (body) => ({
        url: "/admin/clients",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ClientDetail>) =>
        unwrapApiResponse(response),
      invalidatesTags: ["Clients"],
    }),
    updateClient: builder.mutation<
      ClientDetail,
      { id: string; body: UpsertClientInput }
    >({
      query: ({ id, body }) => ({
        url: `/admin/clients/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: ApiResponse<ClientDetail>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Clients", id },
        "Clients",
      ],
    }),
    archiveClient: builder.mutation<
      { id: string; status: string; archived: boolean },
      string
    >({
      query: (id) => ({
        url: `/admin/clients/${id}`,
        method: "DELETE",
      }),
      transformResponse: (
        response: ApiResponse<{ id: string; status: string; archived: boolean }>
      ) => unwrapApiResponse(response),
      invalidatesTags: ["Clients"],
    }),
    createClientContact: builder.mutation<
      ClientContact,
      { clientId: string; body: UpsertClientContactInput }
    >({
      query: ({ clientId, body }) => ({
        url: `/admin/clients/${clientId}/contacts`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ClientContact>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "Clients", id: clientId },
        "Clients",
      ],
    }),
    deleteClientContact: builder.mutation<
      { id: string; deleted: boolean },
      { clientId: string; contactId: string }
    >({
      query: ({ clientId, contactId }) => ({
        url: `/admin/clients/${clientId}/contacts/${contactId}`,
        method: "DELETE",
      }),
      transformResponse: (
        response: ApiResponse<{ id: string; deleted: boolean }>
      ) => unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "Clients", id: clientId },
        "Clients",
      ],
    }),
  }),
});

export const {
  useListClientsQuery,
  useGetClientQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useArchiveClientMutation,
  useCreateClientContactMutation,
  useDeleteClientContactMutation,
} = clientsApi;
