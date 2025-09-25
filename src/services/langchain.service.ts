import { ChatOpenAI } from "@langchain/openai";
import { Response } from "express";
import { z } from "zod";
import dotenv from "dotenv";
import { zodToJsonSchema } from "zod-to-json-schema";
import { JsonOutputKeyToolsParser } from "@langchain/core/output_parsers/openai_tools";
import { PromptTemplate } from "@langchain/core/prompts";

dotenv.config();

const ResponseObject = z
  .object({
    country: z.string().describe("The country name of the city"),
    city: z.string().describe("The city name"),
    note: z
      .string()
      .describe(
        "The note of the city. It should be a short description of the city."
      ),
    activities: z
      .array(z.string())
      .describe(
        "The activities of the city. It should be a list of activities that can be done in the city."
      ),
  })
  .describe("Response parameters");

const prompt = PromptTemplate.fromTemplate(
  `Generate information about 6 city. Bali, Tokyo, Paris.
  !!IMPORTANT!!: GENERATE 6 CITY CARDS.
  Every time you should call function "get_response" to get the response.
  get_response tool response example:
  {{
    "country": "Norway",
    "city": "Oslo",
    "note": "Oslo is the capital of Norway and a beautiful city with a lot of history and culture.",
    "activities": ["Hiking", "Beach", "Shopping"]
}}
    All fields: country, city, note, activities are required.
  `
);

export const streamWithLangchain = async (res: Response) => {
  try {
    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY!,
      modelName: "gpt-4o",
    });
    const modelWithTools = model.bind({
      tools: [
        {
          type: "function" as const,
          function: {
            name: "get_response",
            description: ResponseObject.description,
            parameters: zodToJsonSchema(ResponseObject),
          },
        },
      ],
      tool_choice: "required",
    });
    const chain = prompt.pipe(modelWithTools).pipe(
      new JsonOutputKeyToolsParser<z.infer<typeof ResponseObject>>({
        keyName: "get_response",
        zodSchema: ResponseObject as any,
      })
    );

    const stream = await chain.stream({});
    for await (const chunk of stream) {
      if (chunk == null) continue;
      if (Array.isArray(chunk) && chunk.every((item) => item === null))
        continue;
      if (
        typeof chunk === "object" &&
        Object.values(chunk).every(
          (value) => value === null || value === undefined
        )
      )
        continue;

      console.log("chunk", chunk);

      // Format the structured output to match OpenAI service format
      const content = typeof chunk === "object" ? JSON.stringify(chunk) : chunk;
      res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Structured streaming error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.write(
      `data: ${JSON.stringify({
        error: "Streaming failed",
        details: errorMessage,
      })}\n\n`
    );
    res.end();
  }
};
