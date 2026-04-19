import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';

const TOKENS_FILE = '/root/.openclaw/credentials/google_tokens.json';

export async function GET() {
  try {
    const tokens = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf-8'));
    const expiresAt = tokens.token_expiry ?? 0;
    const now = Date.now();
    
    return NextResponse.json({
      hasToken: !!tokens.access_token,
      accessToken: tokens.access_token?.slice(0, 15) + '...',
      expiresAt,
      now,
      isValid: now < expiresAt * 1000,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
