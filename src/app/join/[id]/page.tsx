import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InviteCard } from "../invite-card";

export default function LegacyNetworkInvitePage() {
  return (
    <InviteCard title="This Network link has changed" description="Ask the Network owner to open their Network page and create a fresh colleague invite.">
      <Button asChild variant="outline"><Link href="/teacher/network">Go to Network</Link></Button>
    </InviteCard>
  );
}
