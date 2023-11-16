import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DomainRecord } from './dto';
import { exec } from 'child_process';

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

  executeScript(domain: string, targetDomain: string): void {
    const scriptPath = process.env.SCRIPT_PATH;

    exec(
      `sudo ${scriptPath} ${domain} ${targetDomain}`,
      (error, stdout, stderr) => {
        if (error) {
          this.logger.error(`Error: ${error}`);
          return;
        }
        this.logger.log(`stdout: ${stdout}`);
        this.logger.error(`stderr: ${stderr}`);
      },
    );

    this.logger.log('Script execution started');
  }

  /*
    Meant to be used by end-users to create new domains.
   */
  async createDomain(domainDetails: DomainRecord): Promise<DomainRecord> {
    this.logger.log('Start new domain setup');
    const { data, error } = await this.supabase
      .from('domains')
      .insert(domainDetails)
      .select();

    if (error) throw new Error(error.message);
    this.logger.log('Finished creating domain in database. ID: ', data[0].id);

    this.executeScript(data[0].domain, data[0].targetDomain);

    return data[0];
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
    const { error } = await this.supabase
      .from('domains')
      .delete()
      .match({ domain: domain });

    if (error) throw new Error(error.message);
    return `Domain ${domain} deleted successfully.`;
  }
}
