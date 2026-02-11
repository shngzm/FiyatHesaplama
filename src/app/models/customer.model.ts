export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  howDidYouFindUs: string[];
  howDidYouFindUsOther?: string;
  notes?: string;
  orderCount?: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface CreateCustomerInput {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  howDidYouFindUs: string[];
  howDidYouFindUsOther?: string;
  notes?: string;
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {}

export const HOW_DID_YOU_FIND_US_OPTIONS = [
  'Google',
  'Instagram',
  'Facebook',
  'Arkadaş Tavsiyesi',
  'Geçerken Gördüm',
  'Eski Müşteri',
  'Diğer'
] as const;
