import { type Request, type Response, type Express } from "express";
import express from "express";
import { google } from "googleapis";
import dotenv from "dotenv";
import db from "./db/Connection";
dotenv.config();
const app: Express = express();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_Id,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL,
);

db()
app.get("/auth", async (req: Request, res: Response) => {
  //generate the links
  const scopes = ["https://www.googleapis.com/auth/calendar"];

  const url = await oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt:'consent',
    scope: scopes,
  });
  const link = "";
  console.log(url,'url')
  res.redirect(url);
});

app.get("/callback",async (req: Request, res: Response) => {
    const oAuthCode = req.query.code as string;
    const {tokens} = await oauth2Client.getToken(oAuthCode);
    console.log(tokens)
    res.send("Connected You can close this tab now...");
});


app.listen(3600, () => {
  console.log(`server is running at ${"http://localhost:3600/"}`);
});
