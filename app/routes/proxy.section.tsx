import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { authenticate } from "~/lib/shopify.server";
import {
  bindSavedSectionAppBlockInstance,
  getLocalThemeSectionRenderPayload,
  getSavedSectionPickerMarkup,
  getSavedSectionRenderPayload,
  listSavedSectionsForShopDomain,
  nativeThemeSyncEnabled,
} from "~/lib/themeSectionLibrary.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session, liquid } = await authenticate.public.appProxy(request);
  const url = new URL(request.url);

  const shopDomain = session?.shop || url.searchParams.get("shop");
  const handle = url.searchParams.get("handle");
  const instanceId = url.searchParams.get("instance");
  const wantsPicker = url.searchParams.get("picker") === "1";

  if (!shopDomain || !shopDomain.includes(".myshopify.com")) {
    if (wantsPicker) {
      return new Response(JSON.stringify({ sections: [] }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return liquid("", { layout: false });
  }

  if (wantsPicker) {
    const sections = await listSavedSectionsForShopDomain(shopDomain);
    return new Response(
      JSON.stringify({
        sections: sections.map((section) => ({
          id: section.id,
          name: section.name,
          handle: section.handle,
        })),
        html: getSavedSectionPickerMarkup({
          sections: sections.map((section) => ({
            id: section.id,
            name: section.name,
            handle: section.handle,
          })),
        }),
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  let payload = await getSavedSectionRenderPayload({
    shopDomain,
    handle,
    instanceId,
  });

  if (!payload && handle && nativeThemeSyncEnabled) {
    payload = await getLocalThemeSectionRenderPayload(handle);
  }

  if (!payload) {
    return liquid("", { layout: false });
  }

  return liquid(payload.liquid, { layout: false });
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.public.appProxy(request);
  const url = new URL(request.url);
  const shopDomain = session?.shop || url.searchParams.get("shop");

  if (!shopDomain || !shopDomain.includes(".myshopify.com")) {
    return new Response(JSON.stringify({ error: "Invalid shop context." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const formData = await request.formData();
  const templateId = String(formData.get("templateId") || "").trim();
  const instanceId = String(formData.get("instance") || "").trim();

  if (!templateId || !instanceId) {
    return new Response(
      JSON.stringify({ error: "Missing section or block instance." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    const result = await bindSavedSectionAppBlockInstance({
      shopDomain,
      templateId,
      instanceId,
    });

    return new Response(JSON.stringify({ ok: true, section: result }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error?.message || "Could not bind the saved section to this block.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
