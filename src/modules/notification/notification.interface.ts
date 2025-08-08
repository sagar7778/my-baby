import { Document } from "mongoose"
import { IUser } from "../user/user.interface"

export interface INotification extends Document {
  daily: boolean
  weekly: boolean
  birthday: boolean
  milestones: boolean
  userId:IUser
}