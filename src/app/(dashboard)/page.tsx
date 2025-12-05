import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { allowedRoutesFor } from "@/utils/access";
import { getRolesFromToken } from "@/utils/auth";

export default async function Page() {
  const token = (await cookies()).get("token")?.value;
  const roles = await getRolesFromToken(token);
  const firstRoute = allowedRoutesFor(roles)[0];

  redirect(firstRoute ?? "/login");
}
