import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/shared/api/";
import { fetchMenu } from "../api/menu";
import { MENU_STALE_TIME_MS } from "../data";

export const MENU_QUERY_KEY = ["menu"] as const;

export function useData() {
  const query = useQuery({
    queryKey: MENU_QUERY_KEY,
    queryFn: fetchMenu,
    staleTime: MENU_STALE_TIME_MS,
    retry: 1,
  });

  return {
    menu: query.data,
    isError: query.isError,
    errorCode: query.error instanceof ApiError ? query.error.code : undefined,
    retry: () => void query.refetch(),
  };
}
