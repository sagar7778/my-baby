import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { Kids } from './kids.schema'
import { User } from './user.schema'

@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({
    required: false,
    set: (val: Date | string | number) => new Date(val).getTime()
  })
  date: Date

  @Prop({ required: false })
  title: string

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Kids' }] })
  kidsId: Kids[]

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: User

  @Prop({ default: false })
  isBookmarked: boolean

  @Prop({ required: false })
  description: string

  @Prop({ default: false })
  isDeleted: boolean
}
export const postSchema = SchemaFactory.createForClass(Post)
