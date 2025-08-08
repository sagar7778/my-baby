import {
  Controller,
  Post as HttpPost,
  UploadedFile,
  Body,
  UseInterceptors,
  UseGuards,
  Req,
  Get,
  Query,
  Param,
  Delete,
  Put,
  UploadedFiles,
  Patch
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { PostService } from './post.service'
import { postDto } from './dto/post.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { AuthenticatedRequest } from 'src/types/express-request'

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @HttpPost()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async create(@Body() body: postDto, @UploadedFiles() files: Express.Multer.File[], @Req() req: AuthenticatedRequest) {
    const userId = req.user.userId
    if (!userId) {
      throw new Error('User not found')
    }

    const bodyData = { ...body, userId }
    return this.postService.create(bodyData, files)
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-all')
  async getAll(@Req() req: AuthenticatedRequest) {
    const userId = req.user.userId
    if (!userId) {
      throw new Error('User not found')
    }
    const posts = await this.postService.getAll(userId)
    return {
      message: 'All posts fetched successfully',
      data: posts
    }
  }
  @UseGuards(JwtAuthGuard)
  @Get('get-by-id/:id')
  async getById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = req.user.userId
    if (!userId) {
      throw new Error('User not found')
    }
    const post = await this.postService.getById(id)
    return {
      message: 'Post fetched successfully',
      data: post
    }
  }
  @UseGuards(JwtAuthGuard)
  @Put('update/:id')
  @UseInterceptors(FilesInterceptor('files'))
  async update(
    @Req() req: AuthenticatedRequest,
    @Body() body: postDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Param('id') id: string
  ) {
    const userId = req.user.userId
    if (!userId) {
      throw new Error('User not found')
    }
    const existingMedia: string[] = Array.isArray(body.existingMedia)
      ? body.existingMedia
      : body.existingMedia
        ? [body.existingMedia]
        : []
    const post = await this.postService.update(id, { ...body, userId }, files, existingMedia)
    return {
      message: 'Post updated successfully',
      data: post
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async delete(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = req.user.userId
    if (!userId) {
      throw new Error('User not found')
    }
    const post = await this.postService.delete(id)
    return {
      message: 'Post deleted successfully',
      data: post
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/bookmark')
  async updateBookmarkStatus(@Param('id') id: string, @Body('isBookmarked') isBookmarked: boolean) {
    const updatedPost = await this.postService.toggleBookmark(id, isBookmarked)
    return { message: 'Bookmark status updated', post: updatedPost }
  }
}
