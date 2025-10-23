import type { User, Asset, Assessment, Classification, SubClassification, Role } from './definitions';

export const initialRoles: Role[] = [
  { id: 1, name: 'Administrator', description: 'Memiliki hak akses penuh terhadap sistem dan manajemen pengguna.' },
  { id: 2, name: 'Manajer Aset', description: 'Bertanggung jawab atas pengelolaan data aset dan penilaian keamanan.' },
  { id: 3, name: 'Auditor', description: 'Dapat melihat data aset dan laporan, namun tidak dapat mengubah data.' }
];

export const initialUsers: User[] = [
  { id: 1, name: 'Admin Utama', username: 'admin.utama', email: 'admin@sipakat.com', roleId: 1, avatarUrl: 'https://i.pravatar.cc/150?u=admin@sipakat.com' },
  { id: 2, name: 'Budi Manajer', username: 'budi.manajer', email: 'budi.manajer@sipakat.com', roleId: 2, avatarUrl: 'https://i.pravatar.cc/150?u=budi.manajer@sipakat.com' },
  { id: 3, name: 'Citra Auditor', username: 'citra.auditor', email: 'citra.auditor@sipakat.com', roleId: 3, avatarUrl: 'https://i.pravatar.cc/150?u=citra.auditor@sipakat.com' },
  { id: 4, name: 'Doni Staf', username: 'doni.staf', email: 'doni.staf@sipakat.com', roleId: 2, avatarUrl: 'https://i.pravatar.cc/150?u=doni.staf@sipakat.com' },
];

export const initialClassifications: Classification[] = [
    { id: 1, name: 'SDM & Pihak Ketiga', description: 'Aset TIK berupa Sumber Daya Manusia dan Pihak Ketiga yang memiliki akses atau terlibat dalam TIK.' },
    { id: 2, name: 'Sarana Pendukung', description: 'Aset TIK berupa fasilitas pendukung seperti UPS, Genset, Ruang Server.' },
    { id: 3, name: 'Perangkat Keras', description: 'Aset TIK berupa fisik (hardware) seperti server, komputer, jaringan.' },
    { id: 4, name: 'Perangkat Lunak', description: 'Aset TIK berupa aplikasi, sistem operasi, dan perangkat lunak lainnya.' },
    { id: 5, name: 'Data & Informasi', description: 'Aset TIK berupa data, database, dan informasi digital.' },
];

export const initialSubClassifications: SubClassification[] = [
    { id: 1, classification_id: 1, name: 'Management' },
    { id: 2, classification_id: 1, name: 'Technical' },
    { id: 3, classification_id: 2, name: 'Genset' },
    { id: 4, classification_id: 2, name: 'CCTV' },
    { id: 5, classification_id: 2, name: 'APAR' },
    { id: 6, classification_id: 3, name: 'Server' },
    { id: 7, classification_id: 4, name: 'System Utility' },
    { id: 8, classification_id: 4, name: 'Aplikasi Website' },
    { id: 9, classification_id: 5, name: 'Data Log' },
    { id: 10, classification_id: 5, name: 'Prosedur' },
    { id: 11, classification_id: 5, name: 'Dokumen' },
    { id: 12, classification_id: 5, name: 'Formulir' },
];

