import {
  type ApprovalRequest,
  type ClientAsset,
  type ClientTask,
  type ListApprovalRequestsQuery,
  type ListClientAssetsQuery,
  type ListClientTasksQuery,
} from "@/lib/api/client-actions-api";
import { platformApi } from "@/lib/api/base-api";
import type { ApiResponse, PaginatedResult } from "@/lib/api/types";
import { unwrapApiResponse } from "@/lib/api/types";

export type ClientPortalProject = {
  id: string;
  client_id?: string | null;
  title?: string | null;
  name?: string | null;
  description?: string | null;
  summary?: string | null;
  status?: string | null;
  current_stage?: string | null;
  progress_percent?: number | null;
  start_date?: string | null;
  estimated_completion_date?: string | null;
  completed_at?: string | null;
  payment_status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ClientPortalUpdate = {
  id?: string;
  client_project_id?: string;
  title?: string;
  description?: string | null;
  stage?: string | null;
  visible_to_client?: boolean | null;
  requires_client_action?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ClientPortalNextBestAction = {
  type?: string;
  title?: string;
  description?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  cta_label?: string;
};

export type ClientPortalPaymentSummary = {
  id?: string;
  title?: string;
  amount_due?: number;
  due_date?: string;
  status?: string;
};

export type ClientPaymentMilestone = {
  id?: string;
  client_project_id?: string;
  title?: string | null;
  description?: string | null;
  amount?: number | null;
  currency?: string | null;
  due_date?: string | null;
  status?: string | null;
  sort_order?: number | null;
  paid_amount?: number | null;
  outstanding_amount?: number | null;
  calculated_status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ClientPaymentRecord = {
  id?: string;
  client_project_id?: string;
  payment_milestone_id?: string | null;
  amount_paid?: number | null;
  payment_date?: string | null;
  payment_method?: string | null;
  reference_number?: string | null;
  receipt_url?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ClientProjectPaymentSummary = {
  total_project_value?: number;
  total_milestone_amount?: number;
  total_paid?: number;
  total_outstanding?: number;
  overdue_amount?: number;
  next_payment_due?: ClientPaymentMilestone | null;
  payment_status?: string;
  milestones_count?: number;
  paid_milestones_count?: number;
  overdue_milestones_count?: number;
  milestones?: ClientPaymentMilestone[];
};

export type ClientPaymentProjectBundle = {
  project: ClientPortalProject;
  summary: ClientProjectPaymentSummary;
  milestones: ClientPaymentMilestone[];
  records: ClientPaymentRecord[];
};

export type ClientPaymentsResponse = {
  projects: ClientPaymentProjectBundle[];
};

export type ClientProjectDocument = {
  id?: string;
  client_project_id?: string | null;
  client_id?: string | null;
  title?: string | null;
  description?: string | null;
  document_type?: string | null;
  file_url?: string | null;
  visibility?: string | null;
  uploaded_by_type?: string | null;
  uploaded_by_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ClientSupportRequest = {
  id?: string;
  client_id?: string | null;
  client_project_id?: string | null;
  care_plan_id?: string | null;
  title?: string | null;
  description?: string | null;
  request_type?: string | null;
  status?: string | null;
  priority?: string | null;
  is_billable?: boolean | null;
  included_in_care_plan?: boolean | null;
  estimated_cost?: number | null;
  client_response?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ClientCarePlan = {
  id?: string;
  client_id?: string | null;
  client_project_id?: string | null;
  care_plan_id?: string | null;
  status?: string | null;
  start_date?: string | null;
  renewal_date?: string | null;
  monthly_amount?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ClientLaunchChecklistItem = {
  id?: string;
  client_project_id?: string | null;
  title?: string | null;
  description?: string | null;
  category?: string | null;
  completed?: boolean | null;
  completed_at?: string | null;
  sort_order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ClientChangeRequestItem = {
  id?: string;
  change_request_id?: string | null;
  title?: string | null;
  description?: string | null;
  estimated_cost?: number | null;
  estimated_days?: number | null;
  sort_order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ClientChangeRequest = {
  id?: string;
  client_project_id?: string | null;
  requested_by_type?: string | null;
  requested_by_id?: string | null;
  title?: string | null;
  description?: string | null;
  reason?: string | null;
  impact_on_timeline?: string | null;
  additional_cost?: number | null;
  status?: string | null;
  admin_notes?: string | null;
  client_response?: string | null;
  requested_at?: string | null;
  responded_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  items?: ClientChangeRequestItem[];
};

export type ClientTestimonialRequest = {
  id?: string;
  client_id?: string | null;
  client_project_id?: string | null;
  status?: string | null;
  requested_at?: string | null;
  completed_at?: string | null;
  reminder_sent_at?: string | null;
  testimonial_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ClientCaseStudyRequest = {
  id?: string;
  client_project_id?: string | null;
  status?: string | null;
  title?: string | null;
  summary?: string | null;
  permission_granted?: boolean | null;
  portfolio_project_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type CreateClientDocumentInput = {
  title: string;
  description?: string;
  document_type?: string;
  file_url: string;
  visibility?: string;
};

export type CreateClientSupportRequestInput = {
  title: string;
  description?: string;
  request_type: string;
  priority?: string;
};

export type CreateClientChangeRequestInput = {
  title: string;
  description?: string;
  reason?: string;
  impact_on_timeline?: string;
  additional_cost?: number;
  items?: Array<{
    title: string;
    description?: string;
    estimated_cost?: number;
    estimated_days?: number;
    sort_order?: number;
  }>;
};

export type ClientChangeRequestResponseInput = {
  client_response: string;
  accept_terms?: boolean;
};

export type ClientSupportResponseInput = {
  message: string;
};

export type SubmitClientTestimonialInput = {
  name: string;
  email?: string;
  company?: string;
  role?: string;
  project_name?: string;
  rating?: number;
  feedback: string;
  consent_to_publish: boolean;
};

export type CreateCheckoutSessionInput = {
  success_url?: string;
  cancel_url?: string;
};

export type CheckoutSessionResponse = {
  checkout_url?: string;
  session?: {
    id?: string;
    status?: string;
    amount?: number;
    expires_at?: string | null;
  };
};

export type ClientPortalDashboard = {
  client?: {
    id?: string;
    name?: string;
    status?: string;
  };
  primary_active_project?: ClientPortalProject | null;
  project_count: number;
  pending_tasks_count: number;
  missing_required_assets_count: number;
  pending_approvals_count: number;
  upcoming_payment_summary?: ClientPortalPaymentSummary | null;
  latest_visible_project_updates?: ClientPortalUpdate[];
  next_best_action?: ClientPortalNextBestAction;
};

export type ClientProjectDetail = {
  project: ClientPortalProject;
  milestones?: Array<Record<string, unknown>>;
  updates?: ClientPortalUpdate[];
  tasks?: ClientTask[];
  assets?: ClientAsset[];
  approvals?: ApprovalRequest[];
  payment_summary?: Record<string, unknown>;
  onboarding_summary?: Record<string, unknown> | null;
  document_count?: number;
  latest_client_visible_documents?: Array<Record<string, unknown>>;
  open_change_request_count?: number;
  latest_change_requests?: Array<Record<string, unknown>>;
  care_plan_summary?: Record<string, unknown> | null;
  open_support_request_count?: number;
  launch_checklist_progress?: Record<string, unknown> | null;
  pending_testimonial_request?: Record<string, unknown> | null;
  case_study_permission_request?: Record<string, unknown> | null;
  next_best_action?: ClientPortalNextBestAction;
};

export type SubmitClientTaskInput = {
  submission_note?: string;
  submission_url?: string;
};

export type SubmitClientAssetInput = {
  submission_note?: string;
  file_url?: string;
};

export type ApprovalResponseInput = {
  client_response?: string;
};

export type ApprovalChangesInput = {
  client_response: string;
};

export const clientPortalApi = platformApi.injectEndpoints({
  endpoints: (builder) => ({
    getClientDashboard: builder.query<ClientPortalDashboard, void>({
      query: () => "/client/dashboard",
      transformResponse: (response: ApiResponse<ClientPortalDashboard>) =>
        unwrapApiResponse(response),
      providesTags: ["ClientPortal", "ClientPortalProjects"],
    }),
    listClientPortalProjects: builder.query<ClientPortalProject[], void>({
      query: () => "/client/projects",
      transformResponse: (response: ApiResponse<ClientPortalProject[]>) =>
        unwrapApiResponse(response),
      providesTags: ["ClientPortalProjects"],
    }),
    getClientPortalProject: builder.query<ClientProjectDetail, string>({
      query: (projectId) => `/client/projects/${projectId}`,
      transformResponse: (response: ApiResponse<ClientProjectDetail>) =>
        unwrapApiResponse(response),
      providesTags: (_result, _error, projectId) => [
        { type: "ClientPortalProjects", id: projectId },
        "ClientPortalProjects",
      ],
    }),
    listClientPortalTasks: builder.query<
      PaginatedResult<ClientTask>,
      ListClientTasksQuery | void
    >({
      query: (params) => ({
        url: "/client/tasks",
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
      providesTags: ["ClientTasks", "ClientPortal"],
    }),
    submitClientTask: builder.mutation<
      ClientTask,
      { id: string; body: SubmitClientTaskInput }
    >({
      query: ({ id, body }) => ({
        url: `/client/tasks/${id}/submit`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ClientTask>) =>
        unwrapApiResponse(response),
      invalidatesTags: ["ClientTasks", "ClientPortal", "ClientPortalProjects"],
    }),
    listClientPortalAssets: builder.query<
      PaginatedResult<ClientAsset>,
      ListClientAssetsQuery | void
    >({
      query: (params) => ({
        url: "/client/assets",
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
      providesTags: ["ClientAssets", "ClientPortal"],
    }),
    submitClientAsset: builder.mutation<
      ClientAsset,
      { id: string; body: SubmitClientAssetInput }
    >({
      query: ({ id, body }) => ({
        url: `/client/assets/${id}/submit`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ClientAsset>) =>
        unwrapApiResponse(response),
      invalidatesTags: ["ClientAssets", "ClientPortal", "ClientPortalProjects"],
    }),
    listClientPortalApprovals: builder.query<
      PaginatedResult<ApprovalRequest>,
      ListApprovalRequestsQuery | void
    >({
      query: (params) => ({
        url: "/client/approvals",
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
      providesTags: ["ApprovalRequests", "ClientPortal"],
    }),
    getClientPayments: builder.query<ClientPaymentsResponse, void>({
      query: () => "/client/payments",
      transformResponse: (response: ApiResponse<ClientPaymentsResponse>) =>
        unwrapApiResponse(response),
      providesTags: ["ClientPayments", "ClientPortal"],
    }),
    createClientPaymentCheckoutSession: builder.mutation<
      CheckoutSessionResponse,
      { id: string; body: CreateCheckoutSessionInput }
    >({
      query: ({ id, body }) => ({
        url: `/client/payment-milestones/${id}/create-checkout-session`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<CheckoutSessionResponse>) =>
        unwrapApiResponse(response),
      invalidatesTags: ["ClientPayments", "ClientPortal"],
    }),
    listClientDocuments: builder.query<ClientProjectDocument[], void>({
      query: () => "/client/documents",
      transformResponse: (response: ApiResponse<ClientProjectDocument[]>) =>
        unwrapApiResponse(response),
      providesTags: ["ClientDocuments", "ClientPortal"],
    }),
    listClientProjectDocuments: builder.query<ClientProjectDocument[], string>({
      query: (projectId) => `/client/projects/${projectId}/documents`,
      transformResponse: (response: ApiResponse<ClientProjectDocument[]>) =>
        unwrapApiResponse(response),
      providesTags: (_result, _error, projectId) => [
        { type: "ClientDocuments", id: projectId },
        "ClientDocuments",
      ],
    }),
    createClientDocument: builder.mutation<
      ClientProjectDocument,
      { projectId: string; body: CreateClientDocumentInput }
    >({
      query: ({ projectId, body }) => ({
        url: `/client/projects/${projectId}/documents`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ClientProjectDocument>) =>
        unwrapApiResponse(response),
      invalidatesTags: [
        "ClientDocuments",
        "ClientPortal",
        "ClientPortalProjects",
      ],
    }),
    listClientSupportRequests: builder.query<ClientSupportRequest[], void>({
      query: () => "/client/support-requests",
      transformResponse: (response: ApiResponse<ClientSupportRequest[]>) =>
        unwrapApiResponse(response),
      providesTags: ["ClientSupport", "ClientPortal"],
    }),
    listClientProjectSupportRequests: builder.query<
      ClientSupportRequest[],
      string
    >({
      query: (projectId) => `/client/projects/${projectId}/support-requests`,
      transformResponse: (response: ApiResponse<ClientSupportRequest[]>) =>
        unwrapApiResponse(response),
      providesTags: (_result, _error, projectId) => [
        { type: "ClientSupport", id: projectId },
        "ClientSupport",
      ],
    }),
    createClientSupportRequest: builder.mutation<
      ClientSupportRequest,
      { projectId: string; body: CreateClientSupportRequestInput }
    >({
      query: ({ projectId, body }) => ({
        url: `/client/projects/${projectId}/support-requests`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ClientSupportRequest>) =>
        unwrapApiResponse(response),
      invalidatesTags: [
        "ClientSupport",
        "ClientPortal",
        "ClientPortalProjects",
      ],
    }),
    respondToClientSupportRequest: builder.mutation<
      ClientSupportRequest,
      { id: string; body: ClientSupportResponseInput }
    >({
      query: ({ id, body }) => ({
        url: `/client/support-requests/${id}/respond`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ClientSupportRequest>) =>
        unwrapApiResponse(response),
      invalidatesTags: ["ClientSupport", "ClientPortal", "ClientPortalProjects"],
    }),
    listClientCarePlans: builder.query<ClientCarePlan[], void>({
      query: () => "/client/care-plan",
      transformResponse: (response: ApiResponse<ClientCarePlan[]>) =>
        unwrapApiResponse(response),
      providesTags: ["ClientCarePlans", "ClientPortal"],
    }),
    getClientProjectCarePlan: builder.query<ClientCarePlan | null, string>({
      query: (projectId) => `/client/projects/${projectId}/care-plan`,
      transformResponse: (response: ApiResponse<ClientCarePlan | null>) =>
        unwrapApiResponse(response),
      providesTags: (_result, _error, projectId) => [
        { type: "ClientCarePlans", id: projectId },
        "ClientCarePlans",
      ],
    }),
    listClientProjectLaunchChecklist: builder.query<
      ClientLaunchChecklistItem[],
      string
    >({
      query: (projectId) => `/client/projects/${projectId}/launch-checklist`,
      transformResponse: (response: ApiResponse<ClientLaunchChecklistItem[]>) =>
        unwrapApiResponse(response),
      providesTags: (_result, _error, projectId) => [
        { type: "ClientLaunchChecklist", id: projectId },
        "ClientLaunchChecklist",
        "ClientPortal",
      ],
    }),
    listClientChangeRequests: builder.query<ClientChangeRequest[], void>({
      query: () => "/client/change-requests",
      transformResponse: (response: ApiResponse<ClientChangeRequest[]>) =>
        unwrapApiResponse(response),
      providesTags: ["ClientChangeRequests", "ClientPortal"],
    }),
    listClientProjectChangeRequests: builder.query<
      ClientChangeRequest[],
      string
    >({
      query: (projectId) => `/client/projects/${projectId}/change-requests`,
      transformResponse: (response: ApiResponse<ClientChangeRequest[]>) =>
        unwrapApiResponse(response),
      providesTags: (_result, _error, projectId) => [
        { type: "ClientChangeRequests", id: projectId },
        "ClientChangeRequests",
        "ClientPortal",
      ],
    }),
    createClientChangeRequest: builder.mutation<
      ClientChangeRequest,
      { projectId: string; body: CreateClientChangeRequestInput }
    >({
      query: ({ projectId, body }) => ({
        url: `/client/projects/${projectId}/change-requests`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ClientChangeRequest>) =>
        unwrapApiResponse(response),
      invalidatesTags: [
        "ClientChangeRequests",
        "ClientPortal",
        "ClientPortalProjects",
      ],
    }),
    respondToClientChangeRequest: builder.mutation<
      ClientChangeRequest,
      { id: string; body: ClientChangeRequestResponseInput }
    >({
      query: ({ id, body }) => ({
        url: `/client/change-requests/${id}/respond`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ClientChangeRequest>) =>
        unwrapApiResponse(response),
      invalidatesTags: [
        "ClientChangeRequests",
        "ClientPortal",
        "ClientPortalProjects",
      ],
    }),
    listClientTestimonialRequests: builder.query<
      ClientTestimonialRequest[],
      void
    >({
      query: () => "/client/testimonial-requests",
      transformResponse: (response: ApiResponse<ClientTestimonialRequest[]>) =>
        unwrapApiResponse(response),
      providesTags: ["ClientTestimonials", "ClientPortal"],
    }),
    submitClientTestimonial: builder.mutation<
      ClientTestimonialRequest,
      { id: string; body: SubmitClientTestimonialInput }
    >({
      query: ({ id, body }) => ({
        url: `/client/testimonial-requests/${id}/submit`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ClientTestimonialRequest>) =>
        unwrapApiResponse(response),
      invalidatesTags: [
        "ClientTestimonials",
        "ClientPortal",
        "ClientPortalProjects",
      ],
    }),
    listClientCaseStudyRequests: builder.query<
      ClientCaseStudyRequest[],
      void
    >({
      query: () => "/client/case-study-requests",
      transformResponse: (response: ApiResponse<ClientCaseStudyRequest[]>) =>
        unwrapApiResponse(response),
      providesTags: ["ClientCaseStudies", "ClientPortal"],
    }),
    grantClientCaseStudyPermission: builder.mutation<
      ClientCaseStudyRequest,
      string
    >({
      query: (id) => ({
        url: `/client/case-study-requests/${id}/grant-permission`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<ClientCaseStudyRequest>) =>
        unwrapApiResponse(response),
      invalidatesTags: [
        "ClientCaseStudies",
        "ClientPortal",
        "ClientPortalProjects",
      ],
    }),
    declineClientCaseStudyPermission: builder.mutation<
      ClientCaseStudyRequest,
      string
    >({
      query: (id) => ({
        url: `/client/case-study-requests/${id}/decline`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<ClientCaseStudyRequest>) =>
        unwrapApiResponse(response),
      invalidatesTags: [
        "ClientCaseStudies",
        "ClientPortal",
        "ClientPortalProjects",
      ],
    }),
    approveClientPortalApproval: builder.mutation<
      ApprovalRequest,
      { id: string; body: ApprovalResponseInput }
    >({
      query: ({ id, body }) => ({
        url: `/client/approvals/${id}/approve`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ApprovalRequest>) =>
        unwrapApiResponse(response),
      invalidatesTags: [
        "ApprovalRequests",
        "ClientPortal",
        "ClientPortalProjects",
      ],
    }),
    requestClientPortalApprovalChanges: builder.mutation<
      ApprovalRequest,
      { id: string; body: ApprovalChangesInput }
    >({
      query: ({ id, body }) => ({
        url: `/client/approvals/${id}/request-changes`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ApprovalRequest>) =>
        unwrapApiResponse(response),
      invalidatesTags: [
        "ApprovalRequests",
        "ClientPortal",
        "ClientPortalProjects",
      ],
    }),
  }),
});

export const {
  useCreateClientDocumentMutation,
  useCreateClientChangeRequestMutation,
  useCreateClientPaymentCheckoutSessionMutation,
  useCreateClientSupportRequestMutation,
  useApproveClientPortalApprovalMutation,
  useDeclineClientCaseStudyPermissionMutation,
  useGrantClientCaseStudyPermissionMutation,
  useGetClientPaymentsQuery,
  useGetClientDashboardQuery,
  useGetClientPortalProjectQuery,
  useGetClientProjectCarePlanQuery,
  useListClientCarePlansQuery,
  useListClientCaseStudyRequestsQuery,
  useListClientChangeRequestsQuery,
  useListClientProjectLaunchChecklistQuery,
  useListClientProjectChangeRequestsQuery,
  useListClientTestimonialRequestsQuery,
  useListClientDocumentsQuery,
  useListClientProjectDocumentsQuery,
  useListClientSupportRequestsQuery,
  useListClientProjectSupportRequestsQuery,
  useListClientPortalApprovalsQuery,
  useListClientPortalAssetsQuery,
  useListClientPortalProjectsQuery,
  useListClientPortalTasksQuery,
  useRespondToClientChangeRequestMutation,
  useRespondToClientSupportRequestMutation,
  useRequestClientPortalApprovalChangesMutation,
  useSubmitClientTestimonialMutation,
  useSubmitClientAssetMutation,
  useSubmitClientTaskMutation,
} = clientPortalApi;
