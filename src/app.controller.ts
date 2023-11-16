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

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private service: AppService) {}

  @Post()
  async createDomain(@Body() domainDetails: any) {
    this.logger.log('Received POST request - createDomain');
    return this.service.createDomain(domainDetails);
  }

  @Post('/skip-setup')
  async createDomainSkipSetup(@Body() domainDetails: any) {
    this.logger.log('Received POST request - createDomainSkipSetup');
    return this.service.createDomain(domainDetails, true);
  }

  @Patch('/:domainId/proxy/:status')
  async updateDomainProxyStatus(
    @Param('domainId') domainId: number,
    @Param('status') status: string,
  ) {
    this.logger.log('Received PATCH request - updateStatusDomain');
    return this.service.updateDomainProxyStatus(domainId, status);
  }

  @Patch('/:domainId/certificate/:status')
  async updateDomainCertificateStatus(
    @Param('domainId') domainId: number,
    @Param('status') status: string,
  ) {
    this.logger.log('Received PATCH request - updateStatusDomain');
    return this.service.updateDomainCertificateStatus(domainId, status);
  }

  @Get(':id')
  async getDomain(@Param('id') domainId: string) {
    this.logger.log(`Received Get request - getDomain - domainId: ${domainId}`);
    return this.service.getDomain(domainId);
  }

  @Get('/user/:userId/domains')
  async getDomainsByUser(@Param('userId') userId: string) {
    this.logger.log(
      `Received Get request - getDomainsByUser - userId: ${userId}`,
    );
    return this.service.getDomainsByUser(userId);
  }

  @Delete(':id')
  async deleteDomain(@Param('id') domainId: string) {
    this.logger.log(
      `Received Delete request - deleteDomain - domainId: ${domainId}`,
    );
    return this.service.deleteDomain(domainId);
  }
}
