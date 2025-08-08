import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";
import { Post } from "./post.schema";
import { User } from "./user.schema";

export type BookmarkDocument = Bookmark & Document;

@Schema({timestamps: true})
export class Bookmark {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Post" })
    postId: Post;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User" })
    userId: User;

    @Prop({ default: false })
    isDeleted: boolean
}

export const BookmarkSchema = SchemaFactory.createForClass(Bookmark);