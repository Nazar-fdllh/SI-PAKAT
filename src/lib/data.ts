import type { User, Asset, Assessment } from './definitions';

export const initialUsers: User[] = [
  { id: 'usr_001', name: 'Admin Utama', email: 'admin@sipakat.com', role: 'Administrator', avatarUrl: 'https://i.pravatar.cc/150?u=admin@sipakat.com' },
  { id: 'usr_002', name: 'Budi Manajer', email: 'budi.manajer@sipakat.com', role: 'Manajer Aset', avatarUrl: 'https://i.pravatar.cc/150?u=budi.manajer@sipakat.com' },
  { id: 'usr_003', name: 'Citra Auditor', email: 'citra.auditor@sipakat.com', role: 'Auditor/Pimpinan', avatarUrl: 'https://i.pravatar.cc/150?u=citra.auditor@sipakat.com' },
  { id: 'usr_004', name: 'Doni Staf', email: 'doni.staf@sipakat.com', role: 'Manajer Aset', avatarUrl: 'https://i.pravatar.cc/150?u=doni.staf@sipakat.com' },
];

export const initialAssets: Asset[] = [
  // Perangkat Keras
  { id: 'ast_001', assetCode: 'HW-SRV-001', name: 'Server Database Utama', category: 'Perangkat Keras', specifications: 'Dell PowerEdge R740, 2x Intel Xeon Gold, 256GB RAM, 10TB SSD RAID', location: 'Ruang Server Lt. 1', owner: 'Divisi TI', status: 'Aktif', purchaseDate: '2022-01-15', expiryDate: '2027-01-14', classification: 'Tinggi' },
  { id: 'ast_003', assetCode: 'HW-NB-005', name: 'Laptop Direktur', category: 'Perangkat Keras', specifications: 'Apple MacBook Pro 16" M2 Max, 64GB RAM, 2TB SSD', location: 'Ruang Direktur', owner: 'Direktur Utama', status: 'Aktif', purchaseDate: '2023-03-20', expiryDate: '2028-03-19', classification: 'Sedang' },
  { id: 'ast_007', assetCode: 'HW-PC-015', name: 'PC Desain Grafis', category: 'Perangkat Keras', specifications: 'Custom Build, Ryzen 9, 64GB RAM, RTX 4080', location: 'Ruang Kreatif', owner: 'Divisi Marketing', status: 'Dalam Perbaikan', purchaseDate: '2022-08-10', expiryDate: '2027-08-09', classification: 'Rendah' },
  { id: 'ast_008', assetCode: 'HW-PRN-003', name: 'Printer Jaringan A3', category: 'Perangkat Keras', specifications: 'HP LaserJet Enterprise M712n', location: 'Pantry Lt. 2', owner: 'Umum', status: 'Non-Aktif', purchaseDate: '2019-07-22', expiryDate: '2024-07-21', classification: 'Rendah' },
  { id: 'ast_011', assetCode: 'HW-SWT-004', name: 'Switch Core Jaringan', category: 'Perangkat Keras', specifications: 'Cisco Catalyst 9300 48-port', location: 'Ruang Server Lt. 1', owner: 'Divisi TI', status: 'Aktif', purchaseDate: '2022-02-20', expiryDate: '2027-02-19', classification: 'Tinggi' },
  { id: 'ast_015', assetCode: 'HW-FWL-001', name: 'Firewall Palo Alto', category: 'Perangkat Keras', specifications: 'Palo Alto PA-3220', location: 'Ruang Server Lt. 1', owner: 'Divisi TI', status: 'Aktif', purchaseDate: '2023-05-11', expiryDate: '2028-05-10', classification: 'Tinggi' },
  { id: 'ast_016', assetCode: 'HW-RTR-002', name: 'Router Cisco', category: 'Perangkat Keras', specifications: 'Cisco ISR 4331', location: 'Ruang Server Lt. 1', owner: 'Divisi TI', status: 'Aktif', purchaseDate: '2022-11-30', expiryDate: '2027-11-29', classification: 'Sedang' },

  // Perangkat Lunak
  { id: 'ast_002', assetCode: 'SW-OS-001', name: 'Lisensi Windows Server 2022', category: 'Perangkat Lunak', specifications: 'Datacenter Edition, 16-core license pack', location: 'N/A', owner: 'Divisi TI', status: 'Aktif', purchaseDate: '2022-01-10', expiryDate: '2025-01-09', classification: 'Tinggi' },
  { id: 'ast_006', assetCode: 'SW-AV-001', name: 'Lisensi Antivirus Enterprise', category: 'Perangkat Lunak', specifications: 'Endpoint Security, 100 User License', location: 'N/A', owner: 'Divisi TI', status: 'Aktif', purchaseDate: '2023-06-01', expiryDate: '2024-05-31', classification: 'Sedang' },
  { id: 'ast_012', assetCode: 'SW-DB-002', name: 'Lisensi Oracle Database', category: 'Perangkat Lunak', specifications: 'Enterprise Edition, per-processor license', location: 'N/A', owner: 'Divisi TI', status: 'Aktif', purchaseDate: '2021-05-15', expiryDate: '2026-05-14', classification: 'Belum Dinilai' },
  { id: 'ast_017', assetCode: 'SW-ERP-001', name: 'Sistem ERP (SAP)', category: 'Perangkat Lunak', specifications: 'SAP S/4HANA Finance and Logistics Module', location: 'Cloud/On-premise', owner: 'Divisi Keuangan & Operasional', status: 'Aktif', purchaseDate: '2020-01-20', expiryDate: '2030-01-19', classification: 'Tinggi' },
  { id: 'ast_018', assetCode: 'SW-CRM-001', name: 'Lisensi Salesforce', category: 'Perangkat Lunak', specifications: 'Sales Cloud, Enterprise Edition, 50-user pack', location: 'Cloud', owner: 'Divisi Marketing', status: 'Aktif', purchaseDate: '2023-09-01', expiryDate: '2024-08-31', classification: 'Sedang' },
  
  // Sarana Pendukung
  { id: 'ast_005', assetCode: 'SP-UPS-002', name: 'UPS Ruang Server', category: 'Sarana Pendukung', specifications: 'APC Smart-UPS 3000VA', location: 'Ruang Server Lt. 1', owner: 'Divisi TI', status: 'Aktif', purchaseDate: '2021-11-05', expiryDate: '2024-11-04', classification: 'Sedang' },
  { id: 'ast_010', assetCode: 'SP-AC-010', name: 'AC Ruang Server', category: 'Sarana Pendukung', specifications: 'Daikin 2 PK Precision Air Conditioner', location: 'Ruang Server Lt. 1', owner: 'Divisi TI', status: 'Akan Kadaluarsa', purchaseDate: '2020-09-01', expiryDate: '2025-08-31', classification: 'Sedang' },
  { id: 'ast_019', assetCode: 'SP-GEN-001', name: 'Genset Ruang Server', category: 'Sarana Pendukung', specifications: 'Perkins 20 kVA Silent Type', location: 'Gedung Belakang', owner: 'Divisi Umum', status: 'Aktif', purchaseDate: '2019-05-20', expiryDate: '2029-05-19', classification: 'Tinggi' },
  { id: 'ast_020', assetCode: 'SP-FPS-005', name: 'Fingerprint Scanner Pintu Masuk', category: 'Sarana Pendukung', specifications: 'Solution X105, Kapasitas 10.000 Sidik Jari', location: 'Lobi Utama', owner: 'Divisi HR & Umum', status: 'Aktif', purchaseDate: '2023-02-15', expiryDate: '2028-02-14', classification: 'Rendah' },
  { id: 'ast_021', assetCode: 'SP-CCTV-015', name: 'CCTV Area Kantor', category: 'Sarana Pendukung', specifications: 'Hikvision IP Camera 5MP, 16 channel NVR', location: 'Seluruh Area Kantor', owner: 'Divisi Umum', status: 'Aktif', purchaseDate: '2022-12-01', expiryDate: '2027-11-30', classification: 'Rendah' },

  // Data & Informasi
  { id: 'ast_004', assetCode: 'DT-FIN-001', name: 'Data Laporan Keuangan Tahunan', category: 'Data & Informasi', specifications: 'File-file laporan keuangan dalam format .xlsx dan .pdf', location: 'Server File Internal', owner: 'Divisi Keuangan', status: 'Aktif', purchaseDate: '2024-01-01', expiryDate: '2034-12-31', classification: 'Tinggi' },
  { id: 'ast_009', assetCode: 'DT-HR-002', name: 'Database Karyawan', category: 'Data & Informasi', specifications: 'Informasi personal dan rekam jejak karyawan', location: 'Server HR', owner: 'Divisi HR', status: 'Aktif', purchaseDate: '2020-02-01', expiryDate: '2030-01-31', classification: 'Tinggi' },
  { id: 'ast_022', assetCode: 'DT-CUS-001', name: 'Database Pelanggan', category: 'Data & Informasi', specifications: 'Informasi kontak dan riwayat transaksi pelanggan', location: 'Server CRM', owner: 'Divisi Marketing', status: 'Aktif', purchaseDate: '2018-01-01', expiryDate: '2038-12-31', classification: 'Tinggi' },
  { id: 'ast_023', assetCode: 'DT-RND-003', name: 'Blueprint Produk "Project X"', category: 'Data & Informasi', specifications: 'Dokumen desain, skematik, dan kode sumber purwarupa', location: 'Git Server (Internal)', owner: 'Divisi R&D', status: 'Aktif', purchaseDate: '2023-10-10', expiryDate: '2028-10-09', classification: 'Tinggi' },
  { id: 'ast_024', assetCode: 'DT-LGL-001', name: 'Arsip Kontrak Legal', category: 'Data & Informasi', specifications: 'Salinan digital semua kontrak dengan klien dan vendor', location: 'Server File Legal', owner: 'Divisi Legal', status: 'Aktif', purchaseDate: '2017-01-01', expiryDate: '2037-12-31', classification: 'Sedang' },
  
  // SDM & Pihak Ketiga
  { id: 'ast_013', assetCode: 'HR-CONS-01', name: 'Konsultan Keamanan Eksternal', category: 'SDM & Pihak Ketiga', specifications: 'Jasa konsultasi keamanan siber dari PT. Aman Selalu', location: 'Eksternal', owner: 'Divisi TI', status: 'Aktif', purchaseDate: '2024-01-01', expiryDate: '2024-12-31', classification: 'Sedang' },
  { id: 'ast_014', assetCode: 'HR-DBA-01', name: 'Administrator Database', category: 'SDM & Pihak Ketiga', specifications: 'Karyawan tetap, bertanggung jawab atas semua database', location: 'Internal', owner: 'Divisi TI', status: 'Aktif', purchaseDate: '2021-06-01', expiryDate: '2099-12-31', classification: 'Tinggi' },
  { id: 'ast_025', assetCode: 'HR-DEVT-01', name: 'Tim Pengembang Internal', category: 'SDM & Pihak Ketiga', specifications: '5 orang pengembang aplikasi in-house', location: 'Internal', owner: 'Divisi TI', status: 'Aktif', purchaseDate: '2022-03-01', expiryDate: '2099-12-31', classification: 'Sedang' },
  { id: 'ast_026', assetCode: 'HR-VNDR-01', name: 'Vendor ISP (Internet)', category: 'SDM & Pihak Ketiga', specifications: 'Penyedia layanan internet utama, Biznet 1 Gbps', location: 'Eksternal', owner: 'Divisi TI', status: 'Aktif', purchaseDate: '2022-01-01', expiryDate: '2025-12-31', classification: 'Tinggi' },
  { id: 'ast_027', assetCode: 'HR-CLNG-01', name: 'Jasa Kebersihan', category: 'SDM & Pihak Ketiga', specifications: 'Vendor penyedia jasa kebersihan gedung', location: 'Eksternal', owner: 'Divisi Umum', status: 'Aktif', purchaseDate: '2024-02-01', expiryDate: '2025-01-31', classification: 'Rendah' }
];

