import type { Metadata } from "next";
import { InviteActions } from "../../invite-actions";
import { InviteCard } from "../../invite-card";

export const metadata: Metadata = { referrer: "no-referrer", robots: { index: false, follow: false } };

export default async function NetworkInvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return (
    <InviteCard title="Join a Scorpio Network" description="Accept your colleague’s invitation to share teaching resources and collaborate.">
      <InviteActions key={code} kind="network" code={code} />
    </InviteCard>
  );
}
