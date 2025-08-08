import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { IUser } from './user.interface'
import { getProfileResponse, updateProfile } from './dto/create-user.dto'
import { Readable } from 'stream'
import { v4 as uuid } from 'uuid'
import * as mime from 'mime-types'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3Client } from 'src/utils/minio.client'
@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>) { }
  async getProfile(user: getProfileResponse) {
    const userDoc = await this.userModel.findById(user.userId).select('-password')
    if (!userDoc) throw new Error('User not found')

    const userDetails = userDoc.toObject()

    const command = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: userDetails.profile || ''
    })
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    userDetails.profile = url
    return userDetails
  }

  async updateProfile(user: getProfileResponse, userProfile: updateProfile, file?: Express.Multer.File) {
    const userDetails = await this.userModel.findById(user.userId)
    if (!userDetails) throw new Error('User not found')

    let profile = userDetails.profile

    if (file) {
      const ext = mime.extension(file.mimetype) || 'bin'
      const filename = `${uuid()}.${ext}`

      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: filename,
          Body: Readable.from(file.buffer),
          ContentType: file.mimetype
        })
      )
      profile = filename

      if (userProfile.firstName) userDetails.firstName = userProfile.firstName
      if (userProfile.lastName) userDetails.lastName = userProfile.lastName
      if (userProfile.email) userDetails.email = userProfile.email

      userDetails.profile = profile
      await userDetails.save()

      const updatedUser = userDetails.toObject()
      delete updatedUser.password

      const profileUrl = profile
        ? await getSignedUrl(s3Client, new GetObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: profile
        }), { expiresIn: 3600 })
        : null

      return {
        ...updatedUser,
        profile: profileUrl
      }
    }
  }
}

//  async updateProfile(user: getProfileResponse, userProfile: any, file?: Express.Multer.File) {
//     const userDetails = await this.userModel.findById(user.userId)
//     if (!userDetails) throw new Error('User not found')

//     let profile = userDetails.profile

//     if (file) {
//       const ext = mime.extension(file.mimetype) || 'bin'
//       const filename = `${uuid()}.${ext}`

//       await minioClient.putObject(bucketName, filename, Readable.from(file.buffer), file.size, {
//         'Content-Type': file.mimetype
//       })

//       profile = filename
//     }

//     userDetails.profile = profile
//     await userDetails.save()

//     const updatedUser = userDetails.toObject()
//     delete updatedUser.password

//     const profileUrl = profile ? await minioClient.presignedGetObject(bucketName, profile, 60 * 60) : null

//     return {
//       ...updatedUser,
//       profile: profileUrl
//     }
//   }

// in this i want to a update the full profile like firstName , lastName , email also
