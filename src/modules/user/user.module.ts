import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { MongooseModule } from '@nestjs/mongoose'
import { UserSchema } from 'src/schema/user.schema'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),AuthModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
