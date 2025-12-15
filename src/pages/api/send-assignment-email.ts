import type { NextApiRequest, NextApiResponse } from 'next';
import SibApiV3Sdk from 'sib-api-v3-sdk';

const apiKey = process.env.BREVO_API_KEY;
const client = SibApiV3Sdk.ApiClient.instance;
client.authentications['api-key'].apiKey = apiKey!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();
    // const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();
    // if (req.method === 'POST') {
    //   const { to, assignmentTitle, dueDate, assignmentLink } = req.body;
    //   try {
    //     await emailApi.sendTransacEmail({
    //       sender: { email: 'rushil.mahadevu@gmail.com', name: 'Scorpio' },
    //       to: [{ email: to }],
    //       subject: `New Assignment Posted: ${assignmentTitle}`,
    //       htmlContent: `
    //         <p>Hi,</p>
    //         <p>A new assignment <b>${assignmentTitle}</b> has been posted.</p>
    //         <p>Due: <b>${new Date(dueDate).toLocaleString()}</b></p>
    //         <p><a href="${assignmentLink}">View & Submit Assignment</a></p>
    //         <p>— Scorpio Physics Platform</p>
    //       `,
    //     });
    //     res.status(200).json({ success: true });
    //   } catch (error) {
    //     res.status(500).json({ error: 'Failed to send email' });
    //   }
    // } else {
    //   res.status(405).end();
    // }
    // Email sending temporarily disabled for development. Remove comments to re-enable.
    res.status(200).json({ success: true, message: 'Email sending is currently disabled.' });
}
