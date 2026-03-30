import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Link,
  Tailwind,
  Heading
} from '@react-email/components';

interface AssignmentCreatedEmailProps {
  studentName: string;
  assignmentName: string;
  courseName?: string;
  dueDate?: string;
  link: string;
}

export const AssignmentCreatedEmail = ({
  studentName = "Student",
  assignmentName = "Assignment",
  courseName = "Physics 101",
  dueDate = "Next Friday at 11:59 PM",
  link = "https://scorpioedu.org/dashboard"
}: AssignmentCreatedEmailProps) => {
  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>New Assignment: {assignmentName}</Preview>
        <Body className="bg-zinc-50 font-sans text-zinc-900 m-0 py-8">
          <Container className="mx-auto max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm my-10">
            <Section className="mb-6">
              <Heading className="m-0 text-xl font-bold tracking-tight text-zinc-900">
                SCORPIO
              </Heading>
              <Text className="m-0 mt-1 text-sm font-medium text-zinc-500">
                Research-Grade Educational Platform
              </Text>
            </Section>

            <Section>
              <Text className="mt-0 mb-4 text-base font-medium">Hi {studentName},</Text>
              <Text className="mb-6 text-base leading-relaxed text-zinc-600">
                A new assignment <strong className="font-semibold text-zinc-900">{assignmentName}</strong> has been posted
                {courseName ? ` in ${courseName}` : ''}.
              </Text>

              {dueDate && (
                <Section className="my-6 rounded-xl bg-indigo-50 p-4 border border-indigo-100 flex items-center">
                  <Text className="m-0 text-sm font-medium text-indigo-900">
                    🕒 Due Date: <strong>{dueDate}</strong>
                  </Text>
                </Section>
              )}

              <Section className="mt-8 mb-4 text-center">
                <Link
                  href={link}
                  className="inline-block rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white no-underline shadow-sm hover:bg-zinc-800 transition-all"
                >
                  View Assignment Details
                </Link>
              </Section>
            </Section>

            <Hr className="my-8 border-zinc-200" />
            
            <Section>
              <Text className="text-xs leading-relaxed text-zinc-400">
                This is an automated message from Scorpio. 
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default AssignmentCreatedEmail;
