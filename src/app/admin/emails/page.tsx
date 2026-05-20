import { createClient } from "@/lib/supabase/server";
import EmailsClient from "./EmailsClient";

export default async function EmailsPage() {
  const supabase = await createClient();

  const { data: emails } = await supabase
    .from("employee_emails")
    .select("email")
    .order("email");

  return <EmailsClient emails={(emails ?? []).map(e => e.email)} />;
}
