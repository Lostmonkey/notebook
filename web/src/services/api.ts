import ky from 'ky';
import type { AuthResponse, LoginRequest, User, Folder, Note, ApiResponse, TiptapContent } from '../types';

class ApiService {
  private api: typeof ky;

  constructor() {
    this.api = ky.create({
      prefixUrl: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      hooks: {
        beforeRequest: [
          (request) => {
            const token = localStorage.getItem('token');
            if (token) {
              request.headers.set('Authorization', `Bearer ${token}`);
            }
          }
        ],
        afterResponse: [
          (_request, _options, response) => {
            if (response.status === 401) {
              // Clear token and redirect to login
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              // Use setTimeout to avoid interrupting current operations
              setTimeout(() => {
                window.location.reload();
              }, 100);
            }
          }
        ]
      }
    });
  }

  // Auth API
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.api.post('auth/login', { json: data }).json<ApiResponse<AuthResponse>>();
    return response.data!;
  }

  async getProfile(): Promise<User> {
    const response = await this.api.get('auth/profile').json<ApiResponse<User>>();
    return response.data!;
  }

  async logout(): Promise<void> {
    await this.api.post('auth/logout');
  }

  // Folders API
  async getFolders(): Promise<Folder[]> {
    const response = await this.api.get('folders').json<ApiResponse<Folder[]>>();
    return response.data!;
  }

  async createFolder(name: string): Promise<Folder> {
    const response = await this.api.post('folders', { json: { name } }).json<ApiResponse<Folder>>();
    return response.data!;
  }

  async updateFolder(id: string, name: string): Promise<Folder> {
    const response = await this.api.put(`folders/${id}`, { json: { name } }).json<ApiResponse<Folder>>();
    return response.data!;
  }

  async deleteFolder(id: string): Promise<void> {
    await this.api.delete(`folders/${id}`);
  }

  // Notes API
  async getNotesByFolder(folderId: string): Promise<Note[]> {
    const response = await this.api.get(`folders/${folderId}/notes`).json<ApiResponse<Note[]>>();
    return response.data!;
  }

  async getNote(id: string): Promise<Note> {
    const response = await this.api.get(`notes/${id}`).json<ApiResponse<Note>>();
    return response.data!;
  }

  async createNote(folderId: string, title: string, content?: TiptapContent): Promise<Note> {
    const response = await this.api.post(`folders/${folderId}/notes`, {
      json: { title, content }
    }).json<ApiResponse<Note>>();
    return response.data!;
  }

  async updateNote(id: string, title: string, content: TiptapContent): Promise<Note> {
    const response = await this.api.put(`notes/${id}`, {
      json: { title, content }
    }).json<ApiResponse<Note>>();
    return response.data!;
  }

  async deleteNote(id: string): Promise<void> {
    await this.api.delete(`notes/${id}`);
  }

  async moveNote(id: string, targetFolderId: string): Promise<Note> {
    const response = await this.api.put(`notes/${id}/move`, {
      json: { targetFolderId }
    }).json<ApiResponse<Note>>();
    return response.data!;
  }

}

export default new ApiService();