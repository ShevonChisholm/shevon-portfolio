import { platformApi } from "@/lib/api/base-api";
import type { ApiResponse } from "@/lib/api/types";
import { unwrapApiResponse } from "@/lib/api/types";

export type PublicCatalogFeature = {
  id?: string;
  feature?: string;
  sort_order?: number;
};

export type PublicServicePackage = {
  id: string;
  name?: string;
  slug?: string;
  subtitle?: string;
  description?: string;
  starting_price?: number;
  price_label?: string;
  timeline?: string;
  package_type?: string;
  display_order?: number;
  is_featured?: boolean;
  cta_label?: string;
  features?: PublicCatalogFeature[];
};

export type PublicCarePlan = {
  id: string;
  name?: string;
  slug?: string;
  monthly_price?: number;
  price_label?: string;
  description?: string;
  display_order?: number;
  features?: PublicCatalogFeature[];
};

export type PublicContactInput = {
  name: string;
  email: string;
  subject?: string;
  message: string;
  source?: string;
};

export type StartProjectInput = {
  full_name: string;
  business_name?: string;
  email: string;
  phone?: string;
  industry?: string;
  current_website_url?: string;
  social_url?: string;
  package_id?: string;
  package_slug?: string;
  source?: string;
  budget_range?: string;
  desired_timeline?: string;
  project_goals?: string;
  problem_to_solve?: string;
  features_needed?: string[];
  additional_notes?: string;
};

export type PublicLeadResponse = {
  id?: string;
  status?: string;
  full_name?: string;
  business_name?: string;
  email?: string;
  source?: string;
};

export const publicServicesApi = platformApi.injectEndpoints({
  endpoints: (builder) => ({
    listPublicServicePackages: builder.query<PublicServicePackage[], void>({
      query: () => "/public/service-packages",
      transformResponse: (response: ApiResponse<PublicServicePackage[]>) =>
        unwrapApiResponse(response),
    }),
    getPublicServicePackage: builder.query<PublicServicePackage, string>({
      query: (slug) => `/public/service-packages/${encodeURIComponent(slug)}`,
      transformResponse: (response: ApiResponse<PublicServicePackage>) =>
        unwrapApiResponse(response),
    }),
    listPublicCarePlans: builder.query<PublicCarePlan[], void>({
      query: () => "/public/care-plans",
      transformResponse: (response: ApiResponse<PublicCarePlan[]>) =>
        unwrapApiResponse(response),
    }),
    submitPublicContact: builder.mutation<unknown, PublicContactInput>({
      query: (body) => ({
        url: "/public/contact",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        unwrapApiResponse(response),
    }),
    startProject: builder.mutation<PublicLeadResponse, StartProjectInput>({
      query: (body) => ({
        url: "/public/leads/start-project",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<PublicLeadResponse>) =>
        unwrapApiResponse(response),
    }),
  }),
});

export const {
  useGetPublicServicePackageQuery,
  useListPublicCarePlansQuery,
  useListPublicServicePackagesQuery,
  useStartProjectMutation,
  useSubmitPublicContactMutation,
} = publicServicesApi;
