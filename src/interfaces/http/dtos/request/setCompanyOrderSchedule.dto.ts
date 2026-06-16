import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { DayOfWeek } from '../../../../domain/repositories/employee-weekly-orders.repository.interface';

const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export class CompanyOrderScheduleItemDto {
  @ApiProperty({
    description: 'Dia da semana ao qual o horário se aplica',
    enum: DAYS_OF_WEEK,
    example: 'Monday',
  })
  @IsEnum(DAYS_OF_WEEK as unknown as object, {
    message:
      'dayOfWeek deve ser um dos valores: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday',
  })
  dayOfWeek: DayOfWeek;

  @ApiProperty({
    description: 'Horário de disparo automático do pedido no formato HH:mm',
    example: '12:30',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'triggerTime deve estar no formato HH:mm (00:00 a 23:59)',
  })
  triggerTime: string;
}

export class SetCompanyOrderScheduleDto {
  @ApiProperty({
    description: 'Lista de horários de disparo por dia da semana',
    type: [CompanyOrderScheduleItemDto],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Informe ao menos um horário de disparo' })
  @ValidateNested({ each: true })
  @Type(() => CompanyOrderScheduleItemDto)
  schedule: CompanyOrderScheduleItemDto[];
}
