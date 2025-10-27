export type Role = {
  id: number;
  name: 'Administrator' | 'Manajer Aset' | 'Auditor';
  description: string;
};

export type User = {
  id: number;
  username: string;
  name: string;
  email: string;
  password?: string;
  roleId?: number; // From form
  role?: 'Administrator' | 'Manajer Aset' | 'Auditor'; // From API
  avatarUrl?: string; 
};

export type Classification = {
  id: number;
  name: string;
  description?: string;
};

export type SubClassification = {
  id: number;
  classification_id: number;
  name: string;
  description?: string;
};

export type AssetClassificationValue = 'Tinggi' | 'Sedang' | 'Rendah';

export type Asset = {
  id: number;
  asset_code: string;
  asset_name: string;
  classification_id: number;
  sub_classification_id?: number | null;
  identification_of_existence: string;
  location: string;
  owner: string;
  category_name?: string; 
  asset_value?: AssetClassificationValue | null;
};

export type Assessment = {
  id: number;
  asset_id: number;
  assessed_by: number; // user id
  confidentiality_score: number;
  integrity_score: number;
  availability_score: number;
  authenticity_score: number;
  non_repudiation_score: number;
  total_score: number;
  asset_value: AssetClassificationValue;
  assessment_date: string; // YYYY-MM-DD
  notes?: string;
  assessed_by_name?: string;
};

export type UserRole = Role['name'];

// Helper type for paginated API responses
export type ApiCollectionResponse<T> = {
  data: T[];
  // any other pagination fields
};