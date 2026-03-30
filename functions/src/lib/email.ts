import { Resend } from 'resend';
import * as React from 'react';

let resend: Resend | null = null;

export async function sendEmail({
  apiKey,
  to,
  subject,
  react
}: {
  apiKey?: string;
  to: string | string[];
  subject: string;
  react: React.ReactElement;
}) {
  const finalApiKey = apiKey || process.env.RESEND_API_KEY;
  if (!finalApiKey) {
    console.warn("No RESEND_API_KEY found. Skipping email send.");
    return;
  }
  
  if (!resend) {
    resend = new Resend(finalApiKey);
  }
  
  try {
    const data = await resend.emails.send({
      from: 'Scorpio Platform <no-reply@scorpioedu.org>', 
      to,
      subject,
      react,
    });
    console.log(`Email sent successfully to ${to}`, data);
    return data;
  } catch (error) {
    console.error(`Failed to send email to ${to}`, error);
    throw error;
  }
}
