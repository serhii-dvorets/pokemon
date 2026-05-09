import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePokemonListDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}