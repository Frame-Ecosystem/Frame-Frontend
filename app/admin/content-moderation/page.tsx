import { redirect } from "next/navigation"

export default function ContentModerationRedirect() {
  redirect("/admin/moderation")
}
