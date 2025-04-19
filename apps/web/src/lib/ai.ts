import { logger } from "./logger"

/**
 * Generate text using OpenAI API
 */
export async function generateText(prompt: string, context?: string): Promise<string> {
  logger.info("Generating AI response", { promptLength: prompt.length })

  try {
    // In a real app, this would call the API service
    // For now, we'll simulate a response
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY

    if (!apiKey) {
      logger.warn("OpenAI API key not found, using mock response")
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return `This is a simulated AI response to: "${prompt.slice(0, 20)}..."`
    }

    // In a real implementation, we would call the API service
    // which would then call OpenAI
    const response = await fetch("/api/ai/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, context }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    logger.info("AI response generated successfully")

    return data.text
  } catch (error) {
    logger.error("Error generating AI response", { error })
    throw new Error("Failed to generate AI response")
  }
}
