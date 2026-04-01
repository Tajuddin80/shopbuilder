import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "~/lib/shopify.server";
import { db } from "~/lib/db.server";

export async function action({ request }: ActionFunctionArgs) {
  const { topic, shop } = await authenticate.webhook(request);

  switch (topic) {
    case "APP_UNINSTALLED": {
      await db.shop.updateMany({
        where: { shopDomain: shop },
        data: { plan: "FREE", billingId: null },
      });
      break;
    }
    case "THEMES_PUBLISH": {
      console.log(`Theme published for shop ${shop}`);
      break;
    }
  }

  return new Response();
}

