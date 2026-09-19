import { notFound } from "next/navigation";
import { getLiteraturePaper } from "@/lib/literature";
import { LiteratureReader } from "@/components/literature-reader";

export default async function LiteraturePaperPage({
  params,
}: {
  params: Promise<{ paperId: string }>;
}) {
  const { paperId } = await params;
  const paper = getLiteraturePaper(paperId);

  if (!paper) notFound();

  return <LiteratureReader paper={paper} />;
}
