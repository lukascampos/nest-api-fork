import { Module } from '@nestjs/common';
import { UpdateUserToModeratorModule } from './updateUserTo-moderator/update-user-to-moderator.module';

@Module({
  imports: [UpdateUserToModeratorModule],
})
export class AdminModule {}
