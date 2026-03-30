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
  Button,
  Img
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
  const brandColor = '#1a1a1a'; // oklch(0.20 0 0) equivalent

  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>New Scorpio Assignment: {assignmentName}</Preview>
        <Body style={{ backgroundColor: brandColor }} className="font-sans text-[#fafafa] m-0 py-10">
          <Container style={{ backgroundColor: brandColor }} className="mx-auto max-w-[465px] border border-solid border-[#333] rounded-2xl p-10">
            <Section className="mt-4 mb-12 text-center">
              <table align="center" border={0} cellPadding={0} cellSpacing={0} role="presentation" style={{ margin: '0 auto' }}>
                <tr>
                  <td style={{ verticalAlign: 'middle', paddingRight: '12px' }}>
                    <Img
                      src="https://scorpioedu.org/favicon-dark.ico"
                      width="35"
                      height="35"
                      alt="Scorpio Logo"
                    />
                  </td>
                  <td style={{
                    fontSize: '30px',
                    fontWeight: '900',
                    letterSpacing: '-0.05em',
                    color: '#ffffff',
                    verticalAlign: 'middle',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
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

