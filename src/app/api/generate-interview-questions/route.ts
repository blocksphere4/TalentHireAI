import { OpenAI } from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import {
  SYSTEM_PROMPT,
  generateQuestionsPrompt,
} from "@/lib/prompts/generate-questions";
import { logger } from "@/lib/logger";

export const maxDuration = 60;

export async function POST(req: Request) {
  logger.info("generate-interview-questions request received");
  const body = await req.json();
  const selectedModel = body.model || "gemini"; // Default to Gemini (free)

  // Use OpenAI if selected
  if (selectedModel === "openai") {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("OpenAI API key not configured. Please set OPENAI_API_KEY or switch to Gemini.");
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        maxRetries: 5,
      });

      const baseCompletion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: generateQuestionsPrompt(body),
          },
        ],
        response_format: { type: "json_object" },
      });

      const basePromptOutput = baseCompletion.choices[0] || {};
      const content = basePromptOutput.message?.content;

      logger.info("Interview questions generated successfully with OpenAI");

      return NextResponse.json(
        {
          response: content,
          provider: "openai",
        },
        { status: 200 },
      );
    } catch (error) {
      logger.error("Error generating interview questions with OpenAI:", error as Error);

      return NextResponse.json(
        {
          error: "Failed to generate interview questions with OpenAI",
          details: error instanceof Error ? error.message : String(error),
          message: "OpenAI request failed. Try switching to Google Gemini (FREE) or check your OpenAI API quota."
        },
        { status: 500 },
      );
    }
  }

  // Use Google Gemini (default and free)
  try {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("Google API key not configured. Please set GOOGLE_API_KEY in your .env file.");
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `${SYSTEM_PROMPT}\n\n${generateQuestionsPrompt(body)}`;
    const result = await model.generateContent(prompt);
    const content = result.response.text();

    logger.info("Interview questions generated successfully with Gemini");

    return NextResponse.json(
      {
        response: content,
        provider: "gemini",
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Error generating interview questions with Gemini:", error as Error);

    return NextResponse.json(
      {
        error: "Failed to generate interview questions with Gemini",
        details: error instanceof Error ? error.message : String(error),
        message: "Please check your Google API key. Get a free key at https://aistudio.google.com/app/apikey"
      },
      { status: 500 },
    );
  }
}
