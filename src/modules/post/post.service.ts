import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Post } from 'src/schema/post.schema'
import { Media, MediaType } from 'src/schema/media.schema'
import { updatePostDto, postDto, deleteResponseDto } from './dto/post.dto'
import { bucketName, s3Client } from 'src/utils/minio.client'
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuid } from 'uuid'
import * as mime from 'mime-types'
import { Readable } from 'stream'

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    @InjectModel(Media.name) private readonly mediaModel: Model<Media>
  ) {}
  async create(postDto: postDto, files?: Express.Multer.File[]): Promise<Post> {
    const post = await this.postModel.create(postDto)
    if (files && files.length > 0) {
      await Promise.all(
        files.map(async file => {
          const ext = mime.extension(file.mimetype) || 'bin'
          const filename = `${uuid()}.${ext}`

          await s3Client.send(
            new PutObjectCommand({
              Bucket: bucketName,
              Key: filename,
              Body: Readable.from(file.buffer),
              ContentType: file.mimetype
            })
          )

          await this.mediaModel.create({
            type: file.mimetype.startsWith('video') ? MediaType.VIDEO : MediaType.IMAGE,
            url: filename,
            postId: post._id,
            userId: post.userId
          })
        })
      )
    }

    return post
  }
  async getAll(userId: string) {
    const posts = await this.postModel
      .find({ userId, isDeleted: false })
      .populate('kidsId')
      .populate('userId')
      .sort({ createdAt: -1 })
      .lean()

    const postIds = posts.map(post => post._id)
    const mediaList = await this.mediaModel.find({ postId: { $in: postIds }, isDeleted: false }).lean()

    const mediaWithUrls = await Promise.all(
      mediaList.map(async media => {
        const url = await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: bucketName,
            Key: media.url
          }),
          { expiresIn: 60 * 60 }
        )
        return {
          ...media,
          url
        }
      })
    )

    const mediaMapByPostId = mediaWithUrls.reduce(
      (acc, media: any) => {
        const postId = media.postId.toString()
        if (!acc[postId]) {
          acc[postId] = []
        }
        acc[postId].push(media)
        return acc
      },
      {} as Record<string, any[]>
    )

    const postsWithMedia = await Promise.all(
      posts.map(async (post: any) => {
        const media = mediaMapByPostId[post._id.toString()] || []

        const kidsWithProfileUrls = await Promise.all(
          (post.kidsId || []).map(async (kid: any) => {
            if (kid.profile) {
              const presignedProfileUrl = await getSignedUrl(
                s3Client,
                new GetObjectCommand({
                  Bucket: bucketName,
                  Key: kid.profile
                }),
                { expiresIn: 60 * 60 }
              )
              return {
                ...kid,
                profile: presignedProfileUrl
              }
            }
            return kid
          })
        )

        return {
          ...post,
          kidsId: kidsWithProfileUrls,
          media
        }
      })
    )

    return postsWithMedia
  }

  async getById(id: string) {
    const post = await this.postModel.findById(id).populate('kidsId').populate('userId').lean()

    if (!post) {
      throw new NotFoundException('Post not found')
    }

    const media = await this.mediaModel.find({ postId: id, isDeleted: false }).lean()

    const mediaWithUrls = await Promise.all(
      media.map(async m => {
        const url = await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: bucketName,
            Key: m.url
          }),
          { expiresIn: 60 * 60 }
        )
        return {
          ...m,
          url
        }
      })
    )

    return {
      ...post,
      media: mediaWithUrls
    }
  }

  async update(
    id: string,
    postDto: updatePostDto,
    files?: Express.Multer.File[],
    existingMedia: string[] = []
  ): Promise<Post> {
    const post = await this.postModel.findByIdAndUpdate(id, postDto, { new: true })
    if (!post) {
      throw new NotFoundException('Post not found')
    }

    const dbMedia = await this.mediaModel.find({ postId: id, isDeleted: false })

    const mediaToDelete = dbMedia.filter(media => !existingMedia.includes(media.url))
    Logger.log(mediaToDelete, 'media to delete')

    await Promise.all(
      mediaToDelete.map(async media => {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: media.url
          })
        )
        await this.mediaModel.findByIdAndUpdate(media._id, { isDeleted: true })
      })
    )

    if (files && files.length > 0) {
      await Promise.all(
        files.map(async file => {
          const ext = mime.extension(file.mimetype) || 'bin'
          const filename = `${uuid()}.${ext}`

          await s3Client.send(
            new PutObjectCommand({
              Bucket: bucketName,
              Key: filename,
              Body: Readable.from(file.buffer),
              ContentType: file.mimetype
            })
          )

          await this.mediaModel.create({
            type: file.mimetype.startsWith('video') ? MediaType.VIDEO : MediaType.IMAGE,
            url: filename,
            postId: post._id,
            userId: post.userId
          })
        })
      )
    }

    return post
  }

  async delete(id: string): Promise<deleteResponseDto> {
    const deleted = await this.postModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true })
    if (!deleted) {
      throw new NotFoundException('Post not found')
    }
    const media = await this.mediaModel.find({ postId: id, isDeleted: false }).lean()
    await Promise.all(
      media.map(async (media: any) => {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: media.url
          })
        )
        await this.mediaModel.findByIdAndUpdate(media._id, { isDeleted: true })
      })
    )
    return {
      message: 'Post deleted successfully'
    }
  }

  async toggleBookmark(postId: string, isBookmarked: boolean) {
    const post = await this.postModel.findById(postId)
    if (!post || post.isDeleted) {
      throw new NotFoundException('Post not found')
    }
    post.isBookmarked = isBookmarked
    await post.save()
    return post
  }
}
