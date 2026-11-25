import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { MenuDeleted } from "@api/contracts";
import { ApiError } from "@/shared/api";
import { sessionKey } from "../../../hooks/use-session";
import { adminMenuKey, useAdminMenuMutation } from "./use-admin-menu";

interface DeleteFlowOptions<U> {
  getUsage: (id: number) => Promise<{ ok: true; usage: U }>;
  deleteItem: (id: number) => Promise<MenuDeleted>;
}

export function useDeleteFlow<U>({ getUsage, deleteItem }: DeleteFlowOptions<U>) {
  const queryClient = useQueryClient();
  const [target, setTarget] = useState<{ id: number; usage: U } | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);
  const [usageError, setUsageError] = useState<ApiError | null>(null);

  const mutation = useAdminMenuMutation(deleteItem);

  const request = async (id: number) => {
    setUsageError(null);
    setIsLoadingUsage(true);
    try {
      const { usage } = await getUsage(id);
      setTarget({ id, usage });
    } catch (error) {
      if (error instanceof ApiError && error.code === "UNAUTHORIZED") {
        void queryClient.invalidateQueries({ queryKey: sessionKey });
      }
      setUsageError(
        error instanceof ApiError
          ? error
          : new ApiError(0, "UNKNOWN", "Unknown error")
      );
    } finally {
      setIsLoadingUsage(false);
    }
  };

  const confirm = () => {
    if (!target) return;
    mutation.mutate(target.id, { onSuccess: () => setTarget(null) });
  };

  return {
    target,
    isLoadingUsage,
    usageError,
    isDeleting: mutation.isPending,
    deleteError: mutation.error,
    request,
    cancel: () => {
      setTarget(null);
      mutation.reset();
    },
    confirm,
  };
}

export { adminMenuKey };
