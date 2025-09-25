import express from "express";
import dotenv from "dotenv";
import { streamWithOpenAI } from "./services/openai.service";
import { streamWithLangchain } from "./services/langchain.service";
import { createGraph } from "./services/langgraph.service";
dotenv.config();
const app = express();
const port = 3000;

// CORS middleware
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", async (_req, res) => {
  res.send("Smart Stream API - Use /stream endpoint for streaming responses");
});

app.get("/stream-langgraph", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const graph = createGraph();

  try {
    // Stream graph execution - each node outputs as it completes
    for await (const event of graph.streamEvents({}, { version: "v2" })) {
      if (event.event === "on_custom_event") {
        if (event.name === "stream_text") {
          res.write(`data: ${JSON.stringify({ content: event.data })}\n\n`);
        }
      }
    }
    res.write(`data: ${JSON.stringify({ content: "[DONE]" })}\n\n`);
  } catch (error) {
    console.error("Streaming error:", error);
  } finally {
    res.end();
  }
});

app.get("/stream", async (req, res) => {
  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // const prompt =
  //   (req.query.prompt as string) ||
  //   "Write a one-sentence bedtime story about a unicorn.";

  const prompt = `
  Generate information about 3 city. Bali, Tokyo, Paris.
  `;
  const model = req.query.model as string;
  console.log("model", model);

  // await streamWithLangchain(res);
  if (model === "openai") {
    await streamWithOpenAI(res);
  } else {
    await streamWithLangchain(res);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
