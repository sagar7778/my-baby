import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import * as nodemailer from 'nodemailer'
import { v4 as uuid } from 'uuid'
import * as mime from 'mime-types'

import { CreateUserDto, ForgotPasswordDto, LoginDto, UpdatePasswordDto } from 'src/modules/user/dto/create-user.dto'
import {
  ForgotPasswordResponseDto,
  LoginResponseDto,
  OAuthLoginDto,
  OAuthLoginResponseDto,
  ResetPasswordResponseDto,
  SignupResponseDto,
  UpdatePasswordResponseDto
} from 'src/modules/auth/dto/auth.dto'
import { IUser, IVerification } from 'src/modules/user/user.interface'
import { INotification } from 'src/modules/notification/notification.interface'
import { bucketName, s3Client } from 'src/utils/minio.client'
import { PutObjectCommand } from '@aws-sdk/client-s3'

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<IUser>,
    @InjectModel('Verification') private readonly verificationModel: Model<IVerification>,
    @InjectModel('Notification') private readonly notificationModel: Model<INotification>,
    private readonly jwtService: JwtService
  ) { }

  async signup(createUserDto: CreateUserDto, file?: Express.Multer.File): Promise<SignupResponseDto> {
    const { email, password, firstName, lastName } = createUserDto

    const existingUser = await this.userModel.findOne({ email })
    if (existingUser) throw new UnauthorizedException('Email already in use')

    const hashedPassword = await bcrypt.hash(password, 10)

    let profileUrl = ''
    if (file) {
      const ext = mime.extension(file.mimetype) || 'bin'
      const filename = `${uuid()}.${ext}`


      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: filename,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
      )

      profileUrl = filename
    }

    const user = await this.userModel.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      profile: profileUrl
    })

    const findNotification = await this.notificationModel.findOne({ userId: user._id })
    if (!findNotification) {
      await this.notificationModel.create({
        userId: user._id,
        daily: false,
        weekly: false,
        birthday: false,
        milestones: false
      })
    }

    const verification = await this.verificationModel.create({
      email,
      code: Math.floor(100000 + Math.random() * 900000).toString(),
      expiryAt: new Date(Date.now() + 60 * 60 * 1000)
    })
    await this.sendVerificationEmail(email, verification.code)

    const token = await this.generateToken(user)

    return {
      message: 'User created successfully',
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: ''
      },
      token
    }
  }

  public async sendVerificationEmail(email: string, code: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your email',
      text: `Your verification code is ${code}`
    }

    await transporter.sendMail(mailOptions)
  }

  async resendVerificationEmail(email: string) {
    const user = await this.userModel.findOne({ email })
    if (!user) throw new NotFoundException('User not found')

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    await this.verificationModel.deleteMany({ email: user.email })

    await this.verificationModel.create({
      email,
      code,
      expiryAt: Date.now() + 3600000
    })

    await this.sendVerificationEmail(email, code)

    return { message: 'Verification code sent successfully' }
  }

  async verifyEmail(email: string, code: string): Promise<SignupResponseDto> {
    const verification = await this.verificationModel.findOne({ email })
    if (!verification) throw new NotFoundException('No verification found for this email')
    if (verification.code !== code.toString()) {
      throw new UnauthorizedException('Invalid verification code')
    }
    if (verification.expiryAt < Date.now()) throw new UnauthorizedException('Verification code has expired')

    const user = await this.userModel.findOne({ email })
    if (!user) throw new NotFoundException('User not found')

    user.isEmailVerified = true
    await user.save()
    await this.verificationModel.deleteOne({ code })

    const token = await this.generateToken(user)

    return {
      message: 'Email verified successfully',
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: ''
      },
      token
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto
    const user = await this.userModel.findOne({ email })
    if (!user) throw new NotFoundException('User not found')

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials')

    const token = await this.generateToken(user)
    return { token, user }
  }

  async generateToken(user: any) {
    const payload = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    }
    return this.jwtService.sign(payload, { secret: process.env.JWT_SECRET })
  }

  async validateOAuthLogin(dto: OAuthLoginDto): Promise<OAuthLoginResponseDto> {
    const { email, firstName, lastName, provider, providerId } = dto

    let user = await this.userModel.findOne({ email })
    if (!user) {
      user = new this.userModel({
        email,
        firstName,
        lastName,
        password: null,
        provider,
        providerId
      })

      try {
        await user.save()
      } catch (err) {
        console.error('Error saving user:', err)
      }
    }

    const token = await this.generateToken(user)

    return {
      token,
      user: {
        _id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        provider: user.provider,
        providerId: user.providerId
      }
    }
  }

  async updatePassword(user: { userId: string }, dto: UpdatePasswordDto): Promise<UpdatePasswordResponseDto> {
    const { current_password, new_password } = dto

    const existingUser = await this.userModel.findById(user.userId)
    if (!existingUser) throw new NotFoundException('User not found')

    const isPasswordValid = await bcrypt.compare(current_password, existingUser.password)
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials')
    if (current_password === new_password) throw new UnauthorizedException('New password should be different')

    const hashedPassword = await bcrypt.hash(new_password, 10)
    existingUser.password = hashedPassword
    await existingUser.save()

    return { message: 'Password updated successfully' }
  }

  async forgotPassword(data: ForgotPasswordDto): Promise<ForgotPasswordResponseDto> {
    const user = await this.userModel.findOne({ email: data.email })
    if (!user) throw new NotFoundException('User not found')

    await this.verificationModel.deleteMany({ email: user.email })

    const verificationCode = await this.verificationModel.create({
      email: user.email,
      code: Math.floor(100000 + Math.random() * 900000).toString(),
      expiryAt: Date.now() + 3600000
    })

    await this.sendVerificationEmail(user.email, verificationCode.code)

    return {
      message: 'Verification code sent successfully',
      verification: {
        email: verificationCode.email,
        code: verificationCode.code,
        expiryAt: verificationCode.expiryAt
      }
    }
  }

  async resetPassword(data: IVerification & { new_password: string }): Promise<ResetPasswordResponseDto> {
    const verification = await this.verificationModel.findOne({ email: data.email, code: data.code })
    if (!verification) throw new NotFoundException('Verification entry not found')
    if (verification.expiryAt < Date.now()) throw new UnauthorizedException('Verification code expired')
    if (verification.code !== data.code) throw new UnauthorizedException('Invalid verification code')

    const user = await this.userModel.findOne({ email: data.email })
    if (!user) throw new NotFoundException('User not found')

    const hashedPassword = await bcrypt.hash(data.new_password, 10)
    user.password = hashedPassword
    await user.save()

    await this.verificationModel.deleteOne({ email: data.email })

    const token = await this.generateToken(user)

    return {
      message: 'Password reset successfully',
      token,
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        password: ''
      }
    }
  }
  async logoutFromAlldevice() {
    const token = await this.generateToken(null)
    return token
  }
}
