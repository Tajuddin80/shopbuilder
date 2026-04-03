type AppBridgeClient = {
  idToken?: () => Promise<string>;
};

export async function appBridgeFetch(
  shopify: AppBridgeClient | null | undefined,
  input: RequestInfo | URL,
  init: RequestInit = {},
) {
  const headers = new Headers(init.headers ?? undefined);

  try {
    const token =
      typeof shopify?.idToken === "function" ? await shopify.idToken() : "";

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  } catch (_error) {
    // Fall back to the browser request if App Bridge cannot provide a token.
  }

  headers.set("X-Requested-With", "XMLHttpRequest");

  return fetch(input, {
    ...init,
    headers,
  });
}
