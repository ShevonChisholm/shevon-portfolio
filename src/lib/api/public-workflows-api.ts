import { platformApi } from "@/lib/api/base-api";
import type { ApiResponse } from "@/lib/api/types";
import { unwrapApiResponse } from "@/lib/api/types";

export type PublicProposalSection = {
  title?: string;
  section_type?: string;
  content?: string;
};

export type PublicProposalView = {
  proposal: {
    id: string;
    title?: string;
    status?: string;
    total_amount?: number;
    payment_terms?: string;
    expires_at?: string;
    sections?: PublicProposalSection[];
    lead?: {
      full_name?: string;
      business_name?: string;
    } | null;
    client?: {
      business_name?: string;
    } | null;
    package?: {
      name?: string;
      slug?: string;
    } | null;
    care_plan?: {
      name?: string;
      slug?: string;
    } | null;
    generated_pdf?: {
      public_url?: string;
      signed_url?: string;
      expires_in?: number;
    } | null;
  };
  access?: {
    expires_at?: string;
    purpose?: string;
  };
  business?: {
    name?: string;
    context?: string;
    settings?: Array<{ key?: string; value?: unknown }>;
  };
};

export type PublicProposalAcceptInput = {
  accepted_by_name: string;
  accepted_by_email: string;
  phone?: string;
  response_message?: string;
  accept_terms: boolean;
  create_portal_invitation?: boolean;
};

export type PublicProposalAcceptResponse = {
  proposal?: {
    id?: string;
    title?: string;
    status?: string;
  };
  client_id?: string;
  client_contact_id?: string;
  client_project?: {
    id?: string;
    title?: string;
    name?: string;
    status?: string;
    current_stage?: string;
  };
  portal_invitation?: {
    portal_url?: string;
    expires_at?: string;
  } | null;
};

export type PublicProposalRejectInput = {
  rejected_by_name?: string;
  rejected_by_email?: string;
  reason?: string;
};

export type PublicClientInvitationView = {
  id: string;
  client?: {
    name?: string;
  };
  contact_email?: string;
  contact_name?: string;
  expires_at?: string;
  status?: string;
};

export type PublicClientInvitationAcceptInput = {
  email: string;
  full_name?: string;
};

export type PublicClientInvitationAcceptResponse =
  | {
      next_step: "authenticate_or_signup";
      email?: string;
      message?: string;
    }
  | {
      invitation?: {
        id?: string;
        status?: string;
        accepted_at?: string;
      };
      client_id?: string;
      client_contact_id?: string;
      portal_access_enabled?: boolean;
    };

export const publicWorkflowsApi = platformApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublicProposal: builder.query<PublicProposalView, string>({
      query: (token) => `/public/proposals/${encodeURIComponent(token)}`,
      transformResponse: (response: ApiResponse<PublicProposalView>) =>
        unwrapApiResponse(response),
    }),
    markPublicProposalViewed: builder.mutation<
      { proposal_id?: string; viewed?: boolean },
      string
    >({
      query: (token) => ({
        url: `/public/proposals/${encodeURIComponent(token)}/viewed`,
        method: "POST",
      }),
      transformResponse: (
        response: ApiResponse<{ proposal_id?: string; viewed?: boolean }>
      ) => unwrapApiResponse(response),
    }),
    acceptPublicProposal: builder.mutation<
      PublicProposalAcceptResponse,
      { token: string; body: PublicProposalAcceptInput }
    >({
      query: ({ token, body }) => ({
        url: `/public/proposals/${encodeURIComponent(token)}/accept`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<PublicProposalAcceptResponse>) =>
        unwrapApiResponse(response),
    }),
    rejectPublicProposal: builder.mutation<
      { proposal_id?: string; status?: string },
      { token: string; body: PublicProposalRejectInput }
    >({
      query: ({ token, body }) => ({
        url: `/public/proposals/${encodeURIComponent(token)}/reject`,
        method: "POST",
        body,
      }),
      transformResponse: (
        response: ApiResponse<{ proposal_id?: string; status?: string }>
      ) => unwrapApiResponse(response),
    }),
    getPublicClientInvitation: builder.query<PublicClientInvitationView, string>({
      query: (token) => `/public/client-invitations/${encodeURIComponent(token)}`,
      transformResponse: (response: ApiResponse<PublicClientInvitationView>) =>
        unwrapApiResponse(response),
    }),
    acceptPublicClientInvitation: builder.mutation<
      PublicClientInvitationAcceptResponse,
      { token: string; body: PublicClientInvitationAcceptInput }
    >({
      query: ({ token, body }) => ({
        url: `/public/client-invitations/${encodeURIComponent(token)}/accept`,
        method: "POST",
        body,
      }),
      transformResponse: (
        response: ApiResponse<PublicClientInvitationAcceptResponse>
      ) => unwrapApiResponse(response),
    }),
  }),
});

export const {
  useAcceptPublicClientInvitationMutation,
  useAcceptPublicProposalMutation,
  useGetPublicClientInvitationQuery,
  useGetPublicProposalQuery,
  useMarkPublicProposalViewedMutation,
  useRejectPublicProposalMutation,
} = publicWorkflowsApi;
