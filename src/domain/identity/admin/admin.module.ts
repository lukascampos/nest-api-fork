import { Module } from '@nestjs/common';
import { UpdateUserToModeratorModule } from './update-user-to-moderator/update-user-to-moderator.module';

@Module({
  imports: [UpdateUserToModeratorModule],
})
export class AdminModule {}
