import { apiRequest, getApiBaseUrl } from './client'
import type {
  CreatePokemonListPayload,
  ExportedPokemonList,
  PokemonListDetails,
  PokemonListSummary,
} from '../types/pokemon'

export function getPokemonLists(): Promise<PokemonListSummary[]> {
  return apiRequest<PokemonListSummary[]>('/pokemon-lists')
}

export function getPokemonListById(id: string): Promise<PokemonListDetails> {
  return apiRequest<PokemonListDetails>(`/pokemon-lists/${id}`)
}

export function updatePokemonList(id: string, payload: { name?: string }): Promise<PokemonListDetails> {
  return apiRequest<PokemonListDetails>(`/pokemon-lists/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export function deletePokemonList(id: string): Promise<{ id: string; deleted: boolean }> {
  return apiRequest<{ id: string; deleted: boolean }>(`/pokemon-lists/${id}`, {
    method: 'DELETE',
  })
}

export function createPokemonList(payload: CreatePokemonListPayload): Promise<PokemonListDetails> {
  return apiRequest<PokemonListDetails>('/pokemon-lists', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export function importPokemonList(file: File): Promise<PokemonListDetails> {
  const formData = new FormData()
  formData.append('file', file)

  return apiRequest<PokemonListDetails>('/pokemon-lists/import', {
    method: 'POST',
    body: formData,
    headers: {},
  })
}

export async function downloadExportedPokemonList(id: string): Promise<Blob> {
  const response = await fetch(`${getApiBaseUrl()}/pokemon-lists/${id}/export`, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to export list: ${response.status}`)
  }

  return response.blob()
}

export function parseExportedList(payload: string): ExportedPokemonList {
  return JSON.parse(payload) as ExportedPokemonList
}