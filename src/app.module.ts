import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'

import { KidsModule } from './modules/kids/kids.module'
import { AuthModule } from './modules/auth/auth.module'
import { UserModule } from './modules/user/user.module'
import { PostModule } from './modules/post/post.module'
import { JwtModule } from '@nestjs/jwt'
import { BookmarkModule } from './modules/bookmark/boomark.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    AuthModule,
    UserModule,
    KidsModule,
    PostModule,
    BookmarkModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret',
      signOptions: { expiresIn: '1d' }
    })
  ]
})
export class AppModule {}
