import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook endpoint is reachable',
    timestamp: new Date().toISOString(),
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? 'configured' : 'missing'
  })
}

export async function POST() {
  return NextResponse.json({ 
    message: 'Webhook test endpoint - use main webhook for real events',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? 'configured' : 'missing'
  })
}
