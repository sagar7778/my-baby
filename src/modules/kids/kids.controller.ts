import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common'
import { KidsService } from './kids.service'
import { KidDto, UpdateKidDto } from './dto/create-kids.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { AuthenticatedRequest } from 'src/types/express-request'
import { FileInterceptor } from '@nestjs/platform-express'

@Controller('kids')
export class KidsController {
  constructor(private readonly kidsService: KidsService) {}
  @UseGuards(JwtAuthGuard)
  @Post('create')
  @UseInterceptors(FileInterceptor('file'))
  async create(@Body() kidDto: KidDto, @Req() req: AuthenticatedRequest, @UploadedFile() file: Express.Multer.File) {
    const data = {
      ...kidDto,
      userId: req.user.userId
    }
    const kid = await this.kidsService.create(data, file)
    return {
      message: 'Kid created successfully',
      data: kid
    }
  }
  @UseGuards(JwtAuthGuard)
  @Get('get-kids')
  async findAll(@Req() req: AuthenticatedRequest) {
    const kids = await this.kidsService.findAll(req.user.userId)
    return {
      message: 'All kids fetched successfully',
      data: kids
    }
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const kid = await this.kidsService.findById(id)
    return {
      message: 'Kid fetched successfully',
      data: kid
    }
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update(@Param('id') id: string, @Body() kidDto: UpdateKidDto, @UploadedFile() file?: Express.Multer.File) {
    const updatedKid = await this.kidsService.update(id, kidDto, file)
    return {
      message: 'Kid updated successfully',
      data: updatedKid
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.kidsService.delete(id)
  }
}
