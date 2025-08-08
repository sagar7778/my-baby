import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtStrategy } from './jwt.strategy'

import { MongooseModule } from '@nestjs/mongoose'
import { UserSchema } from 'src/schema/user.schema'
import { GoogleStrategy } from 'src/utils/google.strategy'
import { FacebookStrategy } from 'src/utils/facebook.strategy'
import { verificationSchema } from 'src/schema/verfication.schema'
import { notificationSchema } from 'src/schema/notification.schema'

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret',
      signOptions: { expiresIn: '1y' }
    }),
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Verification', schema: verificationSchema },
      { name: 'Notification', schema: notificationSchema }
    ])
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy, FacebookStrategy],
  exports: [AuthService, JwtModule]
})
export class AuthModule {}
