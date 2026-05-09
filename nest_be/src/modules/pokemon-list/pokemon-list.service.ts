import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PokemonList,
  PokemonListDocument,
  PokemonListItem,
} from './schemas/pokemon-list.schema';
import { CreatePokemonListDto } from './dto/create-pokemon-list.dto';

const MIN_UNIQUE_SPECIES = 3;
const MAX_TOTAL_WEIGHT = 1300;

type NormalizedListData = {
  name: string;
  items: PokemonListItem[];
  totalWeight: number;
  uniqueSpeciesCount: number;
};

@Injectable()
export class PokemonListService {
  constructor(
    @InjectModel(PokemonList.name)
    private readonly pokemonListModel: Model<PokemonListDocument>,
  ) {}

  async create(data: CreatePokemonListDto) {
    const normalized = this.normalizeAndValidate(data);

    const created = await this.pokemonListModel.create(normalized);

    return this.toDetailedResponse(created.toObject());
  }

  async findAll() {
    const lists = await this.pokemonListModel
      .find()
      .sort({ createdAt: -1 })
      .lean();

    return lists.map((list) => ({
      id: String(list._id),
      name: list.name,
      itemsCount: list.items.length,
      totalWeight: list.totalWeight,
      uniqueSpeciesCount: list.uniqueSpeciesCount,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
    }));
  }

  async findOne(id: string) {
    const list = await this.getListByIdOrFail(id);

    return this.toDetailedResponse(list.toObject());
  }

  async remove(id: string) {
    const list = await this.getListByIdOrFail(id);
    await list.deleteOne();

    return {
      id,
      deleted: true,
    };
  }

  async exportById(id: string) {
    const list = await this.getListByIdOrFail(id);

    return {
      schemaVersion: '1.0',
      exportedAt: new Date().toISOString(),
      list: this.toDetailedResponse(list.toObject()),
    };
  }

  async importFromPayload(payload: unknown) {
    const parsed = this.extractImportPayload(payload);

    return this.create(parsed);
  }

  private extractImportPayload(payload: unknown): CreatePokemonListDto {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('Import file content is invalid');
    }

    const normalizedPayload = payload as Record<string, unknown>;
    const listPayload =
      (normalizedPayload.list as Record<string, unknown>) || normalizedPayload;

    return {
      name: typeof listPayload.name === 'string' ? listPayload.name : undefined,
      items: Array.isArray(listPayload.items)
        ? (listPayload.items as CreatePokemonListDto['items'])
        : [],
    };
  }

  private async getListByIdOrFail(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('List id is invalid');
    }

    const list = await this.pokemonListModel.findById(id);

    if (!list) {
      throw new NotFoundException('Pokemon list not found');
    }

    return list;
  }

  private normalizeAndValidate(data: CreatePokemonListDto): NormalizedListData {
    const normalizedName = data.name?.trim() || 'Untitled list';
    const normalizedItems = data.items.map((item) => ({
      pokemonId: Number(item.pokemonId),
      name: String(item.name).trim().toLowerCase(),
      speciesName: String(item.speciesName).trim().toLowerCase(),
      weight: Number(item.weight),
      spriteUrl: item.spriteUrl || null,
    }));

    const uniqueSpeciesCount = new Set(
      normalizedItems.map((item) => item.speciesName),
    ).size;
    const totalWeight = normalizedItems.reduce(
      (sum, item) => sum + item.weight,
      0,
    );

    const violations: string[] = [];

    if (uniqueSpeciesCount < MIN_UNIQUE_SPECIES) {
      violations.push(
        `At least ${MIN_UNIQUE_SPECIES} Pokemon of different species are required`,
      );
    }

    if (totalWeight > MAX_TOTAL_WEIGHT) {
      violations.push(
        `Total weight must not exceed ${MAX_TOTAL_WEIGHT} hectograms`,
      );
    }

    if (violations.length > 0) {
      throw new BadRequestException({
        statusCode: 400,
        code: 'LIST_RULES_VIOLATION',
        messages: violations,
      });
    }

    return {
      name: normalizedName,
      items: normalizedItems,
      totalWeight,
      uniqueSpeciesCount,
    };
  }

  private toDetailedResponse(list: Record<string, any>) {
    return {
      id: String(list._id),
      name: list.name,
      items: list.items,
      totalWeight: list.totalWeight,
      uniqueSpeciesCount: list.uniqueSpeciesCount,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
    };
  }
}
