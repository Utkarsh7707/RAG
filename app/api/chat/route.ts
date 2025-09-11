import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIStream, StreamingTextResponse } from "ai";
import { DataAPIClient } from "@datastax/astra-db-ts";

// Load env vars
const {
  ASTRA_DB_NAMESPACE,
  ASTRADB_COLLECTION,
  ASTRA_DB_API,
  ASTRA_DB_APPLICATION_TOKEN,
  GEMINI_API_KEY,
} = process.env;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

// Choose model (Gemini 1.5 Pro is common for chat)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// AstraDB client
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN!);
const db = client.db(ASTRA_DB_API!, {
  keyspace: ASTRA_DB_NAMESPACE,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const latestMessage = messages[messages?.length - 1]?.content;
    console.log("📩 User latest message:", latestMessage);

    let docContext = "";

    // Embedding
    const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
    const embeddingResp = await embeddingModel.embedContent(latestMessage);
    const embedding = embeddingResp.embedding;

    console.log("✅ Got embedding vector of length:", embedding.values.length);

    try {
      const collection = await db.collection(ASTRADB_COLLECTION!);

      const cursor = collection.find(
        {},
        {
          sort: {
            $vector: embedding.values,
          },
          limit: 10,
        }
      );

      const documents = await cursor.toArray();
      console.log("📚 Retrieved documents from DB:", documents?.length);

      if (documents?.length > 0) {
        documents.forEach((doc, i) =>
          console.log(`   [Doc ${i + 1}]`, doc.text?.slice(0, 200), "...")
        );
      }

      const docsMap = documents?.map((doc) => doc.text);
      docContext = JSON.stringify(docsMap);
    } catch (err) {
      console.log("❌ DB query error:", err);
    }

    // Template system prompt
    const template = {
      role: "system",
      content: `
You are an AI assistant who knows everything about Formula One.
Use the context below to augment what you know about Formula One racing.
If the context doesn't include the information you need, answer from your existing knowledge.
Do NOT mention whether context was used.
Format responses in markdown when applicable.

----------
START CONTEXT 
${docContext}
END CONTEXT
QUESTION: ${latestMessage}
-----`,
    };

    console.log("📝 Final system prompt prepared:\n", template.content.slice(0, 500), "...");

    // Streaming
    const response = await model.generateContentStream({
      contents: [
        { role: "user", parts: [{ text: template.content }] },
        ...messages.map((msg: any) => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        })),
      ],
    });

    console.log("🚀 Streaming response started from Gemini API...");

    const stream = GoogleGenerativeAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.log("💥 Error in POST querying DB:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
