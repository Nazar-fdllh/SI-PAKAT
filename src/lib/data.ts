import type { User, Asset, Assessment, Classification, SubClassification, Role, ActivityLog } from './definitions';
import { getAuthToken } from './session';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

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

        if (response.status === 204) {
            return null as T;
        }

        const result = await response.json();

        if (!response.ok) {
            console.error(`API Error: ${response.status} on ${endpoint}. Body:`, result);
            throw new Error(result.message || `Gagal mengambil data dari server. Status: ${response.status}`);
        }

        return result;
    } catch (error) {
        if (error instanceof TypeError && error.message.includes('fetch failed')) {
             console.error(`Network Error: Could not connect to API at ${API_BASE_URL}${endpoint}. Is the backend server running?`);
             throw new Error('Tidak dapat terhubung ke server backend. Mohon pastikan server sudah berjalan.');
        }
        throw error;
    }
}

// --- Auth Data ---
export const forgotPassword = async (data: { email: string }) => {
    return fetchFromApi<{ message: string }>('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify(data) });
};
export const resetPassword = async (data: { token: string, password: string }) => {
    return fetchFromApi<{ message: string }>('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(data) });
};


// --- User Data ---
export const getAllUsers = async () => fetchFromApi<User[]>('/api/users');
export const createUser = async (data: Partial<User>) => fetchFromApi<User>('/api/users', { method: 'POST', body: JSON.stringify(data) });
export const updateUser = async (id: number, data: Partial<User>) => fetchFromApi<User>(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteUser = async (id: number) => fetchFromApi<void>(`/api/users/${id}`, { method: 'DELETE' });


// --- Asset Data ---
export const getAllAssets = async () => fetchFromApi<Asset[]>('/api/assets');
export const getNextAssetCode = async (classificationId: number) => {
    const params = new URLSearchParams({ classificationId: String(classificationId) });
    return fetchFromApi<{ next_code: string }>(`/api/assets/next-code?${params.toString()}`);
};
export const getAssetById = async (id: number | string, getDetails: boolean = false) => {
    const endpoint = getDetails ? `/api/assets/details/${id}` : `/api/assets/${id}`;
    return fetchFromApi<Asset>(endpoint);
};
export const createAsset = async (data: Partial<Asset & { notes?: string }>) => fetchFromApi<Asset>('/api/assets', { method: 'POST', body: JSON.stringify(data) });
export const updateAsset = async (id: number, data: Partial<Asset & { notes?: string }>) => fetchFromApi<{ message: string }>(`/api/assets/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteAsset = async (id: number) => fetchFromApi<void>(`/api/assets/${id}`, { method: 'DELETE' });


// --- Report Data ---
export const getReportData = async (filters: { categoryId?: string, asset_value?: string }) => {
    const params = new URLSearchParams(filters as Record<string, string>);
    return fetchFromApi<Asset[]>(`/api/reports?${params.toString()}`, { method: 'GET' });
};

// --- Activity Log Data ---
type ActivityLogParams = {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    start_date?: string;
    end_date?: string;
};

export const getActivityLogs = async (params: ActivityLogParams = {}): Promise<{ logs: ActivityLog[], total: number }> => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.search) query.append('search', params.search);
    if (params.sort) query.append('sort', params.sort);
    if (params.order) query.append('order', params.order);
    if (params.start_date) query.append('start_date', params.start_date);
    if (params.end_date) query.append('end_date', params.end_date);
    return fetchFromApi<{ logs: ActivityLog[], total: number }>(`/api/activity-logs?${query.toString()}`);
};

export const getActivityLogById = async (id: number): Promise<ActivityLog> => {
  return fetchFromApi<ActivityLog>(`/api/activity-logs/${id}`);
};


// --- Master Data (Roles, Classifications) ---
export const getAllRoles = async () => fetchFromApi<Role[]>('/api/assets/roles');
export const getAllClassifications = async () => fetchFromApi<Classification[]>('/api/assets/classifications');
export const getAllSubClassifications = async () => fetchFromApi<SubClassification[]>('/api/assets/sub-classifications');
