export type Role = {
  id: number;
  name: 'Administrator' | 'Manajer Aset' | 'Auditor/Pimpinan';
  description: string;
};

export type User = {
  id: number;
  username: string;
  email: string;
  roleId: number;
  name: string; // From the previous structure, let's keep it for display.
  avatarUrl: string; // From the previous structure.
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

export type AssetClassificationValue = 'Tinggi' | 'Sedang' | 'Rendah' | 'Belum Dinilai';

export type Asset = {
  id: number;
  asset_code: string;
  asset_name: string;
  classification_id: number;
  sub_classification_id?: number | null;
  identification_of_existence: string;
  location: string;
  owner: string;
  // These fields are from the old structure but useful for display logic until full backend integration
  category_name?: string; 
  asset_value?: AssetClassificationValue; 
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
  // For display purposes, to show user name
  assessed_by_name?: string;
};

// Merging old UserRole for component compatibility
export type UserRole = Role['name'];
