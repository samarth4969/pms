import OpenAI from "openai";

let client;

const getClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not loaded");
  }

  if (!client) {
    client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }

  return client;
};

/**
 * Generate Viva Questions
 */
export const generateVivaQuestions = async (project) => {
  try {
    const ai = getClient();

    const response = await ai.chat.completions.create({
      model: "llama-3.1-8b-instant", // ✅ WORKING MODEL
      messages: [
        {
          role: "system",
          content: "You are a strict engineering viva examiner.",
        },
        {
          role: "user",
          content: `
Project Title: ${project.title}

Project Description:
${project.description}

Generate 5 technical viva questions.
Only return numbered questions.
          `,
        },
      ],
      temperature: 0.7,
    });

    const rawText = response.choices[0].message.content;

    // Convert numbered string into array
    const questions = rawText
      .split("\n")
      .filter((q) => q.trim() !== "")
      .map((q) => q.replace(/^\d+[\).\s]*/, "").trim());

    return questions;

  } catch (error) {
    console.error("Groq Question Error:", error);
    throw new Error("Failed to generate viva questions");
  }
};

/**
 * Evaluate Answer
 */
export const evaluateAnswer = async (question, answer) => {
  try {
    const ai = getClient();

    const response = await ai.chat.completions.create({
      model: "llama-3.1-8b-instant", // ✅ FIXED HERE ALSO
      messages: [
        {
          role: "system",
          content: "You are a strict but fair engineering professor.",
        },
        {
          role: "user",
          content: `
Question:
${question}

Student Answer:
${answer}

Evaluate strictly and give:

Score: X/10
Feedback:
Improvement:
          `,
        },
      ],
      temperature: 0.5,
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error("Groq Evaluation Error:", error);
    throw new Error("Failed to evaluate answer");
  }
};
