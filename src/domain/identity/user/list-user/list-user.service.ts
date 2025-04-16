import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';



@Injectable()
export class ListUserService {
  constructor(private prisma:PrismaService){}

  async findAll(){
    return this.prisma.user.findMany()
  }
}
