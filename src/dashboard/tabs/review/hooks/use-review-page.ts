import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { ReviewDto } from "@api/contracts";
import { useStrings } from "@/shared/i18n";
import { getErrorMessage } from "../lib/get-error-message";
import { strings } from "../strings";
import { useDeleteReviews } from "./use-delete-reviews";
import { useReviews } from "./use-reviews";

const PER_PAGE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export function useReviewPage() {
  const s = useStrings(strings);

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ReadonlySet<number>>(
    () => new Set()
  );
  const [detail, setDetail] = useState<ReviewDto | null>(null);
  const [deleteIds, setDeleteIds] = useState<number[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setSearch(query.trim()),
      SEARCH_DEBOUNCE_MS
    );
    return () => window.clearTimeout(timer);
  }, [query]);

  const reviews = useReviews({ page, per_page: PER_PAGE, q: search });
  const remove = useDeleteReviews();

  const data = reviews.data;
  const items = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;
  const pageIds = items.map((review) => review.id);
  const allSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  const changeQuery = (value: string) => {
    setQuery(value);
    setPage(1);
    setSelected(new Set());
  };

  const changePage = (next: number) => {
    setPage(next);
    setSelected(new Set());
  };

  const select = (ids: number[], on: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      for (const id of ids) {
        if (on) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const openReview = (review: ReviewDto) => setDetail(review);
  const closeReview = () => setDetail(null);

  const requestDelete = (ids: number[]) => {
    setDetail(null);
    setDeleteIds(ids);
    setIsConfirmOpen(true);
  };

  const cancelDelete = () => setIsConfirmOpen(false);

  const confirmDelete = () => {
    const ids = deleteIds;
    remove.mutate(ids, {
      onSuccess: () => {
        toast.success(s.toast.deleted);
        setIsConfirmOpen(false);
        setSelected(
          (current) => new Set([...current].filter((id) => !ids.includes(id)))
        );
      },
      onError: (error) => {
        toast.error(getErrorMessage(s.errors, error));
      },
    });
  };

  return {
    reviews,
    query,
    changeQuery,
    page: data?.page ?? page,
    totalPages,
    changePage,
    pageIds,
    selected,
    selectedCount: selected.size,
    allSelected,
    select,
    clearSelection,
    requestDeleteSelected: () => requestDelete([...selected]),
    detail,
    openReview,
    closeReview,
    requestDeleteDetail: () => {
      if (detail) requestDelete([detail.id]);
    },
    deleteIds,
    isConfirmOpen,
    cancelDelete,
    confirmDelete,
    isDeleting: remove.isPending,
  };
}
