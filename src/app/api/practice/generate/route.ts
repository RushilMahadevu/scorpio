import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return NextResponse.json({
    error: "Practice is temporarily disabled due to environmental harm (excessive token waste). Warning: Looking for better solutions."
  }, { status: 503 });
}
