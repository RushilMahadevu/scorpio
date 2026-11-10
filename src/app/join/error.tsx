"use client";

import { Button } from "@/components/ui/button";
import { InviteCard } from "./invite-card";

export default function InviteError({ reset }: { reset: () => void }) {
  return (
    <InviteCard title="Couldn’t load this invite" description="Try opening the invitation again.">
      <Button onClick={reset}>Try again</Button>
    </InviteCard>
  );
}
