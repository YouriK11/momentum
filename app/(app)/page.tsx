import { redirect } from "next/navigation";

// Dashboard moved to /home — redirect for any stale links
export default function AppRootRedirect() {
  redirect("/home");
}
