"use client";

import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaginationToken = number | "ellipsis";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildPaginationItems(
  currentPage: number,
  totalPages: number,
  maxVisiblePages: number
): PaginationToken[] {
  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const windowSize = Math.max(3, maxVisiblePages - 2);
  let start = Math.max(2, currentPage - Math.floor(windowSize / 2));
  let end = start + windowSize - 1;

  if (end > totalPages - 1) {
    end = totalPages - 1;
    start = Math.max(2, end - windowSize + 1);
  }

  const items: PaginationToken[] = [1];

  if (start > 2) {
    items.push("ellipsis");
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (end < totalPages - 1) {
    items.push("ellipsis");
  }

  items.push(totalPages);

  return items;
}

type CompactPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  maxVisiblePages?: number;
};

export default function CompactPagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  maxVisiblePages = 5,
}: CompactPaginationProps) {
  const safeTotalPages = Math.max(1, totalPages || 1);
  const safeCurrentPage = clamp(currentPage || 1, 1, safeTotalPages);
  const safeMaxVisiblePages = Math.max(5, maxVisiblePages);

  const paginationItems = useMemo(
    () =>
      buildPaginationItems(
        safeCurrentPage,
        safeTotalPages,
        safeMaxVisiblePages
      ),
    [safeCurrentPage, safeMaxVisiblePages, safeTotalPages]
  );

  if (safeTotalPages <= 1) {
    return null;
  }

  const goToPage = (page: number) => {
    const nextPage = clamp(page, 1, safeTotalPages);
    if (nextPage !== safeCurrentPage) {
      onPageChange(nextPage);
    }
  };

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex max-w-full items-center justify-center gap-1",
        className
      )}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => goToPage(safeCurrentPage - 1)}
        disabled={safeCurrentPage === 1}
        aria-label="Go to previous page"
        className="h-7 w-7 min-w-7 rounded-lg p-0 text-slate-700 disabled:text-slate-400"
      >
        <ChevronLeft className="h-4 w-4 shrink-0 stroke-[2.5]" />
      </Button>

      <div className="flex max-w-full items-center justify-center gap-1">
        {paginationItems.map((item, index) => {
          if (item === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                aria-hidden="true"
                className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-1 text-slate-500"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </span>
            );
          }

          const isActive = item === safeCurrentPage;

          return (
            <Button
              key={item}
              type="button"
              variant={isActive ? "default" : "outline"}
              size="sm"
              aria-current={isActive ? "page" : undefined}
              aria-label={`Go to page ${item}`}
              onClick={() => goToPage(item)}
              className="h-7 min-w-7 rounded-lg px-1.5 text-[11px]"
            >
              {item}
            </Button>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => goToPage(safeCurrentPage + 1)}
        disabled={safeCurrentPage === safeTotalPages}
        aria-label="Go to next page"
        className="h-7 w-7 min-w-7 rounded-lg p-0 text-slate-700 disabled:text-slate-400"
      >
        <ChevronRight className="h-4 w-4 shrink-0 stroke-[2.5]" />
      </Button>
    </nav>
  );
}