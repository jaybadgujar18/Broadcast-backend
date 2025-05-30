import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(
    @Body()
    body: {
      email: string;
      whatsappNumber: string;
      userName: string;
      password: string;
    },
  ) {
    return this.authService.signup(body);
  }

  @Post('signin')
  signin(
    @Body()
    body: {
      email: string;
      password: string;
      otp: string;
    },
  ) {
    return this.authService.signin(body.email, body.password, body.otp);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getUser(@Req() request: any) {
    return this.authService.getUser(request.user._id);
  }
}
