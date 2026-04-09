import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export type ProductTemplate = {
  _id: string;
  name: string;
  description?: string;
  mrp: number;
  price: number;
  category?: string;
  companyName?: string;
  imageUrl?: string;
  imagePublicId?: string | null;
  tags?: string[];
  usageCount: number;
  isActive: boolean;
  isFeatured: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductTemplateMetadata = {
  categories: string[];
  companies: string[];
  suggestedCategories: string[];
};

type ProductTemplatesResponse = {
  success: boolean;
  data: ProductTemplate[];
  pagination: { total: number; page: number; totalPages: number; limit: number };
};

type BulkCreateFromTemplatesResponse = {
  success: boolean;
  message: string;
  data: {
    createdProducts: Array<{ _id: string; templateId?: string }>;
    createdCount: number;
    skipped: Array<{ templateId: string; templateName?: string; reason: string }>;
    skippedCount: number;
  };
};

export const PRODUCT_TEMPLATES_KEY = ["productTemplates"] as const;

export const fetchProductTemplates = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  companyName?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.category) searchParams.append("category", params.category);
  if (params?.companyName) searchParams.append("companyName", params.companyName);
  if (params?.isActive !== undefined) searchParams.append("isActive", params.isActive.toString());
  if (params?.isFeatured !== undefined) searchParams.append("isFeatured", params.isFeatured.toString());

  const res = await api.get(`/product-templates?${searchParams.toString()}`);
  return res.data as ProductTemplatesResponse;
};

export function useProductTemplates(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  companyName?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}) {
  return useQuery({
    queryKey: [...PRODUCT_TEMPLATES_KEY, params],
    queryFn: () => fetchProductTemplates(params),
  });
}

export function useProductTemplate(id: string) {
  return useQuery({
    queryKey: [...PRODUCT_TEMPLATES_KEY, id],
    queryFn: async () => {
      const res = await api.get(`/product-templates/${id}`);
      return res.data.data as ProductTemplate;
    },
    enabled: !!id,
  });
}

export function useProductTemplateMetadata() {
  return useQuery({
    queryKey: [...PRODUCT_TEMPLATES_KEY, "metadata"],
    queryFn: async () => {
      const res = await api.get("/product-templates/metadata");
      return res.data.data as ProductTemplateMetadata;
    },
  });
}

export function useCreateProductTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ProductTemplate>) => {
      const res = await api.post("/product-templates", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_TEMPLATES_KEY });
    },
  });
}

export function useUpdateProductTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProductTemplate> }) => {
      const res = await api.patch(`/product-templates/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_TEMPLATES_KEY });
    },
  });
}

export function useDeleteProductTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/product-templates/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_TEMPLATES_KEY });
    },
  });
}

export function useCreateProductFromTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      data,
    }: {
      templateId: string;
      data?: {
        name?: string;
        description?: string;
        mrp?: number;
        price?: number;
        category?: string;
        imageUrl?: string;
        isActive?: boolean;
        allowDuplicate?: boolean;
      };
    }) => {
      const res = await api.post(`/products/from-template/${templateId}`, data || {});
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coachProducts"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: PRODUCT_TEMPLATES_KEY });
    },
  });
}

export function useCreateProductsFromTemplatesBulk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateIds,
      allowDuplicate,
    }: {
      templateIds: string[];
      allowDuplicate?: boolean;
    }) => {
      const res = await api.post("/products/from-templates/bulk", {
        templateIds,
        allowDuplicate,
      });
      return res.data as BulkCreateFromTemplatesResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coachProducts"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: PRODUCT_TEMPLATES_KEY });
    },
  });
}