export const initialAssets: Asset[] = [
    { id: 1, asset_code: 'PS-001', asset_name: 'Sucilanda Akbar, S.IK.,MM.', classification_id: 1, sub_classification_id: 1, identification_of_existence: 'Personil', location: 'Kantor Pusat', owner: 'Pencanrban dan Keamanan Keamanan Informasi' },
    { id: 2, asset_code: 'PS-002', asset_name: 'Muhammad Bayu Aji Konding Wibowo, S.E', classification_id: 1, sub_classification_id: 1, identification_of_existence: 'Personil', location: 'Kantor Pusat', owner: 'Pencanrban dan Keamanan Keamanan Informasi' },
    { id: 3, asset_code: 'PS-003', asset_name: 'Muhammad Noor Mubarakah, S.H', classification_id: 1, sub_classification_id: 1, identification_of_existence: 'Personil', location: 'Kantor Pusat', owner: 'Pencanrban dan Keamanan Keamanan Informasi' },
    { id: 4, asset_code: 'PS-004', asset_name: 'Abdul Gofur, S.IP', classification_id: 1, sub_classification_id: 1, identification_of_existence: 'Personil', location: 'Kantor Pusat', owner: 'Pencanrban dan Keamanan Keamanan Informasi' },
    { id: 5, asset_code: 'PS-005', asset_name: 'Dian Arifia, S.Kom', classification_id: 1, sub_classification_id: 2, identification_of_existence: 'Personil', location: 'Kantor Pusat', owner: 'Pencanrban dan Keamanan Keamanan Informasi' },
    { id: 6, asset_code: 'PS-006', asset_name: 'Abdul Hafizih, S.Kom', classification_id: 1, sub_classification_id: 2, identification_of_existence: 'Personil', location: 'Kantor Pusat', owner: 'Pencanrban dan Keamanan Keamanan Informasi' },
    { id: 7, asset_code: 'PS-007', asset_name: 'Indah Ratu Ramdhany, S.Kom', classification_id: 1, sub_classification_id: 2, identification_of_existence: 'Personil', location: 'Kantor Pusat', owner: 'Pencanrban dan Keamanan Keamanan Informasi' },
    { id: 8, asset_code: 'SP-003', asset_name: 'Genset', classification_id: 2, sub_classification_id: 3, identification_of_existence: 'Fisik', location: 'Kantor Diskominfo Kalsel', owner: 'Diskominfo' },
    { id: 9, asset_code: 'SP-004', asset_name: 'CCTV', classification_id: 2, sub_classification_id: 4, identification_of_existence: 'Fisik', location: 'Kantor Diskominfo Kalsel', owner: 'Diskominfo' },
    { id: 10, asset_code: 'SP-005', asset_name: 'APAR', classification_id: 2, sub_classification_id: 5, identification_of_existence: 'Fisik', location: 'Pusat Data Diskominfo Kalsel', owner: 'Diskominfo' },
    { id: 15, asset_code: 'PL-001', asset_name: 'Sistem Penyimpanan Cloud Diskominfo', classification_id: 4, sub_classification_id: 7, identification_of_existence: 'Virtual', location: 'Data Center Diskominfo Kalsel', owner: 'Diskominfo' },
    { id: 16, asset_code: 'PL-002', asset_name: 'Sistem Informasi Pengelolaan Data Hewan Ternak', classification_id: 4, sub_classification_id: 8, identification_of_existence: 'Virtual', location: 'Data Center Diskominfo Kalsel', owner: 'Disbunnak' },
    { id: 17, asset_code: 'PL-003', asset_name: 'Website Covid 19', classification_id: 4, sub_classification_id: 8, identification_of_existence: 'Virtual', location: 'Data Center Diskominfo Kalsel', owner: 'Dinkes' },
    { id: 18, asset_code: 'PL-004', asset_name: 'Sistem Whistleblower', classification_id: 4, sub_classification_id: 8, identification_of_existence: 'Virtual', location: 'Data Center Diskominfo Kalsel', owner: 'Inspektorat' },
    { id: 19, asset_code: 'PL-005', asset_name: 'Sistem Penilaian Kinerja', classification_id: 4, sub_classification_id: 8, identification_of_existence: 'Virtual', location: 'Data Center Diskominfo Kalsel', owner: 'Diskominfo' },
    { id: 20, asset_code: 'DI-001', asset_name: 'Data Kepegawaian', classification_id: 5, sub_classification_id: 9, identification_of_existence: 'Digital', location: 'Data Center Diskominfo', owner: 'Badan Kepegawaian' },
    { id: 21, asset_code: 'DI-002', asset_name: 'SOP Pengelolaan Aset', classification_id: 5, sub_classification_id: 10, identification_of_existence: 'Digital', location: 'Sekretariat Diskominfo', owner: 'Diskominfo' },
    { id: 22, asset_code: 'DI-003', asset_name: 'Laporan Penanganan Insiden', classification_id: 5, sub_classification_id: 11, identification_of_existence: 'Digital', location: 'Sekretariat Diskominfo', owner: 'Diskominfo' },
    { id: 23, asset_code: 'DI-004', asset_name: 'Formulir Permintaan Akses', classification_id: 5, sub_classification_id: 12, identification_of_existence: 'Digital', location: 'Data Center Diskominfo', owner: 'Diskominfo' },
    { id: 24, asset_code: 'PK-001', asset_name: 'Server Enttron', classification_id: 3, sub_classification_id: 6, identification_of_existence: 'Fisik', location: 'Data Center Diskominfo Kalsel', owner: 'Diskominfo' },
    { id: 25, asset_code: 'PK-002', asset_name: 'Server IBM', classification_id: 3, sub_classification_id: 6, identification_of_existence: 'Fisik', location: 'Data Center Diskominfo Kalsel', owner: 'Diskominfo' },
    { id: 26, asset_code: 'PK-003', asset_name: 'Server Lenovo 1 (2019)', classification_id: 3, sub_classification_id: 6, identification_of_existence: 'Fisik', location: 'Data Center Diskominfo Kalsel', owner: 'Diskominfo' },
    { id: 27, asset_code: 'PK-004', asset_name: 'Server Lenovo 2 (2019)', classification_id: 3, sub_classification_id: 6, identification_of_existence: 'Fisik', location: 'Data Center Diskominfo Kalsel', owner: 'Diskominfo' },
];

