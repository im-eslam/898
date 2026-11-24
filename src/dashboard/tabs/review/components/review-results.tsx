import { Button } from "react-aria-components";
import type { ReviewDto } from "@api/contracts";
import { useStrings } from "@/shared/i18n";
import { CONTROL_STYLES } from "../control-styles";
import { getErrorMessage } from "../lib/get-error-message";
import type { useReviews } from "../hooks/use-reviews";
import { strings } from "../strings";
import { useIsDesktop } from "../hooks/use-is-desktop";
import { ReviewCardList } from "./review-card-list";
import { ReviewTable } from "./review-table";

const STYLES = {
  state:
    "flex flex-col items-center gap-4 rounded-lg border border-dashed border-sand bg-white px-4 py-12 text-center text-body text-charcoal/85",
  stateDetail: "text-small",
  busy: "transition-opacity ease-smooth opacity-60",
} as const;

type ReviewsQuery = ReturnType<typeof useReviews>;

interface ReviewResultsProps {
  reviews: ReviewsQuery;
  hasQuery: boolean;
  selected: ReadonlySet<number>;
  onToggle: (id: number, on: boolean) => void;
  onToggleAll: (on: boolean) => void;
  onOpen: (review: ReviewDto) => void;
}

export function ReviewResults({ reviews, hasQuery, selected, onToggle, onToggleAll, onOpen }: ReviewResultsProps) {
  const s = useStrings(strings);
  const isDesktop = useIsDesktop();

  const data = reviews.data;
  const items = data?.items ?? [];

  if (reviews.isPending) {
    return (
      <p role="status" className={STYLES.state}>
        {s.loading}
      </p>
    );
  }

  if (reviews.isError && !data) {
    return (
      <div className={STYLES.state}>
        <p>{s.loadFailed}</p>
        <p className={STYLES.stateDetail}>{getErrorMessage(s.errors, reviews.error)}</p>
        <Button onPress={() => void reviews.refetch()} className={CONTROL_STYLES.button}>
          {s.retry}
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return <p className={STYLES.state}>{hasQuery ? s.noResults : s.empty}</p>;
  }

  return (
    <div aria-busy={reviews.isFetching} className={reviews.isPlaceholderData ? STYLES.busy : undefined}>
      {isDesktop ? (
        <ReviewTable items={items} selected={selected} onToggle={onToggle} onToggleAll={onToggleAll} onOpen={onOpen} />
      ) : (
        <ReviewCardList items={items} selected={selected} onToggle={onToggle} onOpen={onOpen} />
      )}
    </div>
  );
}
