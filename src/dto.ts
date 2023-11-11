export interface DomainRecord {
  id?: number;
  created_at?: string;
  updated_at?: string;
  domain: string;
  target_domain: string;
  user_id: string;
  expiration?: string;
  status?: string;
}

export const inProgress = 'in-progress';
export const ok = 'ok';
