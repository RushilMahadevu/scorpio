import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Tailwind,
  Button
} from '@react-email/components';

interface AssignmentCreatedEmailProps {
  studentName: string;
  assignmentName: string;
  courseName?: string;
  link: string;
}

export const AssignmentCreatedEmail = ({
  studentName = "Student",
  assignmentName = "Assignment",
  courseName = "Physics",
  link = "https://scorpioedu.org/student/assignments"
}: AssignmentCreatedEmailProps) => {
  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>New Scorpio Assignment: {assignmentName}</Preview>
        <Body className="bg-[#09090b] font-sans text-[#fafafa] m-0 py-10">
          <Container className="mx-auto max-w-[465px] border border-solid border-[#27272a] rounded-2xl p-10 bg-[#09090b]">
            <Section className="mt-4 mb-12 text-center">
              <table align="center" border={0} cellPadding={0} cellSpacing={0} role="presentation" style={{ margin: '0 auto' }}>
                <tr>
                  <td style={{ verticalAlign: 'middle', paddingRight: '10px' }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="35"
                      height="35"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                    </svg>
                  </td>
                  <td style={{
                    fontSize: '28px',
                    fontWeight: '900',
                    letterSpacing: '-0.04em',
                    color: '#ffffff',
                    verticalAlign: 'middle'
                  }}>
                    Scorpio
                  </td>
                </tr>
              </table>
            </Section>

            <Section className="text-center">
              <Text className="text-[#a1a1aa] text-xs font-semibold uppercase tracking-[0.1em] mb-4">
                Research-Grade Intelligence
              </Text>
              <Text className="text-[24px] font-bold leading-[32px] mb-8">
                {assignmentName} is now live.
              </Text>
            </Section>

            <Section className="mb-8">
              <Text className="text-base leading-7 text-[#d4d4d8]">
                Hello {studentName.split(' ')[0]},
              </Text>
              <Text className="text-base leading-7 text-[#d4d4d8]">
                A new verifiable assessment has been published for your course.
                Complete your derivations and submit through the dashboard to maintain your progress.
              </Text>
            </Section>

            <Section className="text-center mt-10 mb-10">
              <Button
                href={link}
                className="bg-white text-black rounded-full px-10 py-5 text-sm font-bold no-underline shadow-xl tracking-tight"
              >
                Access Mission Control
              </Button>
            </Section>

            <Hr className="border-[#27272a] my-8" />

            <Section>
              <Text className="text-zinc-500 text-[11px] leading-relaxed text-center">
                SCORPIO PLATFORM — AUTHENTIC STUDENT INTELLIGENCE<br />
                This is an automated academic notification.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default AssignmentCreatedEmail;

