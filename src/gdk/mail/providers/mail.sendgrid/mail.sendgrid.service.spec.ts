import { Test, TestingModule } from '@nestjs/testing';
import { MailSendgridService } from './mail.sendgrid.service';

describe('MailSendgridService', () => {
  let service: MailSendgridService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailSendgridService],
    }).compile();

    service = module.get<MailSendgridService>(MailSendgridService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
