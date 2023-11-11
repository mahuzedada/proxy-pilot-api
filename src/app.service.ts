import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DomainRecord, inProgress } from './dto';
import { exec } from 'child_process';

@Injectable()
export class AppService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
    );
  }

  executeScript(domainId: string, domain: string, targetDomain: string): void {
    const scriptPath = './script.sh';

    exec(
      `${scriptPath} ${domainId} ${domain} ${targetDomain}`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
      },
    );

    console.log('Script execution started');
  }
  async createDomain(domainDetails: DomainRecord): Promise<DomainRecord> {
    const { data, error } = await this.supabase
      .from('domains')
      .insert({ ...domainDetails, status: inProgress })
      .select();

    if (error) throw new Error(error.message);
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
