export type PokemonCatalogItem = {
  id: number
  name: string
  speciesName: string
  weight: number
  spriteUrl: string | null
}

export type PokemonCatalogResponse = {
  page: number
  limit: number
  total: number
  hasNextPage: boolean
  items: PokemonCatalogItem[]
}

export type PokemonListItem = {
  pokemonId: number
  name: string
  speciesName: string
  weight: number
  spriteUrl?: string | null
}

export type PokemonListSummary = {
  id: string
  name: string
  itemsCount: number
  totalWeight: number
  uniqueSpeciesCount: number
  createdAt: string
  updatedAt: string
}

export type PokemonListDetails = {
  id: string
  name: string
  items: PokemonListItem[]
  totalWeight: number
  uniqueSpeciesCount: number
  createdAt: string
  updatedAt: string
}

export type ExportedPokemonList = {
  schemaVersion: string
  exportedAt: string
  list: PokemonListDetails
}

export type CreatePokemonListPayload = {
  name?: string
  items: PokemonListItem[]
}

export type ApiErrorPayload = {
  statusCode?: number
  code?: string
  message?: string | string[]
  messages?: string[]
}