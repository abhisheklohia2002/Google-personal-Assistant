import { tool } from "@langchain/core/tools";
import { google } from "googleapis";
import z from "zod";
import dotenv from "dotenv";
import tokens from "../token.json";
dotenv.config();
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_Id,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL,
);
oauth2Client.setCredentials(tokens);
const calender = google.calendar({ version: "v3", auth: oauth2Client });

const createCalenderEvents = tool(
  async () => {
    return "hello ";
  },
  {
    name: "calender-events",
    description: "Call to Create the calender events",
    schema: z.object({
      query: z.string().describe("the query to use in calender events"),
    }),
  },
);

export const getCalenderEvents = tool(
  async (params) => {
    const { q, timeMin, timeMax } = params;
    console.log(q, timeMin, timeMax, "timeMin,timeMax");
    try {
      const response = await calender.events.list({
        calendarId: "primary",
        q,
        timeMin,
        timeMax,
      });
      const result = response.data.items?.map((event) => {
        return {
          id: event.id,
          summary: event.summary,
          status: event.status,
          organizer: event.organizer,
          start: event.start,
          end: event.end,
          attendees: event.attendees,
          meetingLink: event.hangoutLink,
          eventType: event.eventType,
        };
      });
      return JSON.stringify(result);
    } catch (error) {
      console.log("error", error);
    }

    return "Failed to Connect to the calender";
  },
  {
    name: "get-events",
    description: "Call to get the calender events",
    schema: z.object({
      q: z
        .string()
        .describe(
          "The query to be used to get events from google calendar. It can be one of these values: sunmary, description, location, attendees display name, attendees email, organiser's name, organiser's emall",
        ),
      timeMin: z
        .string()
        .describe("The from DateTime in UTC format for the events"),
      timeMax: z
        .string()
        .describe("The  datetime in UTC format for the events"),
    }),
  },
);

export default createCalenderEvents;
