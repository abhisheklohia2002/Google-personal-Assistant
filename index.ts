import { ChatOpenAI } from "@langchain/openai";
import createCalenderEvents, { getCalenderEvents } from "./tools/calender.tools";


let tools:any = [createCalenderEvents,getCalenderEvents]
const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4-1106-preview",
}).bindTools(tools);

