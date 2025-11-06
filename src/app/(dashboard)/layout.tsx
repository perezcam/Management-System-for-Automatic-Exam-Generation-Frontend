import { cookies } from "next/headers";
import { allowedKeysFor, type FolderKey } from "@/utils/access";
import { getRolesFromToken } from "@/utils/auth";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import "./dashboard.css";


export default async function Layout({ children }: { children: React.ReactNode }) {
  const cookiesList = await cookies();
  const token = cookiesList.get("token")?.value;
  const roles = await getRolesFromToken(token);
  const allowedKeys: FolderKey[] = allowedKeysFor(roles);

  return <DashboardShell allowedKeys={allowedKeys}>{children}</DashboardShell>;
}
