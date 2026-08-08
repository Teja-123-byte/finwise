import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/components/fintrail/login-page";

const title = "Login — Fintrail";
const description = "Sign in to your student money dashboard and pick up where you left off.";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: LoginPage,
});
