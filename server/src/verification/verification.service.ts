import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { VerificationToken } from '../entities/verificationtoken.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from '../mail/mail.service';


@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(VerificationToken)
            private verifRepo: Repository<VerificationToken>,
            private readonly mailService: MailService,
  ) {}

  async generateAndSendToken(user: User): Promise<void> {
    const token = crypto.randomUUID();
    // save token to db
    await this.createToken(user, token);

    await this.mailService.sendVerificationEmail(user.email, token);
  }

  // initial creation of token
  async createToken(user: User, token: string): Promise<void> {
    const verifToken = this.verifRepo.create({
      token,
      user,
      createdAt: new Date(),
    });

    await this.verifRepo.save(verifToken);
  }

  // find token in db (will extract it from url?)
  async findByToken(token: string): Promise<VerificationToken | null> {
    return this.verifRepo.findOne({
      where: {token},
      relations: ['user'],
    });
  }

  // delete token after successful verif
  async deleteToken(token: string): Promise<void> {
    await this.verifRepo.delete({ token });
  }
}
