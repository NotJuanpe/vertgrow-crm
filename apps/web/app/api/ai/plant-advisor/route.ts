import { getClaudeClient, MODELS } from "@/lib/claude"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageBase64, imageMimeType, climate, sunlight, style, maintenance, dimensions, notes } = body

    if (!imageBase64 || !climate || !sunlight || !style || !maintenance) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const claude = getClaudeClient()

    const prompt = `You are an expert vertical gardening consultant. Based on the photo and parameters provided, recommend 5-8 plants that will thrive and look great together in this space.

Parameters:
- Climate/location: ${climate}
- Sunlight: ${sunlight}
- Style preference: ${style}
- Maintenance level: ${maintenance}
${dimensions ? `- Dimensions: ${dimensions.height}m high × ${dimensions.width}m wide` : ""}
${notes ? `- Additional notes: ${notes}` : ""}

Respond with a JSON object in this exact format:
{
  "design_note": "Brief 1-2 sentence overview of the design approach",
  "plants": [
    {
      "common_name": "string",
      "scientific_name": "string",
      "why_it_fits": "Why this plant suits this specific space and conditions",
      "care_difficulty": "easy" | "moderate" | "demanding",
      "pairing_note": "How it works with the other recommended plants"
    }
  ]
}

Only return the JSON. No markdown, no explanation outside the JSON.`

    const response = await claude.messages.create({
      model: MODELS.sonnet,
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: imageMimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: imageBase64,
              },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""
    const result = JSON.parse(text)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Plant advisor error:", error)
    return NextResponse.json(
      { error: "Failed to get plant recommendations. Please try again." },
      { status: 500 }
    )
  }
}
