import { Gender } from "src/schema/kids.schema"
import { IUser } from "../user/user.interface"

export interface IKids{
    name:string
    dob:Date
    gender:Gender
    userId:IUser
    isDeleted:boolean
}