import { platformApi } from "@/lib/api/base-api";
import type { ApiResponse, PaginatedResult } from "@/lib/api/types";
import { unwrapApiResponse } from "@/lib/api/types";

export const clientTaskStatuses = [
  "Pending",
  "Submitted",
  "Approved",
  "Rejected",
  "Not Needed",
] as const;

export const clientAssetTypes = [
  "Logo",
  "Brand Guide",
  "Business Photos",
  "Service List",
  "Website Content",
  "Domain Access",
  "Social Media Links",
  "Other",
] as const;

export const clientAssetStatuses = [
  "Needed",
  "Submitted",
  "Approved",
  "Needs Revision",
  "Not Needed",
] as const;

export const approvalStatuses = [
  "Pending",
  "Approved",
  "Changes Requested",
  "Cancelled",
] as const;

export type ClientTaskStatus = (typeof clientTaskStatuses)[number];
export type ClientAssetType = (typeof clientAssetTypes)[number];
export type ClientAssetStatus = (typeof clientAssetStatuses)[number];
export type ApprovalStatus = (typeof approvalStatuses)[number];

export type ClientTask = {
  id: string;
  client_project_id?: string;
  title?: string;
  description?: string | null;
  due_date?: string | null;
  status?: ClientTaskStatus | string | null;
  visible_to_client?: boolean | null;
  submitted_at?: string | null;
  approved_at?: string | null;
  submission_note?: string | null;
  submission_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ClientAsset = {
  id: string;
  client_project_id?: string;
  title?: string;
  description?: string | null;
  asset_type?: ClientAssetType | string | null;
  file_url?: string | null;
  status?: ClientAssetStatus | string | null;
  required?: boolean | null;
  submitted_at?: string | null;
  approved_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ApprovalRequest = {
  id: string;
  client_project_id?: string;
  title?: string;
  description?: string | null;
  related_stage?: string | null;
  status?: ApprovalStatus | string | null;
  client_response?: string | null;
  requested_at?: string | null;
  responded_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ListClientTasksQuery = {
  page?: number;
  limit?: number;
  search?: string;
  project_id?: string;
  status?: ClientTaskStatus | string;
  due_from?: string;
  due_to?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
};

export type ListClientAssetsQuery = {
  page?: number;
  limit?: number;
  search?: string;
  project_id?: string;
  status?: ClientAssetStatus | string;
  asset_type?: ClientAssetType | string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
};

export type ListApprovalRequestsQuery = {
  page?: number;
  limit?: number;
  search?: string;
  project_id?: string;
  status?: ApprovalStatus | string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
};

export type ClientTaskInput = {
  title: string;
  description?: string;
  due_date?: string;
  status?: ClientTaskStatus;
  visible_to_client?: boolean;
};

export type ClientAssetInput = {
  title: string;
  description?: string;
  asset_type?: ClientAssetType;
  file_url?: string;
  status?: ClientAssetStatus;
  required?: boolean;
};

export type ApprovalRequestInput = {
  title: string;
  description?: string;
  related_stage?: string;
  status?: ApprovalStatus;
};

export const clientActionsApi = platformApi.injectEndpoints({
  endpoints: (builder) => ({
    listClientTasks: builder.query<
      PaginatedResult<ClientTask>,
      ListClientTasksQuery | void
    >({
      query: (params) => ({
        url: "/admin/client-tasks",
        params: {
          page: 1,
          limit: 100,
          sort_by: "due_date",
          sort_order: "asc",
          ...(params ?? {}),
        },
      }),
      transformResponse: (response: ApiResponse<PaginatedResult<ClientTask>>) =>
        unwrapApiResponse(response),
      providesTags: ["ClientTasks"],
    }),
    createClientTask: builder.mutation<
      ClientTask,
      { projectId: string; body: ClientTaskInput }
    >({
      query: ({ projectId, body }) => ({
        url: `/admin/client-projects/${projectId}/tasks`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ClientTask>) =>
        unwrapApiResponse(response),
      invalidatesTags: ["ClientTasks", "ClientProjects"],
    }),
    updateClientTask: builder.mutation<
      ClientTask,
      { id: string; body: ClientTaskInput }
    >({
      query: ({ id, body }) => ({
        url: `/admin/client-tasks/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: ApiResponse<ClientTask>) =>
        unwrapApiResponse(response),
      invalidatesTags: ["ClientTasks", "ClientProjects"],
    }),
    approveClientTask: builder.mutation<ClientTask, string>({
      query: (id) => ({
        url: `/admin/client-tasks/${id}/approve`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<ClientTask>) =>
        unwrapApiResponse(response),
      invalidatesTags: ["ClientTasks", "ClientProjects"],
    }),
    rejectClientTask: builder.mutation<ClientTask, string>({
      query: (id) => ({
        url: `/admin/client-tasks/${id}/reject`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<ClientTask>) =>
        unwrapApiResponse(response),
      invalidatesTags: ["ClientTasks", "ClientProjects"],
    }),
    deleteClientTask: builder.mutation<{ id: string; deleted: boolean }, string>({
      query: (id) => ({
        url: `/admin/client-tasks/${id}`,
        method: "DELETE",
      }),
      transformResponse: (
        response: ApiResponse<{ id: string; deleted: boolean }>
      ) => unwrapApiResponse(response),
      invalidatesTags: ["ClientTasks", "ClientProjects"],
    }),

    listClientAssets: builder.query<
      PaginatedResult<ClientAsset>,
      ListClientAssetsQuery | void
    >({
      query: (params) => ({
        url: "/admin/client-assets",
        params: {
          page: 1,
          limit: 100,
          sort_by: "created_at",
          sort_order: "desc",
          ...(params ?? {}),
        },
      }),
      transformResponse: (response: ApiResponse<PaginatedResult<ClientAsset>>) =>
        unwrapApiResponse(response),
      providesTags: ["ClientAssets"],
    }),
    createClientAsset: builder.mutation<
      ClientAsset,
      { projectId: string; body: ClientAssetInput }
    >({
      query: ({ projectId, body }) => ({
        url: `/admin/client-projects/${projectId}/assets`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ClientAsset>) =>
        unwrapApiResponse(response),
      invalidatesTags: ["ClientAssets", "ClientProjects"],
    }),
    updateClientAsset: builder.mutation<
      ClientAsset,
      { id: string; body: ClientAssetInput }
    >({
      query: ({ id, body }) => ({
        url: `/admin/client-assets/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: ApiResponse<ClientAsset>) =>
        unwrapApiResponse(response),
      invalidatesTags: ["ClientAssets", "ClientProjects"],
    }),
    approveClientAsset: builder.mutation<ClientAsset, string>({
      query: (id) => ({
        url: `/admin/client-assets/${id}/approve`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<ClientAsset>) =>
        unwrapApiResponse(response),
      invalidatesTags: ["ClientAssets", "ClientProjects"],
    }),
    requestClientAssetRevision: builder.mutation<ClientAsset, string>({
      query: (id) => ({
        url: `/admin/client-assets/${id}/request-revision`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<ClientAsset>) =>
        unwrapApiResponse(response),
      invalidatesTags: ["ClientAssets", "ClientProjects"],
    }),
    deleteClientAsset: builder.mutation<{ id: string; deleted: boolean }, string>({
      query: (id) => ({
        url: `/admin/client-assets/${id}`,
        method: "DELETE",
      }),
      transformResponse: (
        response: ApiResponse<{ id: string; deleted: boolean }>
      ) => unwrapApiResponse(response),
      invalidatesTags: ["ClientAssets", "ClientProjects"],
    }),

    listApprovalRequests: builder.query<
      PaginatedResult<ApprovalRequest>,
      ListApprovalRequestsQuery | void
    >({
      query: (params) => ({
        url: "/admin/approval-requests",
        params: {
          page: 1,
          limit: 100,
          sort_by: "requested_at",
          sort_order: "desc",
          ...(params ?? {}),
        },
      }),
      transformResponse: (
        response: ApiResponse<PaginatedResult<ApprovalRequest>>
      ) => unwrapApiResponse(response),
      providesTags: ["ApprovalRequests"],
    }),
    createApprovalRequest: builder.mutation<
      ApprovalRequest,
      { projectId: string; body: ApprovalRequestInput }
    >({
      query: ({ projectId, body }) => ({
        url: `/admin/client-projects/${projectId}/approval-requests`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ApprovalRequest>) =>
        unwrapApiResponse(response),
      invalidatesTags: ["ApprovalRequests", "ClientProjects"],
    }),
    updateApprovalRequest: builder.mutation<
      ApprovalRequest,
      { id: string; body: ApprovalRequestInput }
    >({
      query: ({ id, body }) => ({
        url: `/admin/approval-requests/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: ApiResponse<ApprovalRequest>) =>
        unwrapApiResponse(response),
      invalidatesTags: ["ApprovalRequests", "ClientProjects"],
    }),
    cancelApprovalRequest: builder.mutation<ApprovalRequest, string>({
      query: (id) => ({
        url: `/admin/approval-requests/${id}/cancel`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<ApprovalRequest>) =>
        unwrapApiResponse(response),
      invalidatesTags: ["ApprovalRequests", "ClientProjects"],
    }),
    deleteApprovalRequest: builder.mutation<
      { id: string; deleted: boolean },
      string
    >({
      query: (id) => ({
        url: `/admin/approval-requests/${id}`,
        method: "DELETE",
      }),
      transformResponse: (
        response: ApiResponse<{ id: string; deleted: boolean }>
      ) => unwrapApiResponse(response),
      invalidatesTags: ["ApprovalRequests", "ClientProjects"],
    }),
  }),
});

export const {
  useListClientTasksQuery,
  useCreateClientTaskMutation,
  useUpdateClientTaskMutation,
  useApproveClientTaskMutation,
  useRejectClientTaskMutation,
  useDeleteClientTaskMutation,
  useListClientAssetsQuery,
  useCreateClientAssetMutation,
  useUpdateClientAssetMutation,
  useApproveClientAssetMutation,
  useRequestClientAssetRevisionMutation,
  useDeleteClientAssetMutation,
  useListApprovalRequestsQuery,
  useCreateApprovalRequestMutation,
  useUpdateApprovalRequestMutation,
  useCancelApprovalRequestMutation,
  useDeleteApprovalRequestMutation,
} = clientActionsApi;
