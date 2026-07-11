import { platformApi } from "@/lib/api/base-api";
import type { ApiResponse, PaginatedResult } from "@/lib/api/types";
import { unwrapApiResponse } from "@/lib/api/types";

export type CatalogFeature = {
  id?: string;
  feature?: string;
  sort_order?: number;
};

export type CatalogFeatureInput = {
  feature: string;
  sort_order?: number;
};

export type ServicePackage = {
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
  is_active?: boolean;
  cta_label?: string;
  features?: CatalogFeature[];
  created_at?: string;
  updated_at?: string;
};

export type CarePlan = {
  id: string;
  name?: string;
  slug?: string;
  monthly_price?: number;
  price_label?: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
  features?: CatalogFeature[];
  created_at?: string;
  updated_at?: string;
};

export type ListCatalogQuery = {
  page?: number;
  limit?: number;
  search?: string;
  active?: "true" | "false";
  featured?: "true" | "false";
  package_type?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
};

export type UpsertServicePackageInput = {
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
  is_active?: boolean;
  cta_label?: string;
  features?: CatalogFeatureInput[];
};

export type UpsertCarePlanInput = {
  name?: string;
  slug?: string;
  monthly_price?: number;
  price_label?: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
  features?: CatalogFeatureInput[];
};

export const catalogApi = platformApi.injectEndpoints({
  endpoints: (builder) => ({
    listServicePackages: builder.query<
      PaginatedResult<ServicePackage>,
      ListCatalogQuery | void
    >({
      query: (params) => ({
        url: "/admin/service-packages",
        params: {
          limit: 100,
          sort_by: "display_order",
          sort_order: "asc",
          ...(params ?? {}),
        },
      }),
      transformResponse: (response: ApiResponse<PaginatedResult<ServicePackage>>) =>
        unwrapApiResponse(response),
      providesTags: ["ServicePackages", "Catalog"],
    }),
    getServicePackage: builder.query<ServicePackage, string>({
      query: (id) => `/admin/service-packages/${id}`,
      transformResponse: (response: ApiResponse<ServicePackage>) =>
        unwrapApiResponse(response),
      providesTags: (_result, _error, id) => [
        { type: "ServicePackages", id },
        "Catalog",
      ],
    }),
    createServicePackage: builder.mutation<
      ServicePackage,
      UpsertServicePackageInput
    >({
      query: (body) => ({
        url: "/admin/service-packages",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ServicePackage>) =>
        unwrapApiResponse(response),
      invalidatesTags: ["ServicePackages", "Catalog"],
    }),
    updateServicePackage: builder.mutation<
      ServicePackage,
      { id: string; body: UpsertServicePackageInput }
    >({
      query: ({ id, body }) => ({
        url: `/admin/service-packages/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: ApiResponse<ServicePackage>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "ServicePackages", id },
        "ServicePackages",
        "Catalog",
      ],
    }),
    deactivateServicePackage: builder.mutation<ServicePackage, string>({
      query: (id) => ({
        url: `/admin/service-packages/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<ServicePackage>) =>
        unwrapApiResponse(response),
      invalidatesTags: ["ServicePackages", "Catalog"],
    }),
    listCarePlans: builder.query<PaginatedResult<CarePlan>, ListCatalogQuery | void>(
      {
        query: (params) => ({
          url: "/admin/care-plans",
          params: {
            limit: 100,
            sort_by: "display_order",
            sort_order: "asc",
            ...(params ?? {}),
          },
        }),
        transformResponse: (response: ApiResponse<PaginatedResult<CarePlan>>) =>
          unwrapApiResponse(response),
        providesTags: ["CarePlans", "Catalog"],
      }
    ),
    getCarePlan: builder.query<CarePlan, string>({
      query: (id) => `/admin/care-plans/${id}`,
      transformResponse: (response: ApiResponse<CarePlan>) =>
        unwrapApiResponse(response),
      providesTags: (_result, _error, id) => [
        { type: "CarePlans", id },
        "Catalog",
      ],
    }),
    createCarePlan: builder.mutation<CarePlan, UpsertCarePlanInput>({
      query: (body) => ({
        url: "/admin/care-plans",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<CarePlan>) =>
        unwrapApiResponse(response),
      invalidatesTags: ["CarePlans", "Catalog"],
    }),
    updateCarePlan: builder.mutation<
      CarePlan,
      { id: string; body: UpsertCarePlanInput }
    >({
      query: ({ id, body }) => ({
        url: `/admin/care-plans/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: ApiResponse<CarePlan>) =>
        unwrapApiResponse(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "CarePlans", id },
        "CarePlans",
        "Catalog",
      ],
    }),
    deactivateCarePlan: builder.mutation<CarePlan, string>({
      query: (id) => ({
        url: `/admin/care-plans/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<CarePlan>) =>
        unwrapApiResponse(response),
      invalidatesTags: ["CarePlans", "Catalog"],
    }),
  }),
});

export const {
  useListServicePackagesQuery,
  useLazyGetServicePackageQuery,
  useCreateServicePackageMutation,
  useUpdateServicePackageMutation,
  useDeactivateServicePackageMutation,
  useListCarePlansQuery,
  useLazyGetCarePlanQuery,
  useCreateCarePlanMutation,
  useUpdateCarePlanMutation,
  useDeactivateCarePlanMutation,
} = catalogApi;
