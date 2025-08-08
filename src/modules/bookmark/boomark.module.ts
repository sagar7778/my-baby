import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { BookmarkController } from './bookmark.controller'
import { BookmarkService } from './bookmark.service'
import { BookmarkSchema } from 'src/schema/bookmark.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Bookmark', schema: BookmarkSchema }]),
  ],
  controllers: [BookmarkController],
  providers: [BookmarkService],
  exports: [BookmarkService],
})
export class BookmarkModule {}
