import { redirect } from "next/navigation";

export default function LiteratureIndexPage() {
  redirect(`/literature/${"compactness-in-finite-graphs"}`);
}
