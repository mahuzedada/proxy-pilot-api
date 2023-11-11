import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DomainRecord, inProgress } from './dto';
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

  executeScript(domainId: string, domain: string, targetDomain: string): void {
    const scriptPath = process.env.SCRIPT_PATH;

    exec(
      `${scriptPath} ${domainId} ${domain} ${targetDomain}`,
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
  async createDomain(domainDetails: DomainRecord): Promise<DomainRecord> {
    this.logger.log('Start new domain setup');
    const { data, error } = await this.supabase
      .from('domains')
      .insert({ ...domainDetails, status: inProgress })
      .select();

    if (error) throw new Error(error.message);
    this.logger.log('Finished creating domain in database. ID: ', data[0].id);
    this.executeScript(data[0].id, data[0].domain, data[0].target_domain);
    return data[0];
  }

  async updateDomainStatus(
    domainId: number,
    status: string,
  ): Promise<DomainRecord> {
    const { data, error } = await this.supabase
      .from('domains')
      .update({ status: status })
      .eq('id', domainId)
      .select();

    if (error) throw new Error(error.message);
    return data[0];
  }

  async getDomain(domainId: string): Promise<DomainRecord> {
    const { data, error } = await this.supabase
      .from('domains')
      .select('*')
      .eq('id', domainId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getDomainsByUser(userId: string): Promise<DomainRecord[]> {
    const { data, error } = await this.supabase
      .from('domains')
      .select('*')
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteDomain(domainId: string): Promise<string> {
    const { error } = await this.supabase
      .from('domains')
      .delete()
      .match({ id: domainId });

    if (error) throw new Error(error.message);
    return `Domain with ID ${domainId} deleted successfully.`;
  }
}
