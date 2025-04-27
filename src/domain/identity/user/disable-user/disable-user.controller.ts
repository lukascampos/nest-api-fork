import { Controller } from '@nestjs/common';
import { JwtAuthGuard } from '@/domain/auth/jwt-auth.guard';
import { Roles } from '@/domain/auth/roles/roles.decorator';
import { RolesGuard } from '@/domain/auth/roles/roles.guard';

@Controller('disable-user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DisableUserController {

}
export default DisableUserController;
