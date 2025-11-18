/**
 * Client Store - Manages client state and operations
 * Handles API calls for client CRUD operations
 */
import { create } from 'zustand';
import apiClient from '@/lib/api/client';
import type { Client } from '@/types';

interface CreateClientData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  website?: string;
  contact_person?: string;
  contact_position?: string;
  notes?: string;
}

interface UpdateClientData extends Partial<CreateClientData> {
  is_active?: boolean;
}

interface ClientStore {
  // State
  clients: Client[];
  currentClient: Client | null;
  isLoading: boolean;
  error: string | null;

  // Operations
  fetchClients: () => Promise<void>;
  fetchClient: (id: string) => Promise<void>;
  createClient: (data: CreateClientData) => Promise<Client | null>;
  updateClient: (id: string, data: UpdateClientData) => Promise<Client | null>;
  deleteClient: (id: string) => Promise<boolean>;
  clearError: () => void;
  reset: () => void;
}

export const useClientStore = create<ClientStore>((set, get) => ({
  // Initial state
  clients: [],
  currentClient: null,
  isLoading: false,
  error: null,

  // Fetch all clients
  fetchClients: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Client[]>('/clients/');
      set({ clients: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch clients',
        isLoading: false,
      });
    }
  },

  // Fetch single client
  fetchClient: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Client>(`/clients/${id}/`);
      set({ currentClient: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch client',
        isLoading: false,
      });
    }
  },

  // Create new client
  createClient: async (data: CreateClientData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<Client>('/clients/', data);
      const newClient = response.data;

      // Add to clients list
      set((state) => ({
        clients: [...state.clients, newClient],
        isLoading: false,
      }));

      return newClient;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to create client',
        isLoading: false,
      });
      return null;
    }
  },

  // Update existing client
  updateClient: async (id: string, data: UpdateClientData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch<Client>(`/clients/${id}/`, data);
      const updatedClient = response.data;

      // Update in clients list
      set((state) => ({
        clients: state.clients.map((client) => (client.id === id ? updatedClient : client)),
        currentClient: state.currentClient?.id === id ? updatedClient : state.currentClient,
        isLoading: false,
      }));

      return updatedClient;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to update client',
        isLoading: false,
      });
      return null;
    }
  },

  // Delete client
  deleteClient: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/clients/${id}/`);

      // Remove from clients list
      set((state) => ({
        clients: state.clients.filter((client) => client.id !== id),
        currentClient: state.currentClient?.id === id ? null : state.currentClient,
        isLoading: false,
      }));

      return true;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to delete client',
        isLoading: false,
      });
      return false;
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Reset store
  reset: () => {
    set({
      clients: [],
      currentClient: null,
      isLoading: false,
      error: null,
    });
  },
}));
