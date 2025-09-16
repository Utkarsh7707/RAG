import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIStream, StreamingTextResponse } from "ai";
import { DataAPIClient } from "@datastax/astra-db-ts";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";

const {
  ASTRA_DB_NAMESPACE,
  ASTRADB_COLLECTION,
  ASTRA_DB_API,
  ASTRA_DB_APPLICATION_TOKEN,
  GEMINI_API_KEY,
} = process.env;

// ✅ Gemini for chat
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// ✅ AstraDB client
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN!);
const db = client.db(ASTRA_DB_API!, { keyspace: ASTRA_DB_NAMESPACE });

// ✅ Ollama embeddings
const ollamaEmbeddings = new OllamaEmbeddings({
  model: "nomic-embed-text", // must match what you used when inserting
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const latestMessage = messages[messages?.length - 1]?.content;
    console.log("📩 User latest message:", latestMessage);

    let docContext = "";

    // ✅ Use Ollama for embeddings instead of Gemini
    const embedding = await ollamaEmbeddings.embedQuery(latestMessage);
    console.log("✅ Got Ollama embedding vector length:", embedding.length);

    try {
      const collection = await db.collection(ASTRADB_COLLECTION!);

      const cursor = collection.find(
        {},
        {
          sort: { $vector: embedding },
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

    // ✅ System template
    const template = {
      role: "system",
      content: `
You are an AI healthcare assistant helping community health workers interact with patients.
Use the context below to understand symptoms, conditions, and relevant patient-friendly questions.
If the context doesn't include enough information, answer based on general medical knowledge.
Always generate questions in **non-technical, easy-to-understand language** suitable for patients.
Do NOT mention whether context was used.
Format your output in JSON as follows:

----------
START CONTEXT 
${docContext}
END CONTEXT
QUESTION: ${latestMessage}
-----`,
    };

    console.log("📝 Final system prompt prepared:\n", template.content.slice(0, 500), "...");

    // ✅ Chat with Gemini
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
