import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { db } from "./db.server";

const PLACEHOLDER_APP_URLS = new Set(["https://example.com", "http://example.com"]);

function normalizeAppUrl(value?: string | null) {
  const normalized = value?.trim().replace(/\/$/, "");
  return normalized || undefined;
}

function readDevBundleAppUrl() {
  const manifestPath = path.join(process.cwd(), ".shopify", "dev-bundle", "manifest.json");

  if (!existsSync(manifestPath)) {
    return undefined;
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
      modules?: Array<{ type?: string; config?: { app_url?: string } }>;
    };

    const appHomeModule = manifest.modules?.find((module) => module.type === "app_home");
    return normalizeAppUrl(appHomeModule?.config?.app_url);
  } catch (error) {
    console.warn("Failed to read Shopify dev bundle manifest", error);
    return undefined;
  }
}

function resolveAppUrl() {
  const configuredAppUrl = normalizeAppUrl(process.env.SHOPIFY_APP_URL);
  const hostAppUrl = normalizeAppUrl(process.env.HOST);

  if (hostAppUrl && (!configuredAppUrl || PLACEHOLDER_APP_URLS.has(configuredAppUrl))) {
    return hostAppUrl;
  }

  if (configuredAppUrl && !PLACEHOLDER_APP_URLS.has(configuredAppUrl)) {
    return configuredAppUrl;
  }

  return readDevBundleAppUrl() || "";
}

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: resolveAppUrl(),
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(db) as any,
  distribution: AppDistribution.AppStore,
  future: {
    expiringOfflineAccessTokens: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.October25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;

