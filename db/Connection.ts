import mongoose from "mongoose";
const db = async () => {
  try {
    if (process.env.MONGO_URL) {
      const connection = await mongoose.connect(process.env.MONGO_URL, {});
      console.log('db is connected')
    }
  } catch (error) {
    console.log(error, "db not connected");
  }
};

export default db;
