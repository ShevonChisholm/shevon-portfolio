import { platformApi } from "@/lib/api/base-api";
import type { ApiResponse, PaginatedResult } from "@/lib/api/types";
import { unwrapApiResponse } from "@/lib/api/types";

export const documentTypes = ["Proposal", "Invoice", "Receipt", "Contract", "Scope Document", "Brand Asset", "Client Upload", "Project File", "Handoff Document", "Launch Checklist", "Other"] as const;
export const documentVisibilities = ["Admin Only", "Client Visible"] as const;
export const changeRequestStatuses = ["Draft", "Submitted", "Under Review", "Approved", "Rejected", "Cancelled", "Completed"] as const;

export type DocumentType = (typeof documentTypes)[number];
export type DocumentVisibility = (typeof documentVisibilities)[number];
export type ChangeRequestStatus = (typeof changeRequestStatuses)[number];

export type ProjectDocument = {
  id: string; client_project_id?: string | null; client_id?: string | null;
  title?: string | null; description?: string | null; document_type?: string | null;
  file_url?: string | null; visibility?: string | null; uploaded_by_type?: string | null;
  uploaded_by_id?: string | null; created_at?: string | null; updated_at?: string | null;
};
export type ProjectDocumentInput = { title: string; description?: string; document_type?: DocumentType; file_url: string; visibility?: DocumentVisibility };
export type ListDocumentsQuery = { page?: number; limit?: number; search?: string; client_id?: string; client_project_id?: string; document_type?: string; visibility?: string; sort_by?: string; sort_order?: "asc" | "desc" };

export type ChangeRequestItem = { id?: string; change_request_id?: string | null; title: string; description?: string | null; estimated_cost?: number | null; estimated_days?: number | null; sort_order?: number | null };
export type ChangeRequest = {
  id: string; client_project_id?: string | null; requested_by_type?: string | null;
  requested_by_id?: string | null; title?: string | null; description?: string | null;
  reason?: string | null; impact_on_timeline?: string | null; additional_cost?: number | null;
  status?: ChangeRequestStatus | string | null; admin_notes?: string | null;
  client_response?: string | null; requested_at?: string | null; responded_at?: string | null;
  created_at?: string | null; updated_at?: string | null; items?: ChangeRequestItem[];
};
export type ChangeRequestItemInput = { title: string; description?: string; estimated_cost?: number; estimated_days?: number; sort_order?: number };
export type ChangeRequestInput = { title: string; description?: string; reason?: string; impact_on_timeline?: string; additional_cost?: number; status?: ChangeRequestStatus; admin_notes?: string; client_response?: string; items?: ChangeRequestItemInput[] };
export type ListChangeRequestsQuery = { page?: number; limit?: number; search?: string; client_id?: string; client_project_id?: string; status?: string; requested_by_type?: "Admin" | "Client"; sort_by?: string; sort_order?: "asc" | "desc" };
export type ApproveChangeRequestInput = { admin_notes?: string; create_payment_milestone?: boolean; create_project_milestone?: boolean; payment_due_date?: string; milestone_title?: string };

