import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private service: AppService) {}

  @Post()
  async createDomain(@Body() domainDetails: any) {
    return this.service.createDomain(domainDetails);
  }

  @Patch('/:domainId/:status')
  async updateStatusDomain(
    @Param('domainId') domainId: number,
    @Param('status') status: string,
  ) {
    return this.service.updateDomainStatus(domainId, status);
  }

  @Get(':id')
  async getDomain(@Param('id') domainId: string) {
    return this.service.getDomain(domainId);
  }

  @Get('/user/:userId/domains')
  async getDomainsByUser(@Param('userId') userId: string) {
    return this.service.getDomainsByUser(userId);
  }

  @Delete(':id')
  async deleteDomain(@Param('id') domainId: string) {
    return this.service.deleteDomain(domainId);
  }
}
