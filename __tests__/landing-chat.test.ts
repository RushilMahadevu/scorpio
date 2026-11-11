import { NextRequest } from 'next/server';
import { billingContext } from '../src/lib/billing-context';

// Mock fetch for Gemini API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock Firebase Admin
const mockVisitorDoc = { exists: false, data: () => ({ messageCount: 0 }) };
const mockDocSet = jest.fn(async () => {});
const mockDocGet = jest.fn(async () => mockVisitorDoc);
const mockCollection = jest.fn((..._args: any[]) => ({
  doc: jest.fn(() => ({
    get: mockDocGet,
    set: mockDocSet,
  })),
}));

jest.mock('../src/lib/firebase-admin', () => ({
  adminDb: {
    collection: (...args: any[]) => mockCollection(...args),
    runTransaction: jest.fn(async (cb: any) =>
      cb({
        get: jest.fn(async () => ({ exists: false, data: () => null })),
        set: jest.fn(),
      })
    ),
  },
}));

process.env.GEMINI_API_KEY = 'test-gemini-key';

import { model } from '../src/lib/ai/config';
import { POST as landingChatPost } from '../src/app/api/chat/landing/route';

describe('Landing Chat & Try AI Guest Access', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'Scorpio offers transparent pricing.' }] } }],
        usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 20 },
      }),
    });
  });

  test('non-exempt AI request without organizationId throws network auth error', async () => {
    await expect(
      billingContext.run({ organizationId: '', type: 'tutor' }, () =>
        model.generateContent('Physics question')
      )
    ).rejects.toThrow('An authenticated network is required for AI');
  });

  test('landing page AI request without organizationId succeeds for guests', async () => {
    const res = await billingContext.run({ organizationId: '', type: 'landing' }, () =>
      model.generateContent('How much does Scorpio cost?')
    );
    const respObj = await res.response;
    expect(respObj.text()).toBe('Scorpio offers transparent pricing.');
  });

  test('/api/chat/landing returns 200 with AI response for guest visitor', async () => {
    const req = new NextRequest('https://scorpio.test/api/chat/landing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'How much does Scorpio cost?', visitorId: 'v_test_guest_123' }),
    });

    const res = await landingChatPost(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.text).toBe('Scorpio offers transparent pricing.');
    expect(data.remaining).toBe(9);
  });

  test('/api/chat/landing returns 429 when visitor demo limit is reached', async () => {
    mockDocGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ messageCount: 10 }),
    } as any);

    const req = new NextRequest('https://scorpio.test/api/chat/landing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Can I have more free messages?', visitorId: 'v_limit_reached' }),
    });

    const res = await landingChatPost(req);
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.limitReached).toBe(true);
    expect(data.error).toContain('demo limit');
  });
});
