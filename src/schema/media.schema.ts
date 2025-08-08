import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { User } from './user.schema'
import { Post } from './post.schema'

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO'
}

@Schema({ timestamps: true })
export class Media extends Document {
  @Prop({ required: true, enum: MediaType })
  type: MediaType

  @Prop({ required: true })
  url: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post' })
  postId: Post

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: User

  @Prop({ default: false })
  isDeleted: boolean
}
export const mediaSchema = SchemaFactory.createForClass(Media)
