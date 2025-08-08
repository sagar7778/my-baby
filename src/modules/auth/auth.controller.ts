import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { FacebookAuthGuard } from 'src/modules/auth/facebook-auth.guard'
import { GoogleAuthGuard } from 'src/modules/auth/google-auth.guard'
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard'
import { CreateUserDto, ForgotPasswordDto, LoginDto, UpdatePasswordDto } from 'src/modules/user/dto/create-user.dto'
import { AuthService } from 'src/modules/auth/auth.service'
import { IVerification } from '../user/user.interface'
import { FileInterceptor } from '@nestjs/platform-express'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @UseInterceptors(FileInterceptor('file'))
  async signupUser(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file: Express.Multer.File,
    @Res({ passthrough: true }) res: Response
  ) {
    try {
      const result = await this.authService.signup(createUserDto, file)
      res.cookie('token', result.token, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      return result
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Signup failed'
      })
    }
  }
  @Post('verify-email')
  async verifyEmail(
    @Body('email') email: string,
    @Body('code') code: string,
    @Res({ passthrough: true }) res: Response
  ) {
    try {
      const result = await this.authService.verifyEmail(email, code)
      res.cookie('token', result.token, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      return result
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Verification failed'
      })
    }
  }
  @Post('resend-verification-email')
  async resendVerificationEmail(@Body('email') email: string, @Res() res: Response) {
    try {
      const result = await this.authService.resendVerificationEmail(email)
      return res.status(HttpStatus.OK).json(result)
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Resend verification email failed'
      })
    }
  }

  @Post('login')
  async loginUser(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    try {
      const result = await this.authService.login(loginDto)
      res.cookie('token', result.token, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      return result
    } catch (error) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: error.message || 'Login failed'
      })
    }
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const { token } = req.user
    return res.status(HttpStatus.OK).json({
      message: 'Google login successful',
      token
    })
  }

  // Facebook Authentication
  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  async facebookAuth() {}

  @Get('facebook/redirect')
  @UseGuards(FacebookAuthGuard)
  async facebookAuthRedirect(@Req() req, @Res() res: Response) {
    const { token } = req.user
    return res.status(HttpStatus.OK).json({
      message: 'Facebook login successful',
      token
    })
  }
  @UseGuards(JwtAuthGuard)
  @Post('update-password')
  async updatePassword(@Req() req, @Body() dto: UpdatePasswordDto, @Res() res) {
    try {
      const result = await this.authService.updatePassword(req.user, dto)
      return res.status(HttpStatus.OK).json(result)
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Password update failed'
      })
    }
  }
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Res() res) {
    try {
      const result = await this.authService.forgotPassword(dto)
      return res.status(HttpStatus.OK).json(result)
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Password reset link failed'
      })
    }
  }
  @Post('reset-password')
  async resetPassword(@Body() dto: IVerification & { new_password: string }, @Res({ passthrough: true }) res) {
    try {
      const result = await this.authService.resetPassword(dto)
      res.cookie('token', result.token, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      return result
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Password reset failed'
      })
    }
  }
  // logout api
  @Post('logout')
  async logout(@Req() req, @Res() res: Response) {
    try {
      res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'strict'
      })

      return res.status(HttpStatus.OK).json({
        message: 'Logout successful'
      })
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Logout failed'
      })
    }
  }
}
