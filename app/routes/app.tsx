import type { LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData, useNavigate, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider as ShopifyAppProvider } from "@shopify/shopify-app-react-router/react";
import { NavMenu } from "@shopify/app-bridge-react";
import { AppProvider as PolarisProvider, Frame } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import { useEffect } from "react";
import { authenticate } from "~/lib/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function AppShell() {
  const { apiKey } = useLoaderData() as { apiKey: string };
  const navigate = useNavigate();

  useEffect(() => {
    function handleNavigate(event: Event) {
      const target = event.target instanceof Element ? event.target : null;
      const href =
        target?.getAttribute("href") ||
        target?.closest("[href]")?.getAttribute("href");
      if (!href?.startsWith("/")) return;
      event.preventDefault();
      navigate(href);
    }

    document.addEventListener("shopify:navigate", handleNavigate);
    return () => {
      document.removeEventListener("shopify:navigate", handleNavigate);
    };
  }, [navigate]);

  return (
    <ShopifyAppProvider embedded apiKey={apiKey}>
      <NavMenu>
        <a href="/app" rel="home">
          Dashboard
        </a>
        <a href="/app/templates">Templates</a>
        <a href="/app/billing">Billing</a>
        <a href="/app/settings">Settings</a>
      </NavMenu>

      <PolarisProvider i18n={enTranslations}>
        <Frame>
          <Outlet />
        </Frame>
      </PolarisProvider>
    </ShopifyAppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs: any) => boundary.headers(headersArgs);

