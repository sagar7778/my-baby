import {IPost} from "../post/post.interface";
import {IUser} from "../user/user.interface";

export interface IBookmark{
    postId: IPost
    userId: IUser
}