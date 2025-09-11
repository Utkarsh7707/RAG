import { DataAPIClient } from "@datastax/astra-db-ts";
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as cheerio from "cheerio";
import "dotenv/config";

console.log("ASTRA_DB_API:", process.env.ASTRA_DB_API);

const {
  ASTRA_DB_NAMESPACE,
  ASTRADB_COLLECTION,
  ASTRA_DB_API,
  ASTRA_DB_APPLICATION_TOKEN,
  GEMINI_API_KEY,
} = process.env;

const geminiAi = new GoogleGenerativeAI(GEMINI_API_KEY);

type similarityMetric = "dot_product" | "cosine" | "euclidean";

const f1Data = ["https://en.wikipedia.org/wiki/Formula_One"];

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API, { keyspace: ASTRA_DB_NAMESPACE });

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

// ✅ Clean HTML with cheerio
const cleanHTML = (html: string): string => {
  const $ = cheerio.load(html);
  return $("body").text().replace(/\s+/g, " ").trim(); // collapse spaces
};

// ✅ Scrape & clean page
const scrapePage = async (url: string): Promise<string> => {
  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: { headless: true },
    gotoOptions: { waitUntil: "domcontentloaded" },
  });

  const docs = await loader.load();
  return docs.map((d) => cleanHTML(d.pageContent)).join("\n");
};

// ✅ Create Astra collection with correct Gemini dimension (768)
const createCollection = async (
  similarityMetric: similarityMetric = "dot_product"
) => {
  const res = await db.createCollection(ASTRADB_COLLECTION, {
    vector: {
      dimension: 768, // Gemini embedding size
      metric: similarityMetric,
    },
  });

  console.log("Collection created:", res);
};

// ✅ Load sample data with Gemini embeddings
const loadSampleData = async () => {
  const collection = await db.collection(ASTRADB_COLLECTION);

  for await (const url of f1Data) {
    console.log("Scraping:", url);
    const content = await scrapePage(url);
    const chunks = await splitter.splitText(content);

    for await (const chunk of chunks) {
      const model = geminiAi.getGenerativeModel({ model: "embedding-001" });
      const result = await model.embedContent(chunk);

      const vector = result.embedding.values; // ✅ correct Gemini format

      const res = await collection.insertOne({
        text: chunk,
        $vector: vector,
        source: url,
      });

      console.log("Inserted:", res);
    }
  }

  console.log("Sample data loaded.");
};

// Run
createCollection().then(() => loadSampleData());
