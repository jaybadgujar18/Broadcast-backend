import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('signup')
    signup(
        @Body()
        body: {
            email: string;
            whatsappNumber: string;
            userName: string;
            password: string;
        }
    ) {
        return this.authService.signup(body)
    }

    @Post('signin')
    signin(@Body() body: { email: string; password: string }) {
        return this.authService.signin(body.email, body.password)
    }
}
