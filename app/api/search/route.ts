import { jsonError, jsonOk } from "@/lib/api";
import { globalSearch } from "@/lib/services/search";
import { searchQuerySchema } from "@/lib/validations/search";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchQuerySchema.parse(Object.fromEntries(searchParams));
    const results = await globalSearch(query.q, query.limit);
    return jsonOk({ query: query.q, results });
  } catch (error) {
    return jsonError(error);
  }
}