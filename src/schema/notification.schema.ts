import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { User } from './user.schema'

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: User

  @Prop({ default: false })
  daily: boolean

  @Prop({ default: false })
  weekly: boolean

  @Prop({ default: false })
  birthday: boolean

  @Prop({ default: false })
  milestones: boolean
}

export const notificationSchema = SchemaFactory.createForClass(Notification)
