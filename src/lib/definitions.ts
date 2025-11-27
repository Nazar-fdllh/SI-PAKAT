export type Role = {
  id: number;
  name: 'Administrator' | 'Manajer Aset' | 'Auditor';
  description: string;
};

export type User = {
  id: number;
  // `username` is used by the backend API for the user's full name.
  // `name` will be used consistently on the frontend for clarity.
  username?: string; // Make optional as we primarily use 'name' on front-end
  name: string; 
  email: string;
  password?: string;
  role_id?: number; 
  role?: 'Administrator' | 'Manajer Aset' | 'Auditor';
  avatarUrl?: string; 
  last_login_at?: string;
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

// Ini adalah gabungan dari semua kemungkinan field dari tabel aset dan tabel-tabel anaknya.
// Ini membuat pengelolaan data di frontend menjadi lebih mudah.
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
  
  // Assessment fields from the latest assessment
  total_score?: number;
  confidentiality_score?: number;
  integrity_score?: number;
  availability_score?: number;
  authenticity_score?: number;
  non_repudiation_score?: number;

  // Human Resource Details
  personnel_name?: string;
  employee_id_number?: string;
  function?: string;
  unit?: string;
  position?: string;
  contact_info?: string;
  contract_start_date?: string; // string for form compatibility
  contract_end_date?: string; // string for form compatibility

  // Hardware Details
  brand?: string;
  model?: string;
  serial_number?: string;
  specification?: string;
  condition?: string;
  purchase_date?: string; // string for form compatibility
  warranty_end_date?: string; // string for form compatibility

  // Software Details
  application_name?: string;
  vendor?: string;
  status?: string;
  version?: string;
  license_key?: string;
  installation_date?: string; // string for form compatibility
  expiration_date?: string; // string for form compatibility

  // Data/Information Details
  storage_format?: string;
  validity_period?: string; // string for form compatibility
  sensitivity_level?: string;
  storage_location_detail?: string;
  retention_policy?: string;
  last_backup_date?: string; // string for form compatibility

  // Supporting Facility Details
  // 'specification' and 'condition' are already defined above
  last_maintenance_date?: string; // string for form compatibility
  next_maintenance_date?: string; // string for form compatibility
  capacity?: string;
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

export type ActivityLog = {
    id: number;
    user_id: number | null;
    username_snapshot: string | null;
    activity: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
    user: {
        id: number;
        username: string;
        last_login_at: string | null;
    } | null; // User can be null if deleted
};

export type UserRole = Role['name'];
