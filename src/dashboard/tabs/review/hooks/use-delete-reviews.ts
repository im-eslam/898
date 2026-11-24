import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { sessionKey } from "../../../hooks/use-session";
import { deleteReviews, type DeleteReviewsResponse } from "../api/reviews";
import { reviewsKey } from "./use-reviews";

export function useDeleteReviews() {
  const queryClient = useQueryClient();

  return useMutation<DeleteReviewsResponse, ApiError, number[]>({
    mutationFn: deleteReviews,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: reviewsKey });
    },
    onError: (error) => {
      if (error.code === "UNAUTHORIZED") {
        void queryClient.invalidateQueries({ queryKey: sessionKey });
      }
    },
  });
}
