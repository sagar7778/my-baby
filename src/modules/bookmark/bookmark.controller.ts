import { Controller, Get, Post, Delete, Body, Req, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { BookmarkService } from './bookmark.service'
import { CreateBookmarkDto } from './dto/create-bookmark.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { AuthenticatedRequest } from 'src/types/express-request'

@Controller('bookmark')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    const userId = req.user.userId
    return this.bookmarkService.findAll(userId)
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createBookmarkDto: CreateBookmarkDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user.userId
    return this.bookmarkService.create({ ...createBookmarkDto, userId })
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':postId')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('postId') postId: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.userId
    return this.bookmarkService.delete(userId, postId)
  }
}
