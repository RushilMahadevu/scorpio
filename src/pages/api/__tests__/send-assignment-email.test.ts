import { createMocks } from 'node-mocks-http';
import handler from '../send-assignment-email';

jest.mock('sib-api-v3-sdk', () => {
  const sendTransacEmail = jest.fn().mockResolvedValue({});
  return {
    ApiClient: { instance: { authentications: { 'api-key': {} } } },
    TransactionalEmailsApi: jest.fn().mockImplementation(() => ({ sendTransacEmail })),
  };
});

describe('/api/send-assignment-email', () => {
  it('sends an email and returns 200', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        to: 'test@example.com',
        assignmentTitle: 'Test Assignment',
        dueDate: new Date().toISOString(),
        assignmentLink: '/student/assignments/123',
      },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ success: true });
  });

  it('returns 500 on error', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        to: 'fail@example.com',
        assignmentTitle: 'Fail Assignment',
        dueDate: new Date().toISOString(),
        assignmentLink: '/student/assignments/123',
      },
    });
    // Reset the module and override the mock for this test
    const sib = require('sib-api-v3-sdk');
    sib.TransactionalEmailsApi.mockImplementationOnce(() => ({
      sendTransacEmail: jest.fn().mockRejectedValue(new Error('fail')),
    }));
    await handler(req, res);
    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Failed to send email' });
  });

  it('returns 405 for non-POST', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });
});
