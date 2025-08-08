import { Module } from '@nestjs/common'
import { PostController } from './post.controller'
import { PostService } from './post.service'
import { MongooseModule } from '@nestjs/mongoose'
import { postSchema } from 'src/schema/post.schema'
import { mediaSchema } from 'src/schema/media.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Post', schema: postSchema },
      { name: 'Media', schema: mediaSchema }
    ])
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService]
})
export class PostModule {}
