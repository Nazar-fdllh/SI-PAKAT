import type { User, Asset, Assessment, Classification, SubClassification, Role, ApiCollectionResponse } from './definitions';
import { getAuthToken } from './session';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

async function fetchFromApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
            // Caching strategy: No cache for dynamic data
            cache: 'no-store',
        });

        if (!response.ok) {
            // Log more details for debugging
            const errorBody = await response.text();
            console.error(`API Error: ${response.status} ${response.statusText} on ${endpoint}. Body: ${errorBody}`);
            throw new Error(`Gagal mengambil data dari server. Status: ${response.status}`);
        }

        if (response.status === 204) { // Handle No Content response
            return null as T;
        }

        return await response.json();
    } catch (error) {
        if (error instanceof TypeError && error.message.includes('fetch failed')) {
             console.error(`Network Error: Could not connect to API at ${API_BASE_URL}${endpoint}. Is the backend server running?`);
             throw new Error('Tidak dapat terhubung ke server backend. Mohon pastikan server sudah berjalan.');
        }
        // Re-throw other errors
        throw error;
    }
}


// --- User Data ---
export const getAllUsers = () => fetchFromApi<User[]>('/api/users');
export const createUser = (data: Partial<User>) => fetchFromApi<User>('/api/users', { method: 'POST', body: JSON.stringify(data) });
export const updateUser = (id: number, data: Partial<User>) => fetchFromApi<User>(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteUser = (id: number) => fetchFromApi<void>(`/api/users/${id}`, { method: 'DELETE' });


// --- Asset Data ---
export const getAllAssets = () => fetchFromApi<Asset[]>('/api/assets');
export const getAssetById = (id: number | string) => fetchFromApi<Asset>(`/api/assets/${id}`);
export const createAsset = (data: Partial<Asset>) => fetchFromApi<Asset>('/api/assets', { method: 'POST', body: JSON.stringify(data) });
export const updateAsset = (id: number, data: Partial<Asset>) => fetchFromApi<{ message: string }>(`/api/assets/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteAsset = (id: number) => fetchFromApi<void>(`/api/assets/${id}`, { method: 'DELETE' });


// --- Assessment Data ---
// Backend does not have assessment endpoints yet, so these will be mocked.
export const getAssessmentsForAsset = (assetId: number) => {
    return Promise.resolve(initialAssessments.filter(a => a.asset_id === assetId));
};
export const createAssessment = (data: Partial<Assessment>) => {
    const newAssessment = {
        ...data,
        id: Date.now(),
        assessment_date: new Date().toISOString(),
        assessed_by_name: 'Pengguna Saat Ini', // Mock
    } as Assessment;
    initialAssessments.push(newAssessment);
    return Promise.resolve(newAssessment);
};


// --- Report Data ---
export const getReportData = (filters: { categoryId?: string, asset_value?: string }) => {
    const params = new URLSearchParams(filters);
    return fetchFromApi<Asset[]>(`/api/reports?${params.toString()}`);
};


// --- Static Data (can be fetched or remain static) ---
export const initialRoles: Role[] = [
  { id: 1, name: 'Administrator', description: 'Memiliki hak akses penuh terhadap sistem dan manajemen pengguna.' },
  { id: 2, name: 'Manajer Aset', description: 'Bertanggung jawab atas pengelolaan data aset dan penilaian keamanan.' },
  { id: 3, name: 'Auditor', description: 'Dapat melihat data aset dan laporan, namun tidak dapat mengubah data.' }
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


// --- Mock Data (will be replaced by API calls if endpoints are created) ---
export const initialAssessments: Assessment[] = [
    { id: 1, asset_id: 24, assessed_by: 2, confidentiality_score: 3, integrity_score: 2, availability_score: 1, authenticity_score: 3, non_repudiation_score: 2, total_score: 11, asset_value: 'Tinggi', assessment_date: '2023-09-18', notes: 'Penilaian awal server utama.', assessed_by_name: 'Budi Manajer' },
    { id: 2, asset_id: 15, assessed_by: 2, confidentiality_score: 1, integrity_score: 1, availability_score: 3, authenticity_score: 1, non_repudiation_score: 1, total_score: 7, asset_value: 'Sedang', assessment_date: '2023-10-20', notes: 'Pemeriksaan rutin cloud storage.', assessed_by_name: 'Budi Manajer' },
    { id: 3, asset_id: 24, assessed_by: 1, confidentiality_score: 3, integrity_score: 3, availability_score: 2, authenticity_score: 3, non_repudiation_score: 2, total_score: 13, asset_value: 'Tinggi', assessment_date: '2024-03-15', notes: 'Penilaian ulang setelah update patch keamanan.', assessed_by_name: 'Admin Utama' },
];
