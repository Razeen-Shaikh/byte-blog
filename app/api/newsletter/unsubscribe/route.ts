import { ApiError, jsonError, jsonOk } from "@/lib/api";
import { unsubscribeNewsletter } from "@/lib/services/newsletter";
import { newsletterUnsubscribeSchema } from "@/lib/validations/taxonomy";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = newsletterUnsubscribeSchema.parse(body);
    if (!data.email && !data.token) {
      throw new ApiError("Email or unsubscribe token is required", 400);
    }

    const subscriber = await unsubscribeNewsletter({
      email: data.email,
      token: data.token,
    });
    if (!subscriber) throw new ApiError("Subscriber not found", 404);

    return jsonOk({ subscriber });
  } catch (error) {
    return jsonError(error);
  }
}