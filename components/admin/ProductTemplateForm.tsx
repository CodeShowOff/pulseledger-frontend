"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  useCreateProductTemplate,
  useUpdateProductTemplate,
  type ProductTemplate,
} from "@/lib/queries/products";
import getErrorMessage from "@/lib/getErrorMessage";

const formSchema = z
  .object({
    name: z.string().min(2).max(100),
    description: z.string().max(1000).optional(),
    mrp: z.coerce.number().min(0),
    price: z.coerce.number().min(0),
    category: z.string().max(50).optional(),
    companyName: z.string().max(100).optional(),
    imageUrl: z
      .union([z.string().url(), z.literal("")])
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
    tags: z.string().optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
  })
  .refine((data) => data.price <= data.mrp, {
    path: ["price"],
    message: "Price cannot be greater than MRP",
  });

type FormValues = z.infer<typeof formSchema>;

type Props = {
  template?: ProductTemplate;
};

export default function ProductTemplateForm({ template }: Props) {
  const router = useRouter();
  const createMutation = useCreateProductTemplate();
  const updateMutation = useUpdateProductTemplate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: template?.name || "",
      description: template?.description || "",
      mrp: template?.mrp ?? 0,
      price: template?.price ?? 0,
      category: template?.category || "",
      companyName: template?.companyName || "",
      imageUrl: template?.imageUrl || "",
      tags: (template?.tags || []).join(", "),
      isActive: template?.isActive ?? true,
      isFeatured: template?.isFeatured ?? false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    const payload: Partial<ProductTemplate> = {
      name: values.name,
      description: values.description || undefined,
      mrp: values.mrp,
      price: values.price,
      category: values.category || undefined,
      companyName: values.companyName || undefined,
      imageUrl: values.imageUrl || undefined,
      tags: values.tags
        ? values.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
      isActive: values.isActive ?? true,
      isFeatured: values.isFeatured ?? false,
    };

    try {
      if (template?._id) {
        await updateMutation.mutateAsync({ id: template._id, data: payload });
        toast.success("Product template updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Product template created");
      }

      router.push("/admin/product-templates");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to save product template"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="admin-card" style={{ padding: "1rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.35rem" }}>
            Template Name
          </label>
          <input {...register("name")} className="admin-input" placeholder="e.g. Whey Protein (Standard)" />
          {errors.name ? (
            <p style={{ color: "var(--admin-color-danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
              {errors.name.message}
            </p>
          ) : null}
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.35rem" }}>
            Category
          </label>
          <input {...register("category")} className="admin-input" placeholder="e.g. protein" />
          {errors.category ? (
            <p style={{ color: "var(--admin-color-danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
              {errors.category.message}
            </p>
          ) : null}
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.35rem" }}>
            Company Name
          </label>
          <input {...register("companyName")} className="admin-input" placeholder="e.g. Herbalife" />
          {errors.companyName ? (
            <p style={{ color: "var(--admin-color-danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
              {errors.companyName.message}
            </p>
          ) : null}
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.35rem" }}>
            MRP (₹)
          </label>
          <input {...register("mrp")} type="number" min={0} step="0.01" className="admin-input" />
          {errors.mrp ? (
            <p style={{ color: "var(--admin-color-danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
              {errors.mrp.message}
            </p>
          ) : null}
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.35rem" }}>
            Price (₹)
          </label>
          <input {...register("price")} type="number" min={0} step="0.01" className="admin-input" />
          {errors.price ? (
            <p style={{ color: "var(--admin-color-danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
              {errors.price.message}
            </p>
          ) : null}
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.35rem" }}>
            Description
          </label>
          <textarea
            {...register("description")}
            className="admin-input"
            rows={4}
            placeholder="Write a short product template description..."
          />
          {errors.description ? (
            <p style={{ color: "var(--admin-color-danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
              {errors.description.message}
            </p>
          ) : null}
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.35rem" }}>
            Image URL
          </label>
          <input {...register("imageUrl")} className="admin-input" placeholder="https://..." />
          {errors.imageUrl ? (
            <p style={{ color: "var(--admin-color-danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
              {errors.imageUrl.message}
            </p>
          ) : null}
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.35rem" }}>
            Tags (comma-separated)
          </label>
          <input {...register("tags")} className="admin-input" placeholder="e.g. whey, high-protein" />
        </div>

        <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
          <label style={{ display: "inline-flex", gap: "0.5rem", alignItems: "center" }}>
            <input type="checkbox" {...register("isActive")} />
            Active
          </label>
          <label style={{ display: "inline-flex", gap: "0.5rem", alignItems: "center" }}>
            <input type="checkbox" {...register("isFeatured")} />
            Featured
          </label>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.25rem" }}>
        <button type="button" className="btn btn--outline" onClick={() => router.back()}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
          {template?._id ? "Save Changes" : "Create Template"}
        </button>
      </div>
    </form>
  );
}
