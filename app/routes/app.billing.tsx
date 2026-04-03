import type { LoaderFunctionArgs } from "react-router";
import { createElement as h } from "react";
import { useLoaderData } from "react-router";
import { authenticate } from "~/lib/shopify.server";
import { db } from "~/lib/db.server";
import { getActiveSubscription } from "~/lib/billingApi.server";
import { ensureShopRecord } from "~/lib/shop.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session, admin } = await authenticate.admin(request);
  const shop = await ensureShopRecord(session);
  let activeSubscription: Awaited<ReturnType<typeof getActiveSubscription>> =
    null;

  try {
    activeSubscription = await getActiveSubscription(admin);
  } catch (error) {
    console.error("Failed to load active subscription", error);
  }

  const [pagesCount, savedSectionsCount] = await Promise.all([
    db.page.count({ where: { shopId: shop.id } }),
    db.template.count({
      where: {
        shopId: shop.id,
        description: { startsWith: "SECTION_TEMPLATE::" },
      },
    }),
  ]);

  return {
    shopDomain: shop.shopDomain,
    plan: shop.plan,
    activeSubscription,
    pagesCount,
    savedSectionsCount,
  };
}

export default function Billing() {
  const { shopDomain, plan, activeSubscription, pagesCount, savedSectionsCount } =
    useLoaderData<typeof loader>();

  return h(
    "s-page",
    { heading: "Billing" },
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
        { style: { gridColumn: "1 / -1" } },
        h(
          "s-section",
          { heading: "Subscription status", padding: "base" },
          h(
            "s-banner",
            {
              heading:
                plan === "FREE"
                  ? "You are currently on the free plan"
                  : `Current plan: ${plan}`,
              tone: plan === "FREE" ? "info" : "success",
            },
            h(
              "div",
              { style: { display: "grid", gap: 8 } },
              h(
                "s-text",
                null,
                activeSubscription?.name
                  ? `${activeSubscription.name} is active for ${shopDomain}.`
                  : "Billing is not connected to an active paid subscription yet.",
              ),
              h(
                "s-text",
                { color: "subdued" },
                `Builder drafts: ${pagesCount} | Saved sections: ${savedSectionsCount}`,
              ),
            ),
          ),
        ),
      ),
      h(
        "div",
        null,
        h(
          "s-section",
          { heading: "Pro plan", padding: "base" },
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
            h("s-badge", { tone: "info" }, "$19.99 / month"),
            h("div", { style: { height: 12 } }),
            h(
              "s-text",
              null,
              "Best for most stores building reusable sections and landing pages.",
            ),
            h("div", { style: { height: 12 } }),
            h(
              "s-text",
              { color: "subdued" },
              "Includes reusable sections, template library flow, and Shopify embedded editing.",
            ),
          ),
        ),
      ),
      h(
        "div",
        null,
        h(
          "s-section",
          { heading: "Agency plan", padding: "base" },
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
            h("s-badge", { tone: "success" }, "$79.99 / month"),
            h("div", { style: { height: 12 } }),
            h(
              "s-text",
              null,
              "Built for teams managing larger section libraries and multiple merchant workflows.",
            ),
            h("div", { style: { height: 12 } }),
            h(
              "s-text",
              { color: "subdued" },
              "Use this when you need a more premium support and rollout path.",
            ),
          ),
        ),
      ),
    ),
    h(
      "s-section",
      { heading: "Next steps", padding: "base" },
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
          "div",
          { style: { display: "grid", gap: 12 } },
          h("s-text", null, "Use the Templates page to manage saved sections and add them in Theme Editor by name."),
          h(
            "s-button-group",
            null,
            h("s-button", { href: "/app/templates", variant: "secondary" }, "Open Templates"),
            h("s-button", { href: "/app/settings", variant: "secondary" }, "Open Settings"),
          ),
        ),
      ),
    ),
  );
}
