import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { JwtStrategyResponseDto } from './dto/auth.dto'
import { Request } from 'express'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          let token = null
          if (req && req.cookies) token = req.cookies['token']
          return token
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default_secret'
    })
  }

  async validate(payload: JwtStrategyResponseDto) {
    return { userId: payload.id, email: payload.email }
  }
}
