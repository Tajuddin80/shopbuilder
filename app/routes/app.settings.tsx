import type { LoaderFunctionArgs } from "react-router";
import { createElement as h } from "react";
import { useLoaderData } from "react-router";
import { authenticate } from "~/lib/shopify.server";
import { db } from "~/lib/db.server";
import { ensureShopRecord } from "~/lib/shop.server";
import { nativeThemeSyncEnabled } from "~/lib/themeSectionLibrary.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const shop = await ensureShopRecord(session);

  const [savedSectionsCount, pagesCount, globalStyles] = await Promise.all([
    db.template.count({
      where: {
        shopId: shop.id,
        description: { startsWith: "SECTION_TEMPLATE::" },
      },
    }),
    db.page.count({ where: { shopId: shop.id } }),
    db.globalStyles.findUnique({ where: { shopId: shop.id } }),
  ]);

  return {
    shopDomain: shop.shopDomain,
    installedAt: shop.installedAt.toISOString(),
    savedSectionsCount,
    pagesCount,
    nativeThemeSyncEnabled,
    globalStyles,
  };
}

export default function Settings() {
  const {
    shopDomain,
    installedAt,
    savedSectionsCount,
    pagesCount,
    nativeThemeSyncEnabled,
    globalStyles,
  } = useLoaderData<typeof loader>();

  return h(
    "s-page",
    { heading: "Settings" },
    h(
      "div",
      {
        style: {
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        },
      },
      h(
        "div",
        null,
        h(
          "s-section",
          { heading: "Store connection", padding: "base" },
          h(
            "div",
            {
              style: {
                border: "1px solid #dbe2ea",
                borderRadius: 16,
                padding: 16,
                background: "#ffffff",
              },
            },
            h("s-badge", { tone: "success" }, "Installed"),
            h("div", { style: { height: 12 } }),
            h("s-text", null, shopDomain),
            h("div", { style: { height: 8 } }),
            h(
              "s-text",
              { color: "subdued" },
              `Installed on ${new Date(installedAt).toLocaleDateString("en-US")}`,
            ),
          ),
        ),
      ),
      h(
        "div",
        null,
        h(
          "s-section",
          { heading: "Theme delivery", padding: "base" },
          h(
            "div",
            {
              style: {
                border: "1px solid #dbe2ea",
                borderRadius: 16,
                padding: 16,
                background: "#ffffff",
              },
            },
            h(
              "s-badge",
              { tone: nativeThemeSyncEnabled ? "success" : "info" },
              nativeThemeSyncEnabled ? "Theme file sync enabled" : "App-section mode",
            ),
            h("div", { style: { height: 12 } }),
            h(
              "s-text",
              null,
              nativeThemeSyncEnabled
                ? "Local theme section files can sync into the active theme on this store."
                : "Saved ShopBuilder sections are delivered through Theme Editor under Apps and selected by name.",
            ),
          ),
        ),
      ),
    ),
    h(
      "div",
      {
        style: {
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        },
      },
      h(
        "div",
        null,
        h(
          "s-section",
          { heading: "Builder library", padding: "base" },
          h(
            "div",
            {
              style: {
                border: "1px solid #dbe2ea",
                borderRadius: 16,
                padding: 16,
                background: "#f8fafc",
              },
            },
            h("s-text", null, `Saved sections: ${savedSectionsCount}`),
            h("div", { style: { height: 8 } }),
            h("s-text", null, `Builder drafts: ${pagesCount}`),
          ),
        ),
      ),
      h(
        "div",
        null,
        h(
          "s-section",
          { heading: "Brand defaults", padding: "base" },
          h(
            "div",
            {
              style: {
                border: "1px solid #dbe2ea",
                borderRadius: 16,
                padding: 16,
                background: "#f8fafc",
              },
            },
            h(
              "s-text",
              null,
              `Primary color: ${globalStyles?.primaryColor || "#000000"}`,
            ),
            h("div", { style: { height: 8 } }),
            h(
              "s-text",
              null,
              `Container width: ${globalStyles?.containerWidth || 1200}px`,
            ),
            h("div", { style: { height: 8 } }),
            h(
              "s-text",
              { color: "subdued" },
              "These defaults can be expanded into editable app-level settings next.",
            ),
          ),
        ),
      ),
    ),
    h(
      "s-section",
      { heading: "Quick links", padding: "base" },
      h(
        "s-button-group",
        null,
        h("s-button", { href: "/app", variant: "secondary" }, "Open Dashboard"),
        h("s-button", { href: "/app/templates", variant: "secondary" }, "Open Templates"),
      ),
    ),
  );
}
