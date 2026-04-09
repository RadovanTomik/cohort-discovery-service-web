"use server";

import { getUserQueryTag, TAG_QUERIES } from "@/config/tags";
import { apiGet, CachedGetArgs } from "@/lib/apiClient";
import { API_ROUTES } from "@/lib/apiRoutes";
import { Query, ApiResponse, Paginated, WithIncomplete } from "@/types/api";
import { getUserAuthTagId } from "@/lib/auth";

const getQueries = async (
  args?: Omit<CachedGetArgs, "url">,
): Promise<WithIncomplete<ApiResponse<Paginated<Query>>>> => {
  const userId = await getUserAuthTagId();

  const { data, message } = await apiGet<ApiResponse<Paginated<Query>>>({
    url: API_ROUTES.queries,
    tags: [TAG_QUERIES, getUserQueryTag(userId)],
    ...args,
  });

  const incompleteQueries = data.data.filter((q) =>
    q.tasks.some((t) => !t.completed_at),
  );

  return {
    data,
    message,
    hasIncomplete: incompleteQueries.length > 0,
  };
};

export default getQueries;
