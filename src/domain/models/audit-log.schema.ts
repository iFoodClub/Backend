/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ required: true })
  eventType: string; // 'ORDER_CREATED', 'USER_LOGIN', 'ORDER_CANCELLED', etc

  @Prop({ required: true })
  entityType: string; // 'Order', 'User', 'Restaurant', etc

  @Prop()
  entityId: number; // ID da entidade no PostgreSQL

  @Prop()
  userId: number; // Quem executou a ação

  @Prop({ type: Object })
  metadata: Record<string, any>; // Dados adicionais flexíveis

  @Prop()
  description: string; // Descrição legível do evento

  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Índices para consultas rápidas
AuditLogSchema.index({ eventType: 1, createdAt: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });
AuditLogSchema.index({ userId: 1, createdAt: -1 });
