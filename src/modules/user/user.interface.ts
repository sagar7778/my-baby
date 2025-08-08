import { Document } from 'mongoose'

export interface IUser extends Document {
  firstName: string
  lastName: string
  email: string
  password: string
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
  provider?: string
  providerId?: string
  profile?: string
}

export interface IVerification extends Document {
  email: string
  code: string
  expiryAt: number
}
