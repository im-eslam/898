import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/shared/api/data";
import { fetchMenu } from "../api/menu";
import { MENU_STALE_TIME_MS } from "../data";

export const MENU_QUERY_KEY = ["menu"] as const;

export function useMenuQuery() {
  const query = useQuery({
    queryKey: MENU_QUERY_KEY,
    queryFn: fetchMenu,
    staleTime: MENU_STALE_TIME_MS,
    retry: 1,
  });

  const isNetworkError =
    query.error instanceof ApiError &&
    (query.error.code === "NETWORK" || query.error.code === "TIMEOUT");

  return {
    menu: query.data,
    isError: query.isError,
    isNetworkError,
    retry: () => void query.refetch(),
  };
}
