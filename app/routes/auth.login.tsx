import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, useActionData, useLoaderData } from "react-router";
import { AppProvider as ShopifyAppProvider } from "@shopify/shopify-app-react-router/react";
import { login } from "~/lib/shopify.server";

function loginErrorMessage(error: unknown) {
  if (!error) return { shop: undefined as string | undefined };
  return { shop: typeof error === "object" ? (error as any)?.shop : String(error) };
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));
  return { errors };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));
  return { errors };
};

export default function AuthLogin() {
  const loaderData = useLoaderData() as any;
  const actionData = useActionData() as any;
  const errors = actionData?.errors ?? loaderData?.errors ?? {};

  return (
    <ShopifyAppProvider embedded={false}>
      <s-page>
        <Form method="get" reloadDocument target="_top">
          <s-section heading="Log in">
            <s-text-field
              name="shop"
              label="Shop domain"
              details="example.myshopify.com"
              autocomplete="on"
              error={errors.shop}
            ></s-text-field>
            <s-button type="submit">Log in</s-button>
          </s-section>
        </Form>
      </s-page>
    </ShopifyAppProvider>
  );
}

