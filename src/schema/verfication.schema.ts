import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ timestamps: true })
export class Verification extends Document {
  @Prop({ required: true })
  email: string

  @Prop({ required: true })
  code: string

  @Prop({
    required: true,
    set: (val: Date | string | number) => new Date(val).getTime()
  })
  expiryAt: Date
}
export const verificationSchema = SchemaFactory.createForClass(Verification)
