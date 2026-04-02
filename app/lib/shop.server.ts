import { db } from "./db.server";

export async function ensureShopRecord(session: {
  shop: string;
  accessToken?: string | null;
}) {
  const accessToken = String(session.accessToken || "").trim();

  return db.shop.upsert({
    where: { shopDomain: session.shop },
    update: {
      ...(accessToken ? { accessToken } : {}),
      installedAt: new Date(),
    },
    create: {
      shopDomain: session.shop,
      accessToken,
      plan: "FREE",
    },
  });
}
