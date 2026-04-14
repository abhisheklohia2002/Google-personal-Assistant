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

type attendee = {
  email: string;
  displayName: string;
};
type EventData = {
  summary: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees: attendee[];
};
const createCalenderEvents = tool(
  async (eventData: EventData) => {
    const { start, summary, end, attendees } = eventData as EventData;
    try {
      const response = await calender.events.insert({
        calendarId: "primary",
        sendUpdates: "all",
        requestBody: {
          summary,
          start,
          end,
          attendees,
        },
      });
      console.log("response :", response);
    } catch (error) {
      console.log("error",error);
    }
  },
  {
    name: "calender-events",
    description: "Call to Create the calender events",
    schema: z.object({
      summart: z.string().describe("The Title of the Events"),
      start: z.object({
        dateTime: z.string().describe("The Start Date time of the event in UTC"),
        timeZone:z.string().describe("The Start Time Zone of the event Time in UTC"),
      }),
      end: z.object({
        dateTime: z.string().describe("The end Date time of the event in UTC"),
        timeZone:z.string().describe("The end Time Zone of the event Time in UTC"),
      }),
      attendees:z.array(z.object({
        email:z.string().describe("The Email of the attendee"),
        displayName:z.string().describe("The display of the Name")
      }))
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
