import type { User, Asset, Assessment, Classification, SubClassification, Role } from './definitions';
import { getAuthToken } from './session'; // Import from session.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

// fetchFromApi now accepts the token directly
async function fetchFromApi<T>(endpoint: string, token: string | undefined, options: RequestInit = {}): Promise<T> {
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
export const getAllUsers = async () => {
    const token = await getAuthToken();
    return fetchFromApi<User[]>('/api/users', token);
};
export const createUser = async (data: Partial<User>) => {
    const token = await getAuthToken();
    return fetchFromApi<User>('/api/users', token, { method: 'POST', body: JSON.stringify(data) });
};
export const updateUser = async (id: number, data: Partial<User>) => {
    const token = await getAuthToken();
    return fetchFromApi<User>(`/api/users/${id}`, token, { method: 'PUT', body: JSON.stringify(data) });
};
export const deleteUser = async (id: number) => {
    const token = await getAuthToken();
    return fetchFromApi<void>(`/api/users/${id}`, token, { method: 'DELETE' });
};


// --- Asset Data ---
export const getAllAssets = async () => {
    const token = await getAuthToken();
    return fetchFromApi<Asset[]>('/api/assets', token);
};

export const getAssetById = async (id: number | string) => {
    const token = await getAuthToken();
    // Backend API untuk mengambil detail aset beserta data anaknya
    return fetchFromApi<Asset>(`/api/assets/details/${id}`, token);
};

export const createAsset = async (data: Partial<Asset & { notes?: string }>) => {
    const token = await getAuthToken();
    return fetchFromApi<Asset>('/api/assets', token, { method: 'POST', body: JSON.stringify(data) });
};
export const updateAsset = async (id: number, data: Partial<Asset & { notes?: string }>) => {
    const token = await getAuthToken();
    return fetchFromApi<{ message: string }>(`/api/assets/${id}`, token, { method: 'PUT', body: JSON.stringify(data) });
};
export const deleteAsset = async (id: number) => {
    const token = await getAuthToken();
    return fetchFromApi<void>(`/api/assets/${id}`, token, { method: 'DELETE' });
};


// --- Report Data ---
export const getReportData = async (filters: { categoryId?: string, asset_value?: string }) => {
    const token = await getAuthToken();
    const params = new URLSearchParams(filters as Record<string, string>);
    return fetchFromApi<Asset[]>(`/api/reports?${params.toString()}`, token, { method: 'GET' });
};


// --- Master Data (Roles, Classifications) ---
export const getAllRoles = async () => {
    const token = await getAuthToken();
    return fetchFromApi<Role[]>('/api/assets/roles', token);
};
export const getAllClassifications = async () => {
    const token = await getAuthToken();
    return fetchFromApi<Classification[]>('/api/assets/classifications', token);
};
export const getAllSubClassifications = async () => {
    const token = await getAuthToken();
    return fetchFromApi<SubClassification[]>('/api/assets/sub-classifications', token);
};

