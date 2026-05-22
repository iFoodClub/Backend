import { ApiProperty } from '@nestjs/swagger';
import { DayOfWeek } from '../../../../domain/repositories/employee-weekly-orders.repository.interface';

export class CompanyOrderScheduleItemResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  companyId: number;

  @ApiProperty({ example: 'Monday' })
  dayOfWeek: DayOfWeek;

  @ApiProperty({ example: '12:30' })
  triggerTime: string;
}

export class RestaurantOperatingHoursDto {
  @ApiProperty({ example: 1 })
  restaurantId: number;

  @ApiProperty({
    example: '08:00',
    description: 'Horário de abertura do restaurante (HH:mm)',
    nullable: true,
  })
  openingTime: string | null;

  @ApiProperty({
    example: '18:00',
    description: 'Horário de fechamento do restaurante (HH:mm)',
    nullable: true,
  })
  closingTime: string | null;
}

export class CompanyOrderScheduleResponseDto {
  @ApiProperty({ example: 1 })
  companyId: number;

  @ApiProperty({
    type: RestaurantOperatingHoursDto,
    nullable: true,
    description:
      'Horários de funcionamento do restaurante associado à empresa (quando houver)',
  })
  restaurantOperatingHours: RestaurantOperatingHoursDto | null;

  @ApiProperty({ type: [CompanyOrderScheduleItemResponseDto] })
  schedule: CompanyOrderScheduleItemResponseDto[];
}
