import { useStrings } from "@/shared/i18n";
import { BulkBar } from "./components/bulk-bar";
import { DeleteConfirmDialog } from "./components/delete-confirm-dialog";
import { Pagination } from "./components/pagination";
import { ReviewDetailDialog } from "./components/review-detail-dialog";
import { ReviewResults } from "./components/review-results";
import { ReviewSearch } from "./components/review-search";
import { useReviewPage } from "./hooks/use-review-page";
import { strings } from "./strings";

const STYLES = {
  page: "flex w-full flex-col gap-5",
  title: "text-title font-bold text-balance text-navy",
} as const;

export function ReviewTab() {
  const s = useStrings(strings);
  const review = useReviewPage();

  return (
    <section className={STYLES.page}>
      <h1 className={STYLES.title}>{s.title}</h1>

      <ReviewSearch value={review.query} onChange={review.changeQuery} />

      {review.selectedCount > 0 && (
        <BulkBar
          selectedCount={review.selectedCount}
          allSelected={review.allSelected}
          isDeleting={review.isDeleting}
          onSelectAll={() => review.select(review.pageIds, true)}
          onClear={review.clearSelection}
          onDelete={review.requestDeleteSelected}
        />
      )}

      <ReviewResults
        reviews={review.reviews}
        hasQuery={review.query.trim() !== ""}
        selected={review.selected}
        onToggle={(id, on) => review.select([id], on)}
        onToggleAll={(on) => review.select(review.pageIds, on)}
        onOpen={review.openReview}
      />

      {review.totalPages > 1 && (
        <Pagination
          page={review.page}
          totalPages={review.totalPages}
          isDisabled={review.reviews.isPlaceholderData}
          onChange={review.changePage}
        />
      )}

      <ReviewDetailDialog
        review={review.detail}
        isDeleting={review.isDeleting}
        onClose={review.closeReview}
        onDelete={review.requestDeleteDetail}
      />

      <DeleteConfirmDialog
        count={review.deleteIds.length}
        isOpen={review.isConfirmOpen}
        isDeleting={review.isDeleting}
        onCancel={review.cancelDelete}
        onConfirm={review.confirmDelete}
      />
    </section>
  );
}
