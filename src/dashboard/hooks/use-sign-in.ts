import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { LoginResponse } from "@api/contracts";
import type { ApiError } from "@/shared/api/";
import { requestSignIn, type SignInPayload } from "../api/auth";
import { sessionKey } from "./use-session";

export function useSignIn() {
  const queryClient = useQueryClient();

  const mutation = useMutation<LoginResponse, ApiError, SignInPayload>({
    mutationFn: requestSignIn,
    onSuccess: ({ user }) => {
      queryClient.setQueryData(sessionKey, user);
    },
  });

  return {
    signIn: (username: string, password: string) => {
      if (mutation.isPending) return;
      mutation.mutate({ username: username.trim(), password });
    },
    isPending: mutation.isPending,
    errorCode: mutation.error?.code ?? null,
    clearError: () => {
      if (mutation.error) mutation.reset();
    },
  };
}
