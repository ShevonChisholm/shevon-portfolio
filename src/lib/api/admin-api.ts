import { platformApi } from "@/lib/api/base-api";
import type { ApiResponse, PaginatedResult } from "@/lib/api/types";
import { unwrapApiResponse } from "@/lib/api/types";

export type CrmSummary = {
  total_leads: number;
  new_leads: number;
  contacted_leads: number;
  discovery_completed: number;
  proposal_sent: number;
  won_leads: number;
  lost_leads: number;
  overdue_follow_ups: number;
  follow_ups_due_today: number;
  estimated_pipeline_value: number | null;
  active_service_packages: number;
  active_care_plans: number;
  won_leads_linked_to_clients: number;
  proposals_sent: number;
  accepted_proposals: number;
};

export type AdminAccessLog = {
  id: string;
  admin_profile_id?: string | null;
  admin_email?: string | null;
  user_id?: string | null;
  action: string;
  resource?: string | null;
  entity_id?: string | null;
  description?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
};

export type AdminNotification = {
  id: string;
  title?: string | null;
  message?: string | null;
  body?: string | null;
  status?: string | null;
  notification_type?: string | null;
  recipient_type?: string | null;
  related_entity_type?: string | null;
  related_entity_id?: string | null;
  created_at: string;
  read_at?: string | null;
};

type ListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
};

export const adminApi = platformApi.injectEndpoints({
  endpoints: (builder) => ({
    getCrmSummary: builder.query<CrmSummary, void>({
      query: () => "/admin/crm/summary",
      transformResponse: (response: ApiResponse<CrmSummary>) =>
        unwrapApiResponse(response),
      providesTags: ["Leads", "Clients", "Proposals", "ServicePackages", "CarePlans"],
    }),
    listAdminAccessLogs: builder.query<
      PaginatedResult<AdminAccessLog>,
      ListQuery | void
    >({
      query: (params) => ({
        url: "/admin/access-logs",
        params: params ?? { limit: 5 },
      }),
      transformResponse: (response: ApiResponse<PaginatedResult<AdminAccessLog>>) =>
        unwrapApiResponse(response),
      providesTags: ["ActivityLogs"],
    }),
    listAdminNotifications: builder.query<
      PaginatedResult<AdminNotification>,
      (ListQuery & { status?: string }) | void
    >({
      query: (params) => ({
        url: "/admin/notifications",
        params: params ?? { limit: 5 },
      }),
      transformResponse: (
        response: ApiResponse<PaginatedResult<AdminNotification>>
      ) => unwrapApiResponse(response),
      providesTags: ["Settings"],
    }),
  }),
});

export const {
  useGetCrmSummaryQuery,
  useListAdminAccessLogsQuery,
  useListAdminNotificationsQuery,
} = adminApi;
