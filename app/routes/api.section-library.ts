import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { authenticate } from "~/lib/shopify.server";
import { db } from "~/lib/db.server";
import { pageContentSchema } from "~/lib/pageSchema";
import {
  listLocalThemeSections,
  listSavedSections,
  saveBuilderSectionToTheme,
  syncLocalThemeSections,
} from "~/lib/themeSectionLibrary.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session, admin } = await authenticate.admin(request);
  const shop = await db.shop.findUnique({
    where: { shopDomain: session.shop },
  });

  if (!shop) {
    return new Response(
      JSON.stringify({ savedSections: [], themeSections: [] }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    await syncLocalThemeSections(admin);
  } catch (error) {
    console.error("Failed to auto-sync local theme sections", error);
  }

  const [savedSections, themeSections] = await Promise.all([
    listSavedSections(shop.id),
    listLocalThemeSections(),
  ]);

  return new Response(JSON.stringify({ savedSections, themeSections }), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { session, admin } = await authenticate.admin(request);
  const shop = await db.shop.findUnique({
    where: { shopDomain: session.shop },
  });

  if (!shop) {
    return new Response(JSON.stringify({ error: "Shop not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const intent = String(body.intent || "");

  if (intent === "sync_local_theme_sections") {
    const themeSections = await syncLocalThemeSections(admin);
    const savedSections = await listSavedSections(shop.id);
    return new Response(JSON.stringify({ savedSections, themeSections }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (intent === "save_builder_section") {
    const pageContent = {
      version: "1.0",
      globalStyles: {
        backgroundColor: "#ffffff",
        fontFamily: "sans-serif",
        maxWidth: Number(body.containerWidth || 1200),
        customCss: "",
      },
      sections: [body.section],
    };

    const parsed = pageContentSchema.safeParse(pageContent);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid section payload" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const section = parsed.data.sections[0];
    const name = String(body.name || section.name || "Saved Section");
    await saveBuilderSectionToTheme({
      admin,
      shopId: shop.id,
      section,
      name,
      containerWidth: Number(body.containerWidth || 1200),
    });

    const [savedSections, themeSections] = await Promise.all([
      listSavedSections(shop.id),
      listLocalThemeSections(),
    ]);

    return new Response(JSON.stringify({ savedSections, themeSections }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (intent === "save_page_sections") {
    const sections = Array.isArray(body.sections) ? body.sections : [];

    for (const [index, rawSection] of sections.entries()) {
      const pageContent = {
        version: "1.0",
        globalStyles: {
          backgroundColor: "#ffffff",
          fontFamily: "sans-serif",
          maxWidth: Number(body.containerWidth || 1200),
          customCss: "",
        },
        sections: [rawSection],
      };

      const parsed = pageContentSchema.safeParse(pageContent);
      if (!parsed.success) continue;

      const section = parsed.data.sections[0];
      const baseName = String(section.name || `Saved Section ${index + 1}`);
      const name = `${baseName}`.trim() || `Saved Section ${index + 1}`;

      await saveBuilderSectionToTheme({
        admin,
        shopId: shop.id,
        section,
        name:
          sections.filter((candidate: any) => candidate?.name === section.name)
            .length > 1
            ? `${name} ${index + 1}`
            : name,
        containerWidth: Number(body.containerWidth || 1200),
      });
    }

    await syncLocalThemeSections(admin);

    const [savedSections, themeSections] = await Promise.all([
      listSavedSections(shop.id),
      listLocalThemeSections(),
    ]);

    return new Response(JSON.stringify({ savedSections, themeSections }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "Unsupported intent" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}
