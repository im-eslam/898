import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AdminMenuState } from "@api/contracts";
import { ApiError } from "@/shared/api";
import { sessionKey } from "../../../hooks/use-session";
import { getAdminMenu } from "../api/menu";

export const adminMenuKey = ["admin", "menu"] as const;

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

export function useAdminMenuMutation<TVars, TResult = unknown>(
  mutationFn: (vars: TVars) => Promise<TResult>
) {
  const queryClient = useQueryClient();

  return useMutation<TResult, ApiError, TVars>({
    mutationFn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminMenuKey });
    },
    onError: (error) => {
      if (error.code === "UNAUTHORIZED") {
        void queryClient.invalidateQueries({ queryKey: sessionKey });
      }
    },
  });
}
