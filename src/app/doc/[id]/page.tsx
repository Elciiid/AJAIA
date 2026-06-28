import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { DocumentEditor } from "@/components/editor/document-editor";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const { id } = await params;
  return <DocumentEditor id={id} user={user} />;
}
