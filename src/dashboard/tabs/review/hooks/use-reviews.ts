import { useEffect } from "react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { sessionKey } from "../../../hooks/use-session";
import { listReviews, type ReviewListParams } from "../api/reviews";

export const reviewsKey = ["admin", "reviews"] as const;

export function useReviews(params: ReviewListParams) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...reviewsKey, params],
    queryFn: () => listReviews(params),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (
      query.error instanceof ApiError &&
      query.error.code === "UNAUTHORIZED"
    ) {
      void queryClient.invalidateQueries({ queryKey: sessionKey });
    }
  }, [query.error, queryClient]);

  return query;
}
