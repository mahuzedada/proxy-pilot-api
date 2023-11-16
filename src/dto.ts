export interface DomainRecord {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
  domain: string;
  targetDomain: string;
  userId: string;
  expiryDate?: string;
  certificateStatus?: string;
  proxyStatus?: string;
}

export const ok = 'ok';
