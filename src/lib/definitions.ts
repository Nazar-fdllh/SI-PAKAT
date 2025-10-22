export type UserRole = 'Administrator' | 'Manajer Aset' | 'Auditor/Pimpinan';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
};

export type AssetCategory = 'Perangkat Keras' | 'Perangkat Lunak' | 'Sarana Pendukung' | 'Data & Informasi' | 'SDM & Pihak Ketiga';

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
  classification: AssetClassification;
};

export type Assessment = {
  id: string;
  assetId: string;
  assessedBy: string;
  assessmentDate: string; // YYYY-MM-DD
  confidentiality: number; // 1-3
  integrity: number; // 1-3
  availability: number; // 1-3
  authenticity: number; // 1-3
  nonRepudiation: number; // 1-3
  totalScore: number;
  classification: AssetClassification;
};
