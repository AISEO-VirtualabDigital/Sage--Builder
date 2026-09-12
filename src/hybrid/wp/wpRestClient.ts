export type WpSyncStatus = 'disconnected' | 'connected' | 'error'

export interface WpSite {
  id: string
  name: string
  url: string
  username: string
  status: WpSyncStatus
}

export interface WpRestConfig {
  siteUrl: string
  username: string
  password: string
}

export class WpRestClient {
  private baseUrl: string
  private authHeader: string

  constructor(config: WpRestConfig) {
    this.baseUrl = config.siteUrl.replace(/\/$/, '')
    this.authHeader = `Basic ${btoa(`${config.username}:${config.password}`)}`
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/users/me`, {
        headers: { Authorization: this.authHeader },
      })
      return response.ok
    } catch {
      return false
    }
  }

  async uploadMedia(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/media`, {
      method: 'POST',
      headers: { Authorization: this.authHeader },
      body: formData,
    })
    if (!response.ok) throw new Error('Media upload failed')
    return response.json()
  }

  async createPost(title: string, content: string) {
    const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content, status: 'draft' }),
    })
    if (!response.ok) throw new Error('Post creation failed')
    return response.json()
  }

  async updatePost(id: number, data: { title?: string; content?: string; meta?: Record<string, string> }) {
    const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/posts/${id}`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...data, status: 'draft' }),
    })
    if (!response.ok) throw new Error('Post update failed')
    return response.json()
  }

  async getPost(id: number) {
    const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/posts/${id}`, {
      headers: { Authorization: this.authHeader },
    })
    if (!response.ok) throw new Error('Get post failed')
    return response.json()
  }
}