export const initialAssessments: Assessment[] = [
    { id: 'asm_001', assetId: 'ast_001', assessedBy: 'Budi Manajer', assessmentDate: '2023-11-10', confidentiality: 3, integrity: 3, availability: 3, authenticity: 3, nonRepudiation: 3, totalScore: 15, classification: 'Tinggi' },
    { id: 'asm_002', assetId: 'ast_002', assessedBy: 'Budi Manajer', assessmentDate: '2023-11-12', confidentiality: 3, integrity: 3, availability: 2, authenticity: 3, nonRepudiation: 2, totalScore: 13, classification: 'Tinggi' },
    { id: 'asm_003', assetId: 'ast_003', assessedBy: 'Doni Staf', assessmentDate: '2023-10-05', confidentiality: 2, integrity: 2, availability: 3, authenticity: 2, nonRepudiation: 1, totalScore: 10, classification: 'Sedang' },
    { id: 'asm_004', assetId: 'ast_004', assessedBy: 'Budi Manajer', assessmentDate: '2024-01-20', confidentiality: 3, integrity: 3, availability: 2, authenticity: 3, nonRepudiation: 3, totalScore: 14, classification: 'Tinggi' },
    { id: 'asm_005', assetId: 'ast_005', assessedBy: 'Doni Staf', assessmentDate: '2023-09-15', confidentiality: 1, integrity: 2, availability: 3, authenticity: 1, nonRepudiation: 1, totalScore: 8, classification: 'Sedang' },
    { id: 'asm_006', assetId: 'ast_009', assessedBy: 'Budi Manajer', assessmentDate: '2023-11-20', confidentiality: 3, integrity: 3, availability: 3, authenticity: 2, nonRepudiation: 2, totalScore: 13, classification: 'Tinggi' },
];
