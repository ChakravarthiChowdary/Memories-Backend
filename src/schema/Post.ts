import { Schema, Model, Document, model, Types } from "mongoose";

interface IPost extends Document {
  title: string;
  description: string;
  userId: string;
  createdDate: Date;
  likes: number;
}

const PostSchema: Schema<IPost> = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  userId: { type: Types.ObjectId, required: true, ref: "User" },
  createdDate: { type: Date, required: true },
  likes: { type: Number, required: false },
});

const PostModel: Model<IPost> = model("Post", PostSchema);

export default PostModel;
