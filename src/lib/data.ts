import type { User, Asset, Assessment, Classification, SubClassification, Role } from './definitions';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

// This is a server-only function to get the raw token
async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = cookies();
  return cookieStore.get('accessToken')?.value;
}


async function fetchFromApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await getAuthToken();
    
    const headers: Record<string, string> = {
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
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`API Error: ${response.status} ${response.statusText} on ${endpoint}. Body: ${errorBody}`);
            
            let errorMessage = `Gagal mengambil data dari server. Status: ${response.status}`;
            try {
                const errorJson = JSON.parse(errorBody);
                if (errorJson.message) {
                    errorMessage = errorJson.message;
                }
            } catch (e) {
                // Not a JSON response
            }
            throw new Error(errorMessage);
        }

        if (response.status === 204) {
            return null as T;
        }

        return await response.json();
    } catch (error) {
        if (error instanceof TypeError && error.message.includes('fetch failed')) {
             console.error(`Network Error: Could not connect to API at ${API_BASE_URL}${endpoint}. Is the backend server running?`);
             throw new Error('Tidak dapat terhubung ke server backend. Mohon pastikan server sudah berjalan.');
        }
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
export const createAsset = (data: Partial<Asset & { notes?: string }>) => fetchFromApi<Asset>('/api/assets', { method: 'POST', body: JSON.stringify(data) });
export const updateAsset = (id: number, data: Partial<Asset & { notes?: string }>) => fetchFromApi<{ message: string }>(`/api/assets/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteAsset = (id: number) => fetchFromApi<void>(`/api/assets/${id}`, { method: 'DELETE' });


// --- Report Data ---
export const getReportData = async (filters: { categoryId?: string, asset_value?: string }) => {
    const params = new URLSearchParams(filters as Record<string, string>);
    return fetchFromApi<Asset[]>(`/api/reports?${params.toString()}`);
};


// --- Master Data (Roles, Classifications) ---
// Assuming these endpoints exist on your backend.
// If they don't, you'll need to create them based on BACKEND_GUIDE.md.
export const getAllRoles = () => fetchFromApi<Role[]>('/api/roles');
export const getAllClassifications = () => fetchFromApi<Classification[]>('/api/classifications');
export const getAllSubClassifications = () => fetchFromApi<SubClassification[]>('/api/sub-classifications');
