import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DomainRecord } from './dto';
import { exec } from 'child_process';

class MissingARecordException extends HttpException {
  constructor(domain: string) {
    super(
      `An A Record was not found for the provided domain: ${domain}`,
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

@Injectable()
export class AppService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(AppService.name);

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
    );
  }

  executeScript(script: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(script, (error, stdout, stderr) => {
        if (error) {
          this.logger.error(`Error: ${error}`);
          reject();
          return;
        }
        this.logger.log(`stdout: ${stdout}`);
        this.logger.error(`stderr: ${stderr}`);
        resolve();
      });

      this.logger.log('Script execution started');
    });
  }

  async checkARecord(domain: string): Promise<boolean> {
    try {
      await this.executeScript(
        `sudo ${process.env.CHECK_A_RECORD_SCRIPT_PATH} ${domain}`,
      );
      return true;
    } catch (e) {
      return false;
    }
  }
  /*
    Meant to be used by end-users to create new domains.
   */
  async createDomain(domainDetails: DomainRecord): Promise<DomainRecord> {
    if (!(await this.checkARecord(domainDetails.domain))) {
      throw new MissingARecordException(domainDetails.domain);
    }
    this.logger.log('Start new domain setup');
    const { data, error } = await this.supabase
      .from('domains')
      .insert(domainDetails)
      .select();

    if (error) throw new Error(error.message);
    this.logger.log('Finished creating domain in database. ID: ', data[0].id);

    try {
      await this.executeScript(
        `sudo ${process.env.NEW_DOMAIN_SETUP_SCRIPT_PATH} ${data[0].domain} ${data[0].targetDomain}`,
      );
    } catch (e) {
      this.logger.log(e);
    }

    try {
      await this.executeScript(
        `sudo ${process.env.UPDATE_CERTIFICATES_STATUS_SCRIPT_PATH}`,
      );
    } catch (e) {
      this.logger.log(e);
    }

    return this.getDomain(domainDetails.domain);
  }

  /*
    Meant to be used by system to update or insert existing domains.
   */
  async upsertDomain(domainDetails: DomainRecord): Promise<DomainRecord> {
    this.logger.log('Start new domain setup');
    const { data, error } = await this.supabase
      .from('domains')
      .upsert(domainDetails)
      .select();

    if (error) throw new Error(error.message);

    this.logger.log('Finished upsert domain in database: ', data[0].domain);

    return data[0];
  }

  async updateDomainProxyStatus(
    domain: string,
    status: string,
  ): Promise<DomainRecord> {
    const { data, error } = await this.supabase
      .from('domains')
      .update({ proxyStatus: status })
      .eq('domain', domain)
      .select();

    if (error) throw new Error(error.message);
    return data[0];
  }

  async updateDomainCertificateStatus(
    domain: string,
    status: string,
  ): Promise<DomainRecord> {
    const { data, error } = await this.supabase
      .from('domains')
      .update({ certificateStatus: status })
      .eq('domain', domain)
      .select();

    if (error) throw new Error(error.message);
    return data[0];
  }

  async getDomain(domain: string): Promise<DomainRecord> {
    const { data, error } = await this.supabase
      .from('domains')
      .select('*')
      .eq('domain', domain)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getDomainsByUser(userId: string): Promise<DomainRecord[]> {
    const { data, error } = await this.supabase
      .from('domains')
      .select('*')
      .eq('userId', userId);

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteDomain(domain: string): Promise<string> {
    await this.executeScript(
      `sudo ${process.env.REVOKE_CERTIFICATE_SCRIPT_PATH} ${domain}`,
    );

    const { error } = await this.supabase
      .from('domains')
      .delete()
      .match({ domain: domain });

    if (error) throw new Error(error.message);
    return `Domain ${domain} deleted successfully.`;
  }
}
