import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { GetPokemonCatalogDto } from './dto/get-pokemon-catalog.dto';

type PokeApiListItem = {
  name: string;
  url: string;
};

type PokeApiListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokeApiListItem[];
};

type PokeApiPokemonResponse = {
  id: number;
  name: string;
  weight: number;
  species: {
    name: string;
  };
  sprites: {
    front_default: string | null;
    other?: {
      'official-artwork'?: {
        front_default: string | null;
      };
    };
  };
};

type CatalogItem = {
  id: number;
  name: string;
  speciesName: string;
  weight: number;
  spriteUrl: string | null;
};

type CatalogResponse = {
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
  items: CatalogItem[];
};

const POKE_API_BASE_URL = 'https://pokeapi.co/api/v2';
const REQUEST_TIMEOUT_MS = 8000;
const PAGE_CACHE_TTL_MS = 60_000;
const SEARCH_INDEX_CACHE_TTL_MS = 5 * 60_000;
const MAX_LIMIT = 50;
const SEARCH_LIST_LIMIT = 1500;

@Injectable()
export class PokemonService {
  private readonly pageCache = new Map<
    string,
    { expiresAt: number; value: CatalogResponse }
  >();

  private searchIndexCache: {
    expiresAt: number;
    value: PokeApiListItem[];
  } | null = null;

  async getCatalog(query: GetPokemonCatalogDto): Promise<CatalogResponse> {
    const page = this.parsePositiveInt(query.page, 1);
    const limit = this.parsePositiveInt(query.limit, 20);
    const normalizedLimit = Math.min(limit, MAX_LIMIT);

    if (page < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }

    if (normalizedLimit < 1) {
      throw new BadRequestException('Limit must be greater than 0');
    }

    const normalizedSearch = query.search?.trim().toLowerCase() || '';
    const cacheKey = `${page}:${normalizedLimit}:${normalizedSearch}`;
    const cached = this.pageCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const result = normalizedSearch
      ? await this.getCatalogBySearch(page, normalizedLimit, normalizedSearch)
      : await this.getCatalogPage(page, normalizedLimit);

    this.pageCache.set(cacheKey, {
      value: result,
      expiresAt: Date.now() + PAGE_CACHE_TTL_MS,
    });

    return result;
  }

  private async getCatalogPage(
    page: number,
    limit: number,
  ): Promise<CatalogResponse> {
    const offset = (page - 1) * limit;
    const list = await this.fetchJson<PokeApiListResponse>(
      `${POKE_API_BASE_URL}/pokemon?offset=${offset}&limit=${limit}`,
    );

    const details = await Promise.all(
      list.results.map((item) =>
        this.fetchJson<PokeApiPokemonResponse>(item.url),
      ),
    );

    return {
      page,
      limit,
      total: list.count,
      hasNextPage: offset + limit < list.count,
      items: details.map((pokemon) => this.mapPokemon(pokemon)),
    };
  }

  private async getCatalogBySearch(
    page: number,
    limit: number,
    search: string,
  ): Promise<CatalogResponse> {
    const allItems = await this.getSearchIndex();
    const matched = allItems.filter((item) => item.name.includes(search));
    const total = matched.length;
    const offset = (page - 1) * limit;
    const paginated = matched.slice(offset, offset + limit);

    const details = await Promise.all(
      paginated.map((item) => this.fetchJson<PokeApiPokemonResponse>(item.url)),
    );

    return {
      page,
      limit,
      total,
      hasNextPage: offset + limit < total,
      items: details.map((pokemon) => this.mapPokemon(pokemon)),
    };
  }

  private async getSearchIndex(): Promise<PokeApiListItem[]> {
    if (this.searchIndexCache && this.searchIndexCache.expiresAt > Date.now()) {
      return this.searchIndexCache.value;
    }

    const list = await this.fetchJson<PokeApiListResponse>(
      `${POKE_API_BASE_URL}/pokemon?offset=0&limit=${SEARCH_LIST_LIMIT}`,
    );

    this.searchIndexCache = {
      value: list.results,
      expiresAt: Date.now() + SEARCH_INDEX_CACHE_TTL_MS,
    };

    return list.results;
  }

  private async fetchJson<T>(url: string): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new BadGatewayException(
          `PokeAPI request failed with status ${response.status}`,
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof BadGatewayException) {
        throw error;
      }

      throw new BadGatewayException('Unable to fetch data from PokeAPI');
    } finally {
      clearTimeout(timeout);
    }
  }

  private mapPokemon(pokemon: PokeApiPokemonResponse): CatalogItem {
    return {
      id: pokemon.id,
      name: pokemon.name,
      speciesName: pokemon.species.name,
      weight: pokemon.weight,
      spriteUrl:
        pokemon.sprites.other?.['official-artwork']?.front_default ||
        pokemon.sprites.front_default ||
        null,
    };
  }

  private parsePositiveInt(
    rawValue: string | undefined,
    fallback: number,
  ): number {
    if (!rawValue) {
      return fallback;
    }

    const parsed = Number.parseInt(rawValue, 10);

    if (Number.isNaN(parsed)) {
      return fallback;
    }

    return parsed;
  }
}
