import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateIndividualOrderDto {
  @ApiProperty({
    description: 'ID do funcionário',
    example: 1,
  })
  @IsNumber()
  employeeId: number;

  @ApiProperty({
    description: 'ID do prato',
    example: 1,
  })
  @IsNumber()
  dishId: number;

  @ApiProperty({
    description: 'ID da empresa',
    example: 1,
  })
  @IsNumber()
  companyId?: number;

  @ApiProperty({
    description: 'ID do restaurante',
    example: 1,
  })
  @IsNumber()
  restaurantId?: number;
}

export class CreateCompanyOrderDto {
  @ApiProperty({
    description: 'ID da empresa',
    example: 1,
  })
  @IsNumber()
  companyId: number;

  @ApiProperty({
    description: 'ID do restaurante',
    example: 1,
  })
  @IsNumber()
  restaurantId: number;

  @ApiProperty({
    description: 'Lista de pedidos individuais dos funcionários',
    type: [CreateIndividualOrderDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIndividualOrderDto)
  individualOrders: CreateIndividualOrderDto[];
} 