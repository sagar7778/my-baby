import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  firstName: string

  @Prop({ required: true })
  lastName: string

  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: false })
  password: string

  @Prop({ default: false })
  isEmailVerified: boolean

  @Prop()
  provider: string

  @Prop()
  providerId: string

  @Prop()
  profile: string
}

export const UserSchema = SchemaFactory.createForClass(User)
