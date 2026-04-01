import type { LoaderFunctionArgs } from "react-router";

export async function loader(_args: LoaderFunctionArgs) {
  return new Response(null, {
    status: 302,
    headers: { Location: "/app" },
  });
}

export default function Index() {
  return null;
}

