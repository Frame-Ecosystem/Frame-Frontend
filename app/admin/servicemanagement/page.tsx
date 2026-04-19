import { redirect } from "next/navigation"

export default function ServiceManagementRedirect() {
  redirect("/admin/services")
}
