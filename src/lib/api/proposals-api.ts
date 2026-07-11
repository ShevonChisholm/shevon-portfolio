import { platformApi } from "@/lib/api/base-api";
import type { Lead } from "@/lib/api/leads-api";
import type { Client, ClientProjectSummary } from "@/lib/api/clients-api";
import type { ApiResponse, PaginatedResult } from "@/lib/api/types";
import { unwrapApiResponse } from "@/lib/api/types";

export const proposalStatuses = [
  "Draft",
  "Sent",
  "Viewed",
  "Accepted",
  "Rejected",
  "Expired",
  "Archived",
] as const;

export const proposalSectionTypes = [
  "Executive Summary",
  "Business Understanding",
  "Proposed Solution",
  "Scope of Work",
  "Deliverables",
  "Timeline",
  "Investment",
  "Payment Terms",
  "Optional Add-ons",
  "Care Plan",
  "Assumptions",
  "Notes",
] as const;

export type ProposalStatus = (typeof proposalStatuses)[number];
export type ProposalSectionType = (typeof proposalSectionTypes)[number];

export type ProposalSection = {
  id?: string;
  proposal_id?: string;
  section_type?: ProposalSectionType | string;
  title?: string;
  content?: string;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
};

export type ProposalSummary = {
  id: string;
  title?: string;
  status?: ProposalStatus | string | null;
  lead_id?: string | null;
  client_id?: string | null;
  package_id?: string | null;
  care_plan_id?: string | null;
  total_amount?: number | null;
  payment_terms?: string | null;
  expires_at?: string | null;
  sent_at?: string | null;
  viewed_at?: string | null;
  accepted_at?: string | null;
  rejected_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ProposalRelatedSummary = {
  id?: string;
  name?: string | null;
  slug?: string | null;
};

export type ProposalLeadSummary = Pick<
  Lead,
  "id" | "full_name" | "business_name" | "email" | "status"
>;

export type ProposalClientSummary = Pick<Client, "id" | "business_name" | "status">;

export type ProposalDetail = ProposalSummary & {
  sections?: ProposalSection[];
  lead?: ProposalLeadSummary | null;
  client?: ProposalClientSummary | null;
  package?: ProposalRelatedSummary | null;
  care_plan?: ProposalRelatedSummary | null;
  client_project?: ClientProjectSummary | null;
};

export type ListProposalsQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProposalStatus | string;
  lead_id?: string;
  client_id?: string;
  package_id?: string;
  care_plan_id?: string;
  date_from?: string;
  date_to?: string;
  expires_soon?: boolean;
  sort_by?: string;
  sort_order?: "asc" | "desc";
};

export type ProposalSectionInput = {
  section_type: ProposalSectionType;
  title: string;
  content: string;
  sort_order?: number;
};

export type UpsertProposalInput = {
  lead_id?: string;
  client_id?: string;
  package_id?: string;
  care_plan_id?: string;
  title: string;
  status?: ProposalStatus;
  total_amount?: number;
  payment_terms?: string;
  expires_at?: string;
  sections?: ProposalSectionInput[];
};

export type GenerateProposalAccessInput = {
  expires_in_days?: number;
  purpose?: "Proposal Review" | "Proposal Acceptance";
  revoke_existing?: boolean;
};

export type ProposalAccessLinkResponse = {
  access_token?: {
    id?: string;
    proposal_id?: string;
    purpose?: string;
    status?: string;
    expires_at?: string;
    created_at?: string;
  };
  public_url: string;
  expires_at?: string;
};

export type SendProposalResponse = {
  proposal?: ProposalDetail;
  public_url?: string;
  expires_at?: string;
};

export const proposalsApi = platformApi.injectEndpoints({
  endpoints: (builder) => ({
    listProposals: builder.query<
      PaginatedResult<ProposalSummary>,
      ListProposalsQuery | void
    >({
      query: (params) => ({
        url: "/admin/proposals",
        params: {
          page: 1,
          limit: 25,
          sort_by: "created_at",
          sort_order: "desc",
          ...(params ?? {}),
        },
      }),
      transformResponse: (response: ApiResponse<PaginatedResult<ProposalSummary>>) =>
        unwrapApiResponse(response),
      providesTags: ["Proposals"],
    }),
    getProposal: builder.query<ProposalDetail, string>({
      query: (id) => `/admin/proposals/${id}`,
      transformResponse: (response: ApiResponse<ProposalDetail>) =>
        unwrapApiResponse(response),
      providesTags: (_result, _error, id) => [
        { type: "Proposals", id },
        "ProposalSections",
      ],
    }),
    createProposal: builder.mutation<ProposalDetail, UpsertProposalInput>({
      query: (body) => ({
        url: "/admin/proposals",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ProposalDetail>) =>
        unwrapApiResponse(response),
      invalidatesTags: ["Proposals", "ProposalSections", "Leads", "Clients"],
    }),
    updateProposal: builder.mutation<
      ProposalDetail,
      { id: string; body: UpsertProposalInput }
    >({
      query: ({ id, body }) => ({
        url: `/admin/proposals/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: ApiResponse<ProposalDetail>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Proposals", id },
        "Proposals",
      ],
    }),
    replaceProposalSections: builder.mutation<
      ProposalDetail,
      { id: string; sections: ProposalSectionInput[] }
    >({
      query: ({ id, sections }) => ({
        url: `/admin/proposals/${id}/sections`,
        method: "PUT",
        body: sections,
      }),
      transformResponse: (response: ApiResponse<ProposalDetail>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Proposals", id },
        "ProposalSections",
      ],
    }),
    sendProposal: builder.mutation<SendProposalResponse, string>({
      query: (id) => ({
        url: `/admin/proposals/${id}/send`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<SendProposalResponse>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, id) => [
        { type: "Proposals", id },
        "Proposals",
      ],
    }),
    generateProposalAccessLink: builder.mutation<
      ProposalAccessLinkResponse,
      { id: string; body: GenerateProposalAccessInput }
    >({
      query: ({ id, body }) => ({
        url: `/admin/proposals/${id}/generate-access-link`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ProposalAccessLinkResponse>) =>
        unwrapApiResponse(response),
    }),
    revokeProposalAccessLinks: builder.mutation<
      { proposal_id: string; revoked: boolean },
      string
    >({
      query: (id) => ({
        url: `/admin/proposals/${id}/revoke-access-links`,
        method: "POST",
      }),
      transformResponse: (
        response: ApiResponse<{ proposal_id: string; revoked: boolean }>
      ) => unwrapApiResponse(response),
      invalidatesTags: (_result, _error, id) => [
        { type: "Proposals", id },
        "Proposals",
      ],
    }),
    archiveProposal: builder.mutation<
      { id: string; status: string; archived: boolean },
      string
    >({
      query: (id) => ({
        url: `/admin/proposals/${id}`,
        method: "DELETE",
      }),
      transformResponse: (
        response: ApiResponse<{ id: string; status: string; archived: boolean }>
      ) => unwrapApiResponse(response),
      invalidatesTags: ["Proposals"],
    }),
  }),
});

export const {
  useListProposalsQuery,
  useGetProposalQuery,
  useCreateProposalMutation,
  useUpdateProposalMutation,
  useReplaceProposalSectionsMutation,
  useSendProposalMutation,
  useGenerateProposalAccessLinkMutation,
  useRevokeProposalAccessLinksMutation,
  useArchiveProposalMutation,
} = proposalsApi;
