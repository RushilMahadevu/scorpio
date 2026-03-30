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

interface GradeAvailableEmailProps {
  studentName: string;
  assignmentName: string;
  courseName?: string;
  score: number;
  maxScore: number;
  link: string;
}

export const GradeAvailableEmail = ({
  studentName = "Student",
  assignmentName = "Assignment",
  courseName = "Physics 101",
  score = 95,
  maxScore = 100,
  link = "https://scorpioedu.org/dashboard"
}: GradeAvailableEmailProps) => {
  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>Your grade for {assignmentName} is available</Preview>
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
                Your submission for <strong className="font-semibold text-zinc-900">{assignmentName}</strong> 
                {courseName ? ` in ${courseName}` : ''} has been auto-graded by our AI and the feedback is ready for your review.
              </Text>
              
              <Section className="my-8 rounded-xl bg-zinc-50 p-6 text-center border border-zinc-100">
                <Text className="m-0 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Overall Score
                </Text>
                <Text className="m-0 mt-2 text-4xl font-bold tracking-tight text-zinc-900">
                  {score} <span className="text-xl text-zinc-400 font-medium">/ {maxScore}</span>
                </Text>
              </Section>

              <Section className="mt-8 mb-4 text-center">
                <Link
                  href={link}
                  className="inline-block rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white no-underline shadow-sm hover:bg-zinc-800 transition-all"
                >
                  View Corrected Feedback
                </Link>
              </Section>
            </Section>

            <Hr className="my-8 border-zinc-200" />
            
            <Section>
              <Text className="text-xs leading-relaxed text-zinc-400">
                This is an automated message from Scorpio. 
                If you have questions about your grade or the AI's reasoning, you can request a manual review from your teacher directly in the dashboard.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default GradeAvailableEmail;
