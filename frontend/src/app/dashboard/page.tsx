import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "Your studio — Sketchora",
  description:
    "Sketchora studio — manage your fashion designs, sketches, and generations.",
};

export default function Dashboard() {
  return <DashboardShell />;
}