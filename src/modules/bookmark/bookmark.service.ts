import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Bookmark } from 'src/schema/bookmark.schema'
import { CreateBookmarkDto } from './dto/create-bookmark.dto'

@Injectable()
export class BookmarkService {
  constructor(@InjectModel(Bookmark.name) private readonly bookmarkModel: Model<Bookmark>) {}

  async create(createBookmarkDto: CreateBookmarkDto) {
    const { userId, postId } = createBookmarkDto

    const existing = await this.bookmarkModel.findOne({ userId, postId, isDeleted: false })

    if (existing) {
      return existing
    }

    const bookmark = await this.bookmarkModel.create(createBookmarkDto)
    return bookmark
  }

  async findAll(userId: string) {
    const bookmarks = await this.bookmarkModel
      .find({ userId, isDeleted: false })
      .populate('postId')
      .populate('userId')
      .lean()

    return bookmarks
  }

  async delete(userId: string, postId: string): Promise<{ message: string }> {
    const bookmark = await this.bookmarkModel.findOne({ userId, postId, isDeleted: false })

    if (!bookmark) {
      throw new NotFoundException(`Bookmark not found for post ${postId} and user ${userId}`)
    }

    await this.bookmarkModel.findByIdAndUpdate(bookmark._id, { isDeleted: true })

    return { message: 'Bookmark deleted successfully' }
  }
}
