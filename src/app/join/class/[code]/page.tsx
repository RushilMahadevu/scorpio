import Link from "next/link";
import { Button } from "@/components/ui/button";
import { findClassByCode } from "@/lib/class-enrollment";
import { InviteActions } from "../../invite-actions";
import { InviteCard } from "../../invite-card";

export const dynamic = "force-dynamic";

export default async function ClassInvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const course = await findClassByCode(code);

  if (!course) {
    return (
      <InviteCard title="Class unavailable" description="Ask your teacher for a current invite link or class code.">
        <Button asChild><Link href="/student">Go to student dashboard</Link></Button>
      </InviteCard>
    );
  }

  return (
    <InviteCard title={`Join ${course.name}`} description="Enroll in this class to access assignments and resources.">
      <InviteActions key={code} kind="class" code={code} courseId={course.courseId} />
    </InviteCard>
  );
}
