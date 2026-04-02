import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "~/lib/shopify.server";
import { getSavedSectionRenderPayload } from "~/lib/themeSectionLibrary.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session, liquid } = await authenticate.public.appProxy(request);
  const url = new URL(request.url);

  const shopDomain = session?.shop || url.searchParams.get("shop");
  const handle = url.searchParams.get("handle");
  const instanceId = url.searchParams.get("instance");

  if (!shopDomain || !shopDomain.includes(".myshopify.com")) {
    return liquid("", { layout: false });
  }

  const payload = await getSavedSectionRenderPayload({
    shopDomain,
    handle,
    instanceId,
  });

  if (!payload) {
    return liquid("", { layout: false });
  }

  return liquid(payload.liquid, { layout: false });
}
