import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Ok } from "@api/contracts";
import type { ApiError } from "@/shared/api/";
import { requestSignOut } from "../api/auth";
import { sessionKey } from "./use-session";

export function useSignOut() {
  const queryClient = useQueryClient();

  const mutation = useMutation<Ok, ApiError>({
    mutationFn: requestSignOut,
    onSettled: (_data, error) => {
      if (!error || error.code === "UNAUTHORIZED") {
        queryClient.setQueryData(sessionKey, null);
      }
    },
  });

  return {
    signOut: () => mutation.mutate(),
    isPending: mutation.isPending,
  };
}
