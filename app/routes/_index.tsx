import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "~/lib/shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { redirect } = await authenticate.admin(request);
  return redirect("/app");
}

export default function Index() {
  return null;
}

