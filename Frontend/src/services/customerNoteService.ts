import { apiRequest } from '../config/api'

export interface CustomerNote {
  id: number
  customerId: number
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface CreateCustomerNoteRequest {
  customerId: number
  title: string
  content: string
}

export interface UpdateCustomerNoteRequest {
  id: number
  title: string
  content: string
}

class CustomerNoteService {
  // Müşteri notlarını getir
  async getCustomerNotes(customerId: number): Promise<CustomerNote[]> {
    try {
      const response = await apiRequest(`/CustomerNotes/customer/${customerId}`)
      return response
    } catch (error) {
      console.error('Error fetching customer notes:', error)
      throw error
    }
  }

  // Tüm notları getir
  async getAllNotes(): Promise<CustomerNote[]> {
    try {
      const response = await apiRequest('/CustomerNotes')
      return response
    } catch (error) {
      console.error('Error fetching all notes:', error)
      throw error
    }
  }

  // Not oluştur
  async createNote(noteData: CreateCustomerNoteRequest): Promise<CustomerNote> {
    try {
      const response = await apiRequest('/CustomerNotes', {
        method: 'POST',
        body: JSON.stringify(noteData)
      })
      return response
    } catch (error) {
      console.error('Error creating note:', error)
      throw error
    }
  }

  // Not güncelle
  async updateNote(noteData: UpdateCustomerNoteRequest): Promise<CustomerNote> {
    try {
      const response = await apiRequest(`/CustomerNotes/${noteData.id}`, {
        method: 'PUT',
        body: JSON.stringify(noteData)
      })
      return response
    } catch (error) {
      console.error('Error updating note:', error)
      throw error
    }
  }

  // Not sil
  async deleteNote(id: number): Promise<void> {
    try {
      await apiRequest(`/CustomerNotes/${id}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Error deleting note:', error)
      throw error
    }
  }

  // Not detayını getir
  async getNoteById(id: number): Promise<CustomerNote> {
    try {
      const response = await apiRequest(`/CustomerNotes/${id}`)
      return response
    } catch (error) {
      console.error('Error fetching note:', error)
      throw error
    }
  }
}

export const customerNoteService = new CustomerNoteService()
