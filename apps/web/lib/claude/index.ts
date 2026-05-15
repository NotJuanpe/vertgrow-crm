import Anthropic from "@anthropic-ai/sdk"

// Singleton — reused across requests in the same server process
let client: Anthropic | null = null

export function getClaudeClient(): Anthropic {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set")
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return client
}

export const MODELS = {
  // Vision + complex reasoning
  sonnet: "claude-sonnet-4-6",
  // Simple text tasks — ~10x cheaper
  haiku: "claude-haiku-4-5-20251001",
} as const
