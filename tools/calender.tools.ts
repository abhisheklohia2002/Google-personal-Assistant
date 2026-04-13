import { tool } from "@langchain/core/tools";
import z from "zod";

const createCalenderEvents = tool(
  async () => {
    return "hello ";
  },
  {
    name: "calender-events",
    description: "Call to Create the calender events",
    schema: z.object({
      //    query: z.string().describe("the query to use in calender events"),
    }),
  },
);

export const getCalenderEvents = tool(
  async () => {
    return JSON.stringify([
        {
            title:"Meeting with Sujoy",
            date:"26th Aug 2025",
            time:"2 PM",
            location:"Gmeet"
        }
    ]);
  },
  {
    name: "get-events",
    description: "Call to get the calender events",
    schema: z.object({
      //    query: z.string().describe("the query to use in calender events"),
    }),
  },
);

export default createCalenderEvents;