export const initialAssessments: Assessment[] = [
    { id: 1, asset_id: 1, assessed_by: 2, confidentiality_score: 3, integrity_score: 3, availability_score: 3, authenticity_score: 2, non_repudiation_score: 3, total_score: 14, asset_value: 'Tinggi', assessment_date: '2025-09-18', notes: 'Penilaian PS-001' },
    { id: 2, asset_id: 2, assessed_by: 2, confidentiality_score: 3, integrity_score: 3, availability_score: 3, authenticity_score: 2, non_repudiation_score: 3, total_score: 14, asset_value: 'Tinggi', assessment_date: '2025-09-18', notes: 'Penilaian PS-002' },
    { id: 3, asset_id: 3, assessed_by: 2, confidentiality_score: 3, integrity_score: 3, availability_score: 3, authenticity_score: 2, non_repudiation_score: 3, total_score: 14, asset_value: 'Tinggi', assessment_date: '2025-09-18', notes: 'Penilaian PS-003' },
    { id: 4, asset_id: 4, assessed_by: 2, confidentiality_score: 3, integrity_score: 3, availability_score: 3, authenticity_score: 2, non_repudiation_score: 3, total_score: 14, asset_value: 'Tinggi', assessment_date: '2025-09-18', notes: 'Penilaian PS-004' },
    { id: 5, asset_id: 5, assessed_by: 2, confidentiality_score: 2, integrity_score: 3, availability_score: 2, authenticity_score: 2, non_repudiation_score: 3, total_score: 12, asset_value: 'Tinggi', assessment_date: '2025-09-18', notes: 'Penilaian PS-005' },
    { id: 6, asset_id: 6, assessed_by: 2, confidentiality_score: 2, integrity_score: 3, availability_score: 2, authenticity_score: 2, non_repudiation_score: 3, total_score: 12, asset_value: 'Tinggi', assessment_date: '2025-09-18', notes: 'Penilaian PS-006' },
    { id: 7, asset_id: 7, assessed_by: 2, confidentiality_score: 2, integrity_score: 3, availability_score: 2, authenticity_score: 2, non_repudiation_score: 3, total_score: 12, asset_value: 'Tinggi', assessment_date: '2025-09-18', notes: 'Penilaian PS-007' },
    { id: 8, asset_id: 8, assessed_by: 2, confidentiality_score: 2, integrity_score: 1, availability_score: 3, authenticity_score: 1, non_repudiation_score: 3, total_score: 10, asset_value: 'Sedang', assessment_date: '2025-09-18', notes: 'Penilaian SP-003' },
    { id: 9, asset_id: 9, assessed_by: 2, confidentiality_score: 3, integrity_score: 2, availability_score: 3, authenticity_score: 3, non_repudiation_score: 3, total_score: 14, asset_value: 'Tinggi', assessment_date: '2025-09-18', notes: 'Penilaian SP-004' },
    { id: 10, asset_id: 10, assessed_by: 2, confidentiality_score: 1, integrity_score: 2, availability_score: 3, authenticity_score: 1, non_repudiation_score: 1, total_score: 8, asset_value: 'Sedang', assessment_date: '2025-09-18', notes: 'Penilaian SP-005' },
    { id: 15, asset_id: 15, assessed_by: 2, confidentiality_score: 1, integrity_score: 1, availability_score: 3, authenticity_score: 1, non_repudiation_score: 1, total_score: 7, asset_value: 'Sedang', assessment_date: '2025-09-18', notes: 'Penilaian PL-001' },
    { id: 16, asset_id: 16, assessed_by: 2, confidentiality_score: 2, integrity_score: 3, availability_score: 3, authenticity_score: 2, non_repudiation_score: 1, total_score: 11, asset_value: 'Tinggi', assessment_date: '2025-09-18', notes: 'Penilaian PL-002' },
    { id: 17, asset_id: 17, assessed_by: 2, confidentiality_score: 1, integrity_score: 3, availability_score: 2, authenticity_score: 2, non_repudiation_score: 3, total_score: 11, asset_value: 'Tinggi', assessment_date: '2025-09-18', notes: 'Penilaian PL-003' },
    { id: 18, asset_id: 18, assessed_by: 2, confidentiality_score: 3, integrity_score: 3, availability_score: 2, authenticity_score: 2, non_repudiation_score: 2, total_score: 12, asset_value: 'Tinggi', assessment_date: '2025-09-18', notes: 'Penilaian PL-004' },
    { id: 19, asset_id: 19, assessed_by: 2, confidentiality_score: 3, integrity_score: 3, availability_score: 2, authenticity_score: 3, non_repudiation_score: 3, total_score: 14, asset_value: 'Tinggi', assessment_date: '2025-09-18', notes: 'Penilaian PL-005' },
    { id: 20, asset_id: 20, assessed_by: 2, confidentiality_score: 3, integrity_score: 3, availability_score: 3, authenticity_score: 3, non_repudiation_score: 3, total_score: 15, asset_value: 'Tinggi', assessment_date: '2025-09-18', notes: 'Penilaian DI-001' },
    { id: 21, asset_id: 21, assessed_by: 2, confidentiality_score: 1, integrity_score: 1, availability_score: 1, authenticity_score: 1, non_repudiation_score: 1, total_score: 5, asset_value: 'Rendah', assessment_date: '2025-09-18', notes: 'Penilaian DI-002' },
    { id: 22, asset_id: 22, assessed_by: 2, confidentiality_score: 3, integrity_score: 3, availability_score: 3, authenticity_score: 3, non_repudiation_score: 3, total_score: 15, asset_value: 'Tinggi', assessment_date: '2025-09-18', notes: 'Penilaian DI-003' },
    { id: 23, asset_id: 23, assessed_by: 2, confidentiality_score: 2, integrity_score: 2, availability_score: 2, authenticity_score: 2, non_repudiation_score: 2, total_score: 10, asset_value: 'Sedang', assessment_date: '2025-09-18', notes: 'Penilaian DI-004' },
    { id: 24, asset_id: 24, assessed_by: 2, confidentiality_score: 3, integrity_score: 2, availability_score: 1, authenticity_score: 3, non_repudiation_score: 2, total_score: 11, asset_value: 'Tinggi', assessment_date: '2025-09-18', notes: 'Penilaian PK-001' },
    { id: 25, asset_id: 25, assessed_by: 2, confidentiality_score: 2, integrity_score: 2, availability_score: 2, authenticity_score: 2, non_repudiation_score: 1, total_score: 9, asset_value: 'Sedang', assessment_date: '2025-09-18', notes: 'Penilaian PK-002' },
    { id: 26, asset_id: 26, assessed_by: 2, confidentiality_score: 2, integrity_score: 3, availability_score: 3, authenticity_score: 2, non_repudiation_score: 1, total_score: 11, asset_value: 'Tinggi', assessment_date: '2025-09-18', notes: 'Penilaian PK-003' },
    { id: 27, asset_id: 27, assessed_by: 2, confidentiality_score: 2, integrity_score: 3, availability_score: 3, authenticity_score: 2, non_repudiation_score: 1, total_score: 11, asset_value: 'Tinggi', assessment_date: '2025-09-18', notes: 'Penilaian PK-004' },
].map(assessment => {
    const user = initialUsers.find(u => u.id === assessment.assessed_by);
    return {
        ...assessment,
        assessed_by_name: user ? user.name : 'Unknown User'
    };
});


// Helper to enrich asset data with category name and value
export const getEnrichedAssets = (): Asset[] => {
    return initialAssets.map(asset => {
        const classification = initialClassifications.find(c => c.id === asset.classification_id);
        const latestAssessment = initialAssessments
            .filter(a => a.asset_id === asset.id)
            .sort((a, b) => new Date(b.assessment_date).getTime() - new Date(a.assessment_date).getTime())[0];
        
        return {
            ...asset,
            category_name: classification ? classification.name : 'Tidak Diketahui',
            asset_value: latestAssessment ? latestAssessment.asset_value : 'Belum Dinilai'
        };
    });
};
