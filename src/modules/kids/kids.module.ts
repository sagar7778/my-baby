import { Module } from '@nestjs/common'
import { KidsController } from './kids.controller'
import { KidsService } from './kids.service'
import { MongooseModule } from '@nestjs/mongoose'
import { kidsSchema } from 'src/schema/kids.schema'


@Module({
  imports: [MongooseModule.forFeature([{ name: 'Kids', schema: kidsSchema }])],
  controllers: [KidsController],
  providers: [KidsService],
  exports: [KidsService]
})
export class KidsModule {}
