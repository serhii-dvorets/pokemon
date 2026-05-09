import { apiRequest } from './client'
import type { PokemonCatalogResponse } from '../types/pokemon'

type CatalogQuery = {
  page?: number
  limit?: number
  search?: string
}

export async function getPokemonCatalog(query: CatalogQuery): Promise<PokemonCatalogResponse> {
  const params = new URLSearchParams()

  if (query.page) {
    params.set('page', String(query.page))
  }

  if (query.limit) {
    params.set('limit', String(query.limit))
  }

  if (query.search?.trim()) {
    params.set('search', query.search.trim())
  }

  const queryString = params.toString()

  return apiRequest<PokemonCatalogResponse>(`/pokemon${queryString ? `?${queryString}` : ''}`)
}