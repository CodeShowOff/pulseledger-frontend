"use client";

import React, { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import api from "@/lib/axios";
import { toast } from "sonner";

const ProductSchema = z.object({
  name: z.string().min(2, "Name too short").max(100),
  description: z.string().max(1000).optional(),
  mrp: z.number({ invalid_type_error: "MRP must be a number" }).min(0),
  price: z.number({ invalid_type_error: "Price must be a number" }).min(0),
  category: z.string().max(50).optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

type ProductFormData = z.infer<typeof ProductSchema>;

export default function ProductForm() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>("");
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<ProductFormData>({
    resolver: zodResolver(ProductSchema),
    defaultValues: { name: "", description: "", mrp: undefined, price: undefined, category: "", imageUrl: "", isActive: true },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: ProductFormData) => {
      return await api.post("/products", payload);
    },
    onSuccess: () => {
      toast.success("Product created");
      reset();
      queryClient.invalidateQueries({ queryKey: ["coachProducts"] });
    },
    onError: (err: AxiosError<{ message?: string }>) => toast.error((err.response?.data as { message?: string })?.message || "Failed to create product"),
  });

  const onSubmit = useCallback(
    (data: ProductFormData) => {
      createMutation.mutate(data);
    },
    [createMutation]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-form" style={{ width: "100%" }}>
      <div className="auth-form__field">
        <label className="auth-form__label">Name</label>
        <input {...register("name")} className="auth-form__input" />
        {errors.name && (
          <p className="auth-form__error">{errors.name.message}</p>
        )}
      </div>

      <div className="auth-form__field">
        <label className="auth-form__label">Description</label>
        <textarea
          {...register("description")}
          rows={3}
          className="auth-form__input"
          style={{ resize: "vertical" }}
        />
      </div>

      <div className="admin-card-grid" style={{ columnGap: "1rem", rowGap: "1rem" }}>
        <div className="auth-form__field">
          <label className="auth-form__label">MRP (₹)</label>
          <input
            type="number"
            step="0.01"
            {...register("mrp", { valueAsNumber: true })}
            className="auth-form__input"
          />
          {errors.mrp && (
            <p className="auth-form__error">{errors.mrp.message}</p>
          )}
        </div>
        <div className="auth-form__field">
          <label className="auth-form__label">Selling Price (₹)</label>
          <input
            type="number"
            step="0.01"
            {...register("price", { valueAsNumber: true })}
            className="auth-form__input"
          />
          {errors.price && (
            <p className="auth-form__error">{errors.price.message}</p>
          )}
        </div>
      </div>

      <div className="auth-form__field">
        <label className="auth-form__label">Category</label>
        <input
          {...register("category")}
          className="auth-form__input"
        />
      </div>

      <div className="auth-form__field">
        <label className="auth-form__label">Product Image</label>
        {preview && (
          <div style={{ marginBottom: "0.5rem" }}>
            <Image src={preview} alt="Preview" width={120} height={120} style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" }} />
          </div>
        )}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <input {...register("imageUrl")} placeholder="or paste URL manually" className="auth-form__input" />
          <label className="btn btn--outline" style={{ cursor: uploading ? "default" : "pointer" }}>
            {uploading ? "Uploading..." : "Upload"}
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              disabled={uploading}
              ref={imageInputRef}
              onChange={async (e) => {
                if (!e.target.files || !e.target.files[0]) return;
                const file = e.target.files[0];
                const form = new FormData();
                form.append("image", file);
                try {
                  setUploading(true);
                  const res = await api.post("/products/upload-image", form, { headers: { "Content-Type": "multipart/form-data" } });
                  const url = res.data?.data?.imageUrl as string;
                  if (url) {
                    setPreview(url);
                    setValue("imageUrl", url, { shouldValidate: true, shouldDirty: true });
                  }
                } catch (err) {
                  // Error uploading product image
                } finally {
                  setUploading(false);
                  if (imageInputRef.current) imageInputRef.current.value = "";
                }
              }}
            />
          </label>
        </div>
      </div>

      <div
        className="auth-form__field"
        style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
      >
        <input id="isActive" type="checkbox" {...register("isActive")} defaultChecked />
        <label htmlFor="isActive" className="auth-form__label" style={{ marginBottom: 0 }}>
          Active
        </label>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn--primary"
        >
          {isSubmitting ? "Saving..." : "Create Product"}
        </button>
      </div>
    </form>
  );
}
