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
  const result = await app.invoke({
    messages: [
      {
        role: "user",
        content: "Hii, have any  meeting with abhishek",
      },
    ],
  });
  const message = result.messages;
  console.log("AI", message[message.length - 1]?.content);
}

main();
