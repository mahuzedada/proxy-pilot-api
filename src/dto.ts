export interface DomainRecord {
  id?: number;
  created_at?: string;
  updated_at?: string;
  domain: string;
  target_domain: string;
  user_id: string;
  certificate_expiration?: string;
  certificate_status?: string;
  proxy_status?: string;
}

export const inProgress = 'in-progress';
export const ok = 'ok';
