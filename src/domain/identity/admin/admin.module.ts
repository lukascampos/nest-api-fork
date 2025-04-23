import { Module } from '@nestjs/common';
import { UpdateUserToModeratorModule } from './updateUserTo-moderator/updateUserTo-moderator.module.js';

@Module({
  imports: [UpdateUserToModeratorModule],
})
export class AdminModule {}
