import { Module } from '@nestjs/common';
import { UpdateUserToModeratorModule } from './updateUserTo-moderator/updateUserTo-moderator.module';

@Module({
  imports: [UpdateUserToModeratorModule],
})
export class AdminModule {}
