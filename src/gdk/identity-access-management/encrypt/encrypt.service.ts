import { Injectable } from '@nestjs/common';
import { MethodLogger } from '@shared/winston-logger';
import { compare, genSalt, hash } from 'bcrypt';

@Injectable()
export class EncryptService {
  @MethodLogger()
  public async hashPassword(data: string | Buffer): Promise<string> {
    const salt = await genSalt();
    return hash(data, salt);
  }

  @MethodLogger()
  public async comparePassword(
    data: string | Buffer,
    encrypted: string,
  ): Promise<boolean> {
    return await compare(data, encrypted);
  }
}
