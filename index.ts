import { ChatOpenAI } from "@langchain/openai";


let tools:any = []
const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4-1106-preview",
}).bindTools(tools);
