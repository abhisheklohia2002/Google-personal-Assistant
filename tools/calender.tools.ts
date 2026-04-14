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
    const { start, summary, end, attendees } = eventData;
    try {
      const response = await calender.events.insert({
        calendarId: "primary",
        conferenceDataVersion: 1,
        requestBody: {
          summary,
          start,
          end,
          attendees,
          conferenceData: {
            createRequest: {
              requestId: `meet-${Date.now()}`,
              conferenceSolutionKey: {
                type: "hangoutsMeet",
              },
            },
          },
        },
      });
      return response.data;
    } catch (error: any) {
      console.log("error:", error.response?.data || error.message || error);
      throw error;
    }
  },
  {
    name: "calender-events",
    description: "Call to Create the calender events",
    schema: z.object({
      summary: z.string().describe("The Title of the Events"),
      start: z.object({
        dateTime: z.string().describe("The Start Date time of the event in UTC"),
        timeZone: z.string().describe("The Start Time Zone of the event"),
      }),
      end: z.object({
        dateTime: z.string().describe("The End Date time of the event in UTC"),
        timeZone: z.string().describe("The End Time Zone of the event"),
      }),
      attendees: z.array(
        z.object({
          email: z.string().describe("The Email of the attendee"),
          displayName: z.string().describe("The display name"),
        })
      ),
    }),
  }
);

export const getCalenderEvents = tool(
  async (params) => {
    const { q, timeMin, timeMax } = params;
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

export const deleteCalenderEvents = tool(
  async({eventId})=>{
    const response  = await calender.events.delete(
      {
           calendarId: "primary",
           eventId
      }  
    )
    if(!response){
      return  "Something Went Wrong .event not deleted";
    }
      return  "Event deleted successfully";

  },
   {
    name: "delete-calender-events",
    description: "Call to delete the calender events",
    schema: z.object({
     eventId: z.string().describe("The id of the calendar event to delete"),
    }),
  }
)



export default createCalenderEvents;
