import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Logger,
} from '@nestjs/common';
import { AppService } from './app.service';
import { DomainRecord } from './dto';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private service: AppService) {}

  @Post()
  async createDomain(@Body() domainDetails: any) {
    this.logger.log('Received POST request - createDomain');
    return this.service.createDomain(domainDetails);
  }

  @Patch('/upsert')
  async createDomainSkipSetup(@Body() domainDetails: DomainRecord) {
    this.logger.log('Received POST request - createDomainSkipSetup');
    return this.service.upsertDomain(domainDetails);
  }

  @Patch('/:domain/renew')
  async renewCertificate(@Param('domain') domain: string) {
    this.logger.log('Received POST request - renewCertificate');
    return this.service.renewCertificate(domain);
  }

  @Patch('/:domain/proxy/:status')
  async updateDomainProxyStatus(
    @Param('domain') domain: string,
    @Param('status') status: string,
  ) {
    this.logger.log('Received PATCH request - updateStatusDomain');
    return this.service.updateDomainProxyStatus(domain, status);
  }

  @Patch('/:domain/certificate/:status')
  async updateDomainCertificateStatus(
    @Param('domain') domain: string,
    @Param('status') status: string,
  ) {
    this.logger.log('Received PATCH request - updateStatusDomain');
    return this.service.updateDomainCertificateStatus(domain, status);
  }

  @Get(':domain')
  async getDomain(@Param('domain') domain: string) {
    this.logger.log(`Received Get request - getDomain - domain: ${domain}`);
    return this.service.getDomain(domain);
  }

  @Get('/user/:userId/domains')
  async getDomainsByUser(@Param('userId') userId: string) {
    this.logger.log(
      `Received Get request - getDomainsByUser - userId: ${userId}`,
    );
    return this.service.getDomainsByUser(userId);
  }

  @Get('/alert/:message')
  async alert(@Param('message') message: string) {
    this.logger.error(`!!! ALERT !!!: ${message}`);
  }

  @Delete(':id')
  async deleteDomain(@Param('domain') domain: string) {
    this.logger.log(
      `Received Delete request - deleteDomain - domain: ${domain}`,
    );
    return this.service.deleteDomain(domain);
  }
}
