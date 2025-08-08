import { Body, Controller, Get, Put, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'

import { AuthenticatedRequest } from 'src/types/express-request'
import { UserService } from './user.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { FileInterceptor } from '@nestjs/platform-express'
import { updateProfile } from './dto/create-user.dto'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: AuthenticatedRequest) {
    return this.userService.getProfile(req.user)
  }

  @UseGuards(JwtAuthGuard)
  @Put('update')
  @UseInterceptors(FileInterceptor('file'))
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() body: updateProfile,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.userService.updateProfile(req.user, body, file)
  }
}
