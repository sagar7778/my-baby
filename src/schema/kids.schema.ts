import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { User } from './user.schema'

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

@Schema({ timestamps: true })
export class Kids extends Document {
  @Prop({ required: true })
  name: string

  @Prop({
    required: true,
    set: (val: Date | string | number) => new Date(val).getTime()
  })
  dob: Date

  @Prop({ required: true, enum: Gender })
  gender: Gender

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: User

  @Prop()
  profile:string

  @Prop({ default: false })
  isDeleted: boolean
}

export const kidsSchema = SchemaFactory.createForClass(Kids)
