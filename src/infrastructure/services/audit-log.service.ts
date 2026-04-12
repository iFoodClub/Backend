/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AuditLog,
  AuditLogDocument,
} from '../../domain/models/audit-log.schema';

export interface CreateAuditLogDto {
  eventType: string;
  entityType: string;
  entityId?: number;
  userId?: number;
  metadata?: Record<string, any>;
  description: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectModel(AuditLog.name)
    private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async create(dto: CreateAuditLogDto): Promise<AuditLog> {
    const log = new this.auditLogModel(dto);
    return await log.save();
  }

  async findByEntity(
    entityType: string,
    entityId: number,
  ): Promise<AuditLog[]> {
    return await this.auditLogModel
      .find({ entityType, entityId })
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();
  }

  async findByUser(userId: number, limit = 50): Promise<AuditLog[]> {
    return await this.auditLogModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findByEventType(eventType: string, limit = 100): Promise<AuditLog[]> {
    return await this.auditLogModel
      .find({ eventType })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findRecent(limit = 50): Promise<AuditLog[]> {
    return await this.auditLogModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getStatsByEventType(): Promise<any> {
    return await this.auditLogModel.aggregate([
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
          lastEvent: { $max: '$createdAt' },
        },
      },
      { $sort: { count: -1 } },
    ]);
  }
}
