import { Module } from '@nestjs/common';
import { Cryptography } from '@/domain/identity/core/utils/encryption/cryptography';
import { BcryptHasher } from './bcrypt-hasher';

@Module({
  providers: [
    { provide: Cryptography, useClass: BcryptHasher },
  ],
  exports: [Cryptography],
})
export class CryptographyModule {}
