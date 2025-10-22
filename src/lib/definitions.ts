export type UserRole = 'Administrator' | 'Manajer Aset' | 'Auditor/Pimpinan';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
};

export type AssetCategory = 'Perangkat Keras' | 'Perangkat Lunak' | 'Sarana Pendukung' | 'Data & Informasi';

export type AssetStatus = 'Aktif' | 'Dalam Perbaikan' | 'Non-Aktif' | 'Akan Kadaluarsa';

export type AssetClassification = 'Tinggi' | 'Sedang' | 'Rendah' | 'Belum Dinilai';

export type Asset = {
  id: string;
  assetCode: string;
  name: string;
  category: AssetCategory;
  specifications: string;
  location: string;
  owner: string;
  status: AssetStatus;
  purchaseDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  value: number;
  classification: AssetClassification;
};

export type Assessment = {
  id: string;
  assetId: string;
  assessedBy: string;
  assessmentDate: string; // YYYY-MM-DD
  confidentiality: number; // 1-5
  integrity: number; // 1-5
  availability: number; // 1-5
  authenticity: number; // 1-5
  nonRepudiation: number; // 1-5
  totalScore: number;
  classification: AssetClassification;
};
