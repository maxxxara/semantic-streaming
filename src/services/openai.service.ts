import OpenAI from "openai";
import { z } from "zod";
import { Response } from "express";
import dotenv from "dotenv";
import { zodTextFormat } from "openai/helpers/zod";

dotenv.config();

export const Citycard = z.object({
  country: z.string(),
  city: z.string(),
  note: z.string(),
  activities: z.array(z.string()),
});

export const CityCardArray = z.object({
  cards: z.array(Citycard),
});

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export function isJsonValid(str: string) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

export function createValidPartialJson(rawJson: string): string {
  try {
    // First try to parse as-is
    JSON.parse(rawJson);
    return rawJson;
  } catch (e) {
    // If parsing fails, try to extract valid parts and create a valid structure
    try {
      // Extract all complete cards and the current incomplete card
      const cardsMatch = rawJson.match(/"cards"\s*:\s*\[(.*)/s);
      if (cardsMatch) {
        const cardsContent = cardsMatch[1];
        let validCards: any[] = [];

        // Find all complete cards (those that end with })
        let cardStart = -1;
        let braceCount = 0;
        let inString = false;
        let escaped = false;

        for (let i = 0; i < (cardsContent?.length || 0); i++) {
          const char = cardsContent?.[i];

          if (!escaped && char === '"') {
            inString = !inString;
          } else if (!inString) {
            if (char === "{") {
              if (braceCount === 0) cardStart = i;
              braceCount++;
            } else if (char === "}") {
              braceCount--;
              if (braceCount === 0 && cardStart !== -1) {
                // Found complete card
                const cardJson = cardsContent?.substring(cardStart, i + 1);
                try {
                  const card = JSON.parse(cardJson || "");
                  validCards.push({
                    country: card.country || "",
                    city: card.city || "",
                    note: card.note || "",
                    activities: card.activities || [],
                  });
                } catch (e) {
                  // Skip invalid card
                }
                cardStart = -1;
              }
            }
          }

          escaped = !escaped && char === "\\";
        }

        // Handle incomplete card at the end
        if (cardStart !== -1) {
          const incompleteCard = cardsContent?.substring(cardStart);
          // Try to extract available fields from incomplete card
          const countryMatch = incompleteCard?.match(
            /"country"\s*:\s*"([^"]*?)"/
          );
          const cityMatch = incompleteCard?.match(/"city"\s*:\s*"([^"]*?)"/);
          const noteMatch = incompleteCard?.match(/"note"\s*:\s*"([^"]*?)"/);

          if (countryMatch) {
            const partialCard: any = {
              country: countryMatch[1] || "",
              city: cityMatch ? cityMatch[1] : "",
              note: noteMatch ? noteMatch[1] : "",
              activities: [],
            };
            validCards.push(partialCard);
          }
        }

        return JSON.stringify({ cards: validCards });
      }
    } catch (e) {
      // Fallback: return empty structure
    }

    return JSON.stringify({ cards: [] });
  }
}

export async function streamWithOpenAI(res: Response): Promise<void> {
  try {
    // Create streaming completion with structured output
    const stream = await client.responses.create({
      model: "gpt-4o",
      input: [
        {
          role: "system",
          content:
            "You are a helpful assistant that generates city cards. You should generate 6 city cards. Every city card should be a JSON object with the following fields: country, city, note, activities. All fields are required.",
        },
        { role: "user", content: "Generate 6 city cards. Tokyo, Bali, Paris." },
      ],
      text: {
        format: zodTextFormat(CityCardArray, "card"),
      },
      stream: true,
    });

    let result = "";
    let lastValidJson = "";

    // Process stream chunks
    for await (const event of stream) {
      if (event.type === "response.output_text.delta" && event.delta) {
        result += event.delta;
        const partialJson = createValidPartialJson(result);

        console.log("raw result:", result);
        console.log("processed json:", partialJson);

        if (isJsonValid(partialJson)) {
          lastValidJson = partialJson;
          res.write(`data: ${JSON.stringify({ content: partialJson })}\n\n`);
        } else if (lastValidJson) {
          // Send the last valid JSON if current one is invalid
          res.write(`data: ${JSON.stringify({ content: lastValidJson })}\n\n`);
        }
      }
      if (event.type === "response.completed") {
        console.log("final result", result);
        // Send the final result, preferring the raw result if it's valid
        const finalJson = isJsonValid(result)
          ? result
          : createValidPartialJson(result);
        if (isJsonValid(finalJson)) {
          res.write(`data: ${JSON.stringify({ content: finalJson })}\n\n`);
        }
        res.write("data: [DONE]\n\n");
      }
    }
    res.end();
  } catch (error) {
    console.error("Streaming error:", error);
    res.write(`data: ${JSON.stringify({ error: "Streaming failed" })}\n\n`);
    res.end();
  }
}
