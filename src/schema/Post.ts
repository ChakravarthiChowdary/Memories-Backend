import { Schema, Model, Document, model, Types } from "mongoose";

interface IPost extends Document {
  title: string;
  description: string;
  userId: string;
  createdDate: Date;
  likes: number;
  userPhoto: string;
  photoUrls: string[];
  likedUsers: string[];
  favUsers: string[];
  favCount: number;
}

const PostSchema: Schema<IPost> = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  userId: { type: Types.ObjectId, required: true, ref: "User" },
  createdDate: { type: Date, required: true },
  likes: { type: Number, required: false },
  userPhoto: { type: String, required: false },
  photoUrls: { type: [String], required: true },
  likedUsers: { type: [String], required: false },
  favUsers: { type: [String], required: false },
  favCount: { type: Number, required: false },
});

PostSchema.set("toObject", {
  getters: true,
  transform: (doc, ret, options) => {
    delete ret.likedUsers;
    delete ret.favUsers;
    return ret;
  },
});

const PostModel: Model<IPost> = model("Post", PostSchema);

export default PostModel;
