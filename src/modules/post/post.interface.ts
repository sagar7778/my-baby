import { IKids } from "../kids/kids.interface";
import { IUser } from "../user/user.interface"; 

export interface IPost {
    kidsId: IKids[];
    date: number;
    description: string;
    userId: IUser;
    isDeleted: boolean;
}