import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { login } from "~/lib/shopify.server";

function loginErrorMessage(error: unknown) {
  if (!error) return undefined;

  const code = typeof error === "object" ? (error as { shop?: string })?.shop : String(error);

  if (code === "MISSING_SHOP") {
    return "Enter your shop domain to continue.";
  }

  if (code === "INVALID_SHOP") {
    return "Enter a valid shop domain like store-name.myshopify.com.";
  }

  return code || "Unable to start login.";
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const submittedShop = url.searchParams.get("shop") ?? "";
  const error = loginErrorMessage(await login(request));
  return { error, submittedShop };
};

export default function AuthLogin() {
  const { error, submittedShop } = useLoaderData() as {
    error?: string;
    submittedShop: string;
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background:
          "radial-gradient(circle at top, rgba(0, 128, 96, 0.08), transparent 35%), #f6f6f7",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "32px",
          background: "#ffffff",
          borderRadius: "18px",
          boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)",
          border: "1px solid rgba(15, 23, 42, 0.08)",
        }}
      >
        <h1 style={{ margin: "0 0 8px", fontSize: "28px", lineHeight: 1.2 }}>Log in</h1>
        <p style={{ margin: "0 0 24px", color: "#5c5f62", fontSize: "14px" }}>
          Enter your Shopify store domain to start the install flow.
        </p>

        <form method="get" target="_top">
          <label
            htmlFor="shop"
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#202223",
            }}
          >
            Shop domain
          </label>
          <input
            id="shop"
            name="shop"
            type="text"
            autoComplete="on"
            placeholder="example.myshopify.com"
            defaultValue={submittedShop}
            style={{
              width: "100%",
              padding: "12px 14px",
              fontSize: "15px",
              borderRadius: "12px",
              border: error ? "1px solid #d82c0d" : "1px solid #8c9196",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <p style={{ margin: "8px 0 0", fontSize: "13px", color: error ? "#d82c0d" : "#6d7175" }}>
            {error || "Use your store URL, for example `mystore.myshopify.com`."}
          </p>
          <button
            type="submit"
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "12px 16px",
              border: "none",
              borderRadius: "12px",
              background: "#008060",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Log in
          </button>
        </form>
      </section>
    </main>
  );
}

