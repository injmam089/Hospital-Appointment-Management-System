import { apiClient } from './client';
import type { NotificationItem, PageResponse } from '../types';

export const notificationApi = {
  getNotifications: async (params: { unreadOnly?: boolean; page?: number; size?: number } = {}): Promise<PageResponse<NotificationItem>> => {
    const { data } = await apiClient.get<PageResponse<NotificationItem>>('/notifications', { params });
    return data;
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await apiClient.get<{ unreadCount: number }>('/notifications/unread-count');
    return data.unreadCount;
  },

  markAsRead: async (id: number): Promise<NotificationItem> => {
    const { data } = await apiClient.patch<NotificationItem>(`/notifications/${id}/read`);
    return data;
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch('/notifications/read-all');
  },
};
