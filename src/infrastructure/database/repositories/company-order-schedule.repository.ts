import { Inject, Injectable } from '@nestjs/common';
import { CompanyOrderScheduleEntity } from '../entities/company-order-schedule.entity';
import { CompanyOrderScheduleInterface } from '../../../domain/models/company-order-schedule.model';
import { CompanyOrderScheduleRepositoryInterface } from '../../../domain/repositories/company-order-schedule.repository.interface';
import { DayOfWeek } from '../../../domain/repositories/employee-weekly-orders.repository.interface';

@Injectable()
export class CompanyOrderScheduleRepository
  implements CompanyOrderScheduleRepositoryInterface
{
  constructor(
    @Inject('COMPANY_ORDER_SCHEDULE_ENTITY')
    private readonly scheduleEntity: typeof CompanyOrderScheduleEntity,
  ) {}

  async create(
    schedule: Omit<
      CompanyOrderScheduleInterface,
      'id' | 'createdAt' | 'updatedAt'
    >,
  ): Promise<CompanyOrderScheduleInterface> {
    return await this.scheduleEntity.create(schedule);
  }

  async update(
    id: number,
    schedule: Partial<Omit<CompanyOrderScheduleInterface, 'id'>>,
  ): Promise<CompanyOrderScheduleInterface> {
    const existing = await this.scheduleEntity.findByPk(id);
    return await existing.update(schedule);
  }

  async findByCompany(
    companyId: number,
  ): Promise<CompanyOrderScheduleInterface[]> {
    return await this.scheduleEntity.findAll({
      where: { companyId },
      order: [['dayOfWeek', 'ASC']],
    });
  }

  async findByCompanyAndDay(
    companyId: number,
    dayOfWeek: DayOfWeek,
  ): Promise<CompanyOrderScheduleInterface | null> {
    return await this.scheduleEntity.findOne({
      where: { companyId, dayOfWeek },
    });
  }

  async deleteByCompany(companyId: number): Promise<void> {
    await this.scheduleEntity.destroy({ where: { companyId } });
  }

  async bulkUpsert(
    companyId: number,
    items: Array<
      Pick<CompanyOrderScheduleInterface, 'dayOfWeek' | 'triggerTime'>
    >,
  ): Promise<CompanyOrderScheduleInterface[]> {
    const results: CompanyOrderScheduleInterface[] = [];
    for (const item of items) {
      const existing = await this.findByCompanyAndDay(
        companyId,
        item.dayOfWeek,
      );
      if (existing) {
        const updated = await this.update(existing.id, {
          triggerTime: item.triggerTime,
        });
        results.push(updated);
      } else {
        const created = await this.create({
          companyId,
          dayOfWeek: item.dayOfWeek,
          triggerTime: item.triggerTime,
        });
        results.push(created);
      }
    }
    return results;
  }
}