export const workflowsApi = platformApi.injectEndpoints({
  endpoints: (builder) => ({
    listAdminDocuments: builder.query<PaginatedResult<ProjectDocument>, ListDocumentsQuery | void>({
      query: (params) => ({ url: "/admin/documents", params: { page: 1, limit: 100, sort_by: "created_at", sort_order: "desc", ...(params ?? {}) } }),
      transformResponse: (response: ApiResponse<PaginatedResult<ProjectDocument>>) => unwrapApiResponse(response), providesTags: ["ProjectDocuments"],
    }),
    createAdminDocument: builder.mutation<ProjectDocument, { projectId: string; body: ProjectDocumentInput }>({
      query: ({ projectId, body }) => ({ url: `/admin/client-projects/${projectId}/documents`, method: "POST", body }),
      transformResponse: (response: ApiResponse<ProjectDocument>) => unwrapApiResponse(response), invalidatesTags: ["ProjectDocuments", "ClientProjects"],
    }),
    updateAdminDocument: builder.mutation<ProjectDocument, { id: string; body: ProjectDocumentInput }>({
      query: ({ id, body }) => ({ url: `/admin/documents/${id}`, method: "PATCH", body }),
      transformResponse: (response: ApiResponse<ProjectDocument>) => unwrapApiResponse(response), invalidatesTags: ["ProjectDocuments", "ClientProjects"],
    }),
    deleteAdminDocument: builder.mutation<{ id: string; deleted: boolean }, string>({
      query: (id) => ({ url: `/admin/documents/${id}`, method: "DELETE" }),
      transformResponse: (response: ApiResponse<{ id: string; deleted: boolean }>) => unwrapApiResponse(response), invalidatesTags: ["ProjectDocuments", "ClientProjects"],
    }),
    listAdminChangeRequests: builder.query<PaginatedResult<ChangeRequest>, ListChangeRequestsQuery | void>({
      query: (params) => ({ url: "/admin/change-requests", params: { page: 1, limit: 100, sort_by: "created_at", sort_order: "desc", ...(params ?? {}) } }),
      transformResponse: (response: ApiResponse<PaginatedResult<ChangeRequest>>) => unwrapApiResponse(response), providesTags: ["ChangeRequests"],
    }),
    getAdminChangeRequest: builder.query<ChangeRequest, string>({
      query: (id) => `/admin/change-requests/${id}`,
      transformResponse: (response: ApiResponse<ChangeRequest>) => unwrapApiResponse(response), providesTags: (_r, _e, id) => [{ type: "ChangeRequests", id }, "ChangeRequests"],
    }),
    createAdminChangeRequest: builder.mutation<ChangeRequest, { projectId: string; body: ChangeRequestInput }>({
      query: ({ projectId, body }) => ({ url: `/admin/client-projects/${projectId}/change-requests`, method: "POST", body }),
      transformResponse: (response: ApiResponse<ChangeRequest>) => unwrapApiResponse(response), invalidatesTags: ["ChangeRequests", "ClientProjects"],
    }),
    updateAdminChangeRequest: builder.mutation<ChangeRequest, { id: string; body: ChangeRequestInput }>({
      query: ({ id, body }) => ({ url: `/admin/change-requests/${id}`, method: "PATCH", body }),
      transformResponse: (response: ApiResponse<ChangeRequest>) => unwrapApiResponse(response), invalidatesTags: (_r, _e, { id }) => [{ type: "ChangeRequests", id }, "ChangeRequests", "ClientProjects"],
    }),
    replaceChangeRequestItems: builder.mutation<ChangeRequestItem[], { id: string; items: ChangeRequestItemInput[] }>({
      query: ({ id, items }) => ({ url: `/admin/change-requests/${id}/items`, method: "PUT", body: { items } }),
      transformResponse: (response: ApiResponse<ChangeRequestItem[]>) => unwrapApiResponse(response), invalidatesTags: (_r, _e, { id }) => [{ type: "ChangeRequests", id }, "ChangeRequests"],
    }),
    approveChangeRequest: builder.mutation<ChangeRequest, { id: string; body: ApproveChangeRequestInput }>({
      query: ({ id, body }) => ({ url: `/admin/change-requests/${id}/approve`, method: "POST", body }),
      transformResponse: (response: ApiResponse<ChangeRequest>) => unwrapApiResponse(response), invalidatesTags: ["ChangeRequests", "ClientProjects"],
    }),
    rejectChangeRequest: builder.mutation<ChangeRequest, { id: string; admin_notes?: string }>({
      query: ({ id, admin_notes }) => ({ url: `/admin/change-requests/${id}/reject`, method: "POST", body: { admin_notes } }),
      transformResponse: (response: ApiResponse<ChangeRequest>) => unwrapApiResponse(response), invalidatesTags: ["ChangeRequests", "ClientProjects"],
    }),
    completeChangeRequest: builder.mutation<ChangeRequest, string>({
      query: (id) => ({ url: `/admin/change-requests/${id}/complete`, method: "POST" }),
      transformResponse: (response: ApiResponse<ChangeRequest>) => unwrapApiResponse(response), invalidatesTags: ["ChangeRequests", "ClientProjects"],
    }),
    deleteChangeRequest: builder.mutation<{ id: string; deleted: boolean }, string>({
      query: (id) => ({ url: `/admin/change-requests/${id}`, method: "DELETE" }),
      transformResponse: (response: ApiResponse<{ id: string; deleted: boolean }>) => unwrapApiResponse(response), invalidatesTags: ["ChangeRequests", "ClientProjects"],
    }),
  }),
});

export const { useListAdminDocumentsQuery, useCreateAdminDocumentMutation, useUpdateAdminDocumentMutation, useDeleteAdminDocumentMutation, useListAdminChangeRequestsQuery, useGetAdminChangeRequestQuery, useCreateAdminChangeRequestMutation, useUpdateAdminChangeRequestMutation, useReplaceChangeRequestItemsMutation, useApproveChangeRequestMutation, useRejectChangeRequestMutation, useCompleteChangeRequestMutation, useDeleteChangeRequestMutation } = workflowsApi;
