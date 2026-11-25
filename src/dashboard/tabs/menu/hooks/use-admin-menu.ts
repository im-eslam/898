import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { AdminMenuState } from "@api/contracts";
import { ApiError } from "@/shared/api";
import { useStrings } from "@/shared/i18n";
import { sessionKey } from "../../../hooks/use-session";
import { getAdminMenu } from "../api/menu";
import { getErrorMessage } from "../lib/get-error-message";
import { strings } from "../strings";

export const adminMenuKey = ["admin", "menu"] as const;

export type FeedbackKey = "saved" | "deleted" | "orderSaved";

export function useAdminMenu() {
  const query = useQuery<AdminMenuState, ApiError>({
    queryKey: adminMenuKey,
    queryFn: async () => {
      const { ok: _ok, ...state } = await getAdminMenu();
      return state;
    },
    staleTime: 10_000,
    retry: false,
  });

  return {
    menu: query.data,
    isPending: query.isPending,
    isError: query.isError,
    errorCode: query.error?.code,
    retry: () => void query.refetch(),
  };
}

// Every save, delete and reorder goes through here, so every action gives
// the same feedback: a success toast, or an error toast, and a fresh menu.
export function useAdminMenuMutation<TVars, TResult = unknown>(
  mutationFn: (vars: TVars) => Promise<TResult>,
  feedback: FeedbackKey = "saved"
) {
  const s = useStrings(strings);
  const queryClient = useQueryClient();

  return useMutation<TResult, ApiError, TVars>({
    mutationFn,
    onSuccess: () => {
      toast.success(s.common[feedback], { id: feedback });
    },
    onError: (error) => {
      toast.error(getErrorMessage(s.errors, error), { duration: 5000 });
      if (error.code === "UNAUTHORIZED") {
        void queryClient.invalidateQueries({ queryKey: sessionKey });
      }
    },
    // Refetch whether it worked or not, so the screen never shows stale data.
    onSettled: () => queryClient.invalidateQueries({ queryKey: adminMenuKey }),
  });
}
