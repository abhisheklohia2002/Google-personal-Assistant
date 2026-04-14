import { ChatOpenAI } from "@langchain/openai";
import createCalenderEvents, {
  deleteCalenderEvents,
  getCalenderEvents,
} from "./tools/calender.tools";
import { END, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import type { AIMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
import readline from "readline/promises";
dotenv.config();

let tools: any = [
  createCalenderEvents,
  getCalenderEvents,
  deleteCalenderEvents,
];
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
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  while (true) {
    const userInput = await rl.question("You: ");
    if (userInput === "/bye") {
      break;
    }
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
        content: userInput,
      },
    ];
    const result = await app.invoke({
      messages,
    });
    const message = result.messages;
    console.log("AI", message[message.length - 1]?.content);
  }
  rl.close()
}

main();
