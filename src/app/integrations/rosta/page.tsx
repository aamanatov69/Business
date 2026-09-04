import type { Metadata } from "next";
import { RostaAdminClient } from "./RostaAdminClient";

export const metadata: Metadata = {
  title: "Rosta — интеграции",
  robots: { index: false, follow: false },
};

export default function RostaIntegrationPage() {
  return (
    <main className="rosta-admin-page">
      <RostaAdminClient />
    </main>
  );
}
