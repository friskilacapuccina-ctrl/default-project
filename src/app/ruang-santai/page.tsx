import { AppShell } from "@/components/layout/AppShell";
import { EcosystemQuest } from "@/components/lounge/EcosystemQuest";

export default function RuangSantaiPage() {
  return (
    <AppShell allow={["STUDENT"]} wide>
      <EcosystemQuest />
    </AppShell>
  );
}
