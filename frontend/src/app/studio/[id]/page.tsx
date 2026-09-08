import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudioShell } from "@/components/studio/studio-shell";
import { seedProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Design workspace — Sketchora",
};

export default async function StudioProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = seedProjects.find((p) => p.id === id);
  if (!project) notFound();
  return <StudioShell project={project} />;
}