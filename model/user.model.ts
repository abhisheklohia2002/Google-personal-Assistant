import mongoose from "mongoose";
import type { IUser } from "../types";

const user = new mongoose.Schema<IUser>({
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true
        }
},
{
    timestamps:true
}
)

const userModel = mongoose.model('user',user);
export default userModel
