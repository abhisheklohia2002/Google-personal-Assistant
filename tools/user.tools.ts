import { tool } from "@langchain/core/tools";
import z from "zod";
import userModel from "../model/user.model";

const createUser = tool(
  async (data) => {
    console.log(data, "user");
    const { name, email } = data;
    try {
      const isExisted = await userModel.findOne({ email });
      if (!isExisted) {
        const user = await userModel.create({
          name,
          email,
        });
        return "User created successfully";
      }
      return "User is already present";
    } catch (error) {
      console.log(error, "user:");
    }
  },
  {
    name: "create-user",
    description: "create the new user if is not present in db",
    schema: z.object({
      name: z.string().describe("store the name into db"),
      email: z.string().describe("store the email into db"),
    }),
  },
);

const getUser = tool(
  async (data) => {
    const { name, email } = data;
    try {
      let isExisted;
      if (email) {
        isExisted = await userModel.findOne({ email });
      } else {
        isExisted = await userModel.findOne({ name });
      }

      if (isExisted) {
        return "User is present";
      }
      return "User not found";
    } catch (error) {
      console.log(error, "user:");
    }
  },
  {
    name: "get-user",
    description: "create the new user if is not present in db",
    schema: z.object({
      name: z.string().describe("store the name into db"),
      email: z.string().describe("store the email into db"),
    }),
  },
);

export { getUser, createUser };
