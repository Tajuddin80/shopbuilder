import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useNavigate } from "react-router";
import { authenticate } from "~/lib/shopify.server";
import { db } from "~/lib/db.server";
import { ensureShopRecord } from "~/lib/shop.server";
import { Layout, Page } from "@shopify/polaris";
import { EmptyState } from "~/components/dashboard/EmptyState";
import { PageCard } from "~/components/dashboard/PageCard";
import { PlanBanner } from "~/components/dashboard/PlanBanner";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  await ensureShopRecord(session);

  const shop = await db.shop.findUnique({
    where: { shopDomain: session.shop },
    include: { pages: { orderBy: { updatedAt: "desc" } } },
  });

  return { pages: shop?.pages || [], plan: shop?.plan || "FREE" };
}

export default function Dashboard() {
  const { pages, plan } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const navigate = useNavigate();

  return (
    <Page
      title="Your Sections"
      primaryAction={{
        content: "Create new section",
        onAction: () => navigate("/app/pages/new"),
      }}
    >
      <Layout>
        <Layout.Section>
          <PlanBanner
            plan={plan}
            pagesCount={pages.length}
            onUpgrade={() => navigate("/app/billing")}
          />
        </Layout.Section>

        <Layout.Section>
          {pages.length === 0 ? (
            <EmptyState
              onCreate={() => navigate("/app/pages/new")}
              onBrowseTemplates={() => navigate("/app/templates")}
            />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 16,
              }}
            >
              {pages.map((page: any) => (
                <PageCard
                  key={page.id}
                  page={page}
                  onEdit={() => navigate(`/app/pages/${page.id}`)}
                />
              ))}
            </div>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
