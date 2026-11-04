import type { HealthResponse } from '@muvance/shared';
import { apiClient } from '@/lib/api-client';

export const getHealth = () => apiClient.get<HealthResponse>('/health');
