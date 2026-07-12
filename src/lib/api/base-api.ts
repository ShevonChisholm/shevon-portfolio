import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { getApiBaseUrl } from "@/lib/api/api-config";
import type { AuthSession } from "@/lib/api/auth-types";
import { clearStoredSession, saveStoredSession } from "@/lib/auth/auth-storage";
import { clearSession, setSession } from "@/lib/auth/auth-slice";
import type { RootState } from "@/lib/store/store";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

const baseQueryWithRefresh: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status !== 401) {
    return result;
  }

  const state = api.getState() as RootState;
  const refreshToken = state.auth.refreshToken;

  if (!refreshToken) {
    api.dispatch(clearSession());
    clearStoredSession();
    return result;
  }

  const refreshResult = await rawBaseQuery(
    {
      url: "/auth/refresh",
      method: "POST",
      body: {
        refresh_token: refreshToken,
        audience: state.auth.context?.is_admin ? "Admin" : "Auto",
      },
    },
    api,
    extraOptions
  );

  if (refreshResult.data) {
    const session = refreshResult.data as AuthSession;
    api.dispatch(setSession(session));
    saveStoredSession(session);
    result = await rawBaseQuery(args, api, extraOptions);
  } else {
    api.dispatch(clearSession());
    clearStoredSession();
  }

  return result;
};

export const platformApi = createApi({
  reducerPath: "platformApi",
  baseQuery: baseQueryWithRefresh,
  tagTypes: [
    "Auth",
    "AdminRoles",
    "AdminUsers",
    "ActivityLogs",
    "Leads",
    "FollowUps",
    "DiscoveryResponses",
    "Clients",
    "ClientProjects",
    "ClientTasks",
    "ClientAssets",
    "ApprovalRequests",
    "ClientPayments",
    "ClientDocuments",
    "ClientSupport",
    "ClientCarePlans",
    "ClientLaunchChecklist",
    "ClientChangeRequests",
    "ClientTestimonials",
    "ClientCaseStudies",
    "ClientPortal",
    "ClientPortalProjects",
    "ServicePackages",
    "CarePlans",
    "Catalog",
    "Proposals",
    "ProposalSections",
    "Settings",
  ],
  endpoints: () => ({}),
});
