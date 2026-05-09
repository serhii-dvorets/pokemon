import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PokemonListDocument = HydratedDocument<PokemonList>;

@Schema({ _id: false })
export class PokemonListItem {
  @Prop({ required: true, min: 1 })
  pokemonId: number;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  speciesName: string;

  @Prop({ required: true, min: 1 })
  weight: number;

  @Prop({ default: null })
  spriteUrl: string | null;
}

export const PokemonListItemSchema =
  SchemaFactory.createForClass(PokemonListItem);

@Schema({ timestamps: true, versionKey: false })
export class PokemonList {
  @Prop({ default: 'Untitled list', trim: true })
  name: string;

  @Prop({ type: [PokemonListItemSchema], required: true })
  items: PokemonListItem[];

  @Prop({ required: true, min: 0 })
  totalWeight: number;

  @Prop({ required: true, min: 0 })
  uniqueSpeciesCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export const PokemonListSchema = SchemaFactory.createForClass(PokemonList);
