import { ChatOpenAI } from "@langchain/openai";
import createCalenderEvents, {
  getCalenderEvents,
} from "./tools/calender.tools";
import { END, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import type { AIMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
import { writeFileSync } from "fs";
dotenv.config();

let tools: any = [createCalenderEvents, getCalenderEvents];
const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4.1-nano",
}).bindTools(tools);

const graph = new StateGraph(MessagesAnnotation);

const callModel = async (state: typeof MessagesAnnotation.State) => {
  const response = await model.invoke(state.messages);
  return { messages: [response] };
};

const toolNode = new ToolNode(tools);
const shouldContinue = (state: typeof MessagesAnnotation.State) => {
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  return "__end__";
};

graph
  .addNode("assistant", callModel)
  .addNode("tools", toolNode)
  .addEdge("__start__", "assistant")
  .addEdge("tools", "assistant")
  .addConditionalEdges("assistant", shouldContinue, {
    __end__: END,
    tools: "tools",
  });

const app = graph.compile();

async function main() {
  // const drawableGraphGraphState = await app.getGraphAsync();
  // const graphStateImage = await drawableGraphGraphState.drawMermaidPng();
  // const graphStateArrayBuffer = await graphStateImage.arrayBuffer();
  // const filePath = "./calenderGraph.png";
  // writeFileSync(filePath, new Uint8Array(graphStateArrayBuffer));
  const messages = [
    {
      role: "system",
      content: `
You are a meeting assistant.
Today's date is 2026-04-14.
User timezone is Asia/Kolkata.

When the user says:
- today => use 2026-04-14
- tomorrow => use 2026-04-15

Always convert relative dates into exact dateTime values.
Always use Asia/Kolkata unless the user says another timezone.
For meetings, generate start and end time in proper ISO format.
`,
    },
    {
      role: "user",
      content:
        "Hii, Today can U create the Meeting with abhishek.lohia@tripxl.com around 11:45 am",
    },
  ];
  const result = await app.invoke({
    messages,
  });
  const message = result.messages;
  console.log("AI", message[message.length - 1]?.content);
}

main();
