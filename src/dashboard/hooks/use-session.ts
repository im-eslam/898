import { useQuery } from "@tanstack/react-query";
import type { AdminDto } from "@api/contracts";
import { ApiError } from "@/shared/api/";
import { requestSession } from "../api/auth";

export const sessionKey = ["admin", "session"] as const;

const SESSION_FRESH_MS = 60_000;

export function useSession() {
  const query = useQuery<AdminDto | null, ApiError>({
    queryKey: sessionKey,
    queryFn: async () => {
      try {
        const { user } = await requestSession();
        return user;
      } catch (error) {
        if (error instanceof ApiError && error.code === "UNAUTHORIZED") {
          return null;
        }
        throw error;
      }
    },
    staleTime: SESSION_FRESH_MS,
    retry: false,
  });

  return {
    admin: query.data ?? null,
    isPending: query.isPending,
    isError: query.isError,
    errorCode: query.error?.code,
    retry: () => void query.refetch(),
  };
}
