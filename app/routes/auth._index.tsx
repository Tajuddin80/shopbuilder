import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const nextUrl = new URL("/auth/login", url.origin);

  url.searchParams.forEach((value, key) => {
    nextUrl.searchParams.set(key, value);
  });

  throw redirect(`${nextUrl.pathname}${nextUrl.search}`);
}

export default function AuthIndex() {
  return null;
}
