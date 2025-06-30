'use server';

import { createAuditLog } from '@/services/auditLogService';
import type { AuditLogCreationData, Person, UserRole } from '@/lib/types';

interface LogParams {
    auditor: { id: string; name: string; role: UserRole; bureau: string; };
    impacted: { id:string; name: string };
    operation: 'create' | 'read' | 'update' | 'delete';
    collectionName: string;
    fieldName: string | string[];
    details?: string;
}

export async function logGeneralAudit(params: LogParams): Promise<{ success: boolean; message: string }> {
  try {
    const logData: AuditLogCreationData = {
      userId: params.auditor.id,
      userName: params.auditor.name,
      userRole: params.auditor.role,
      userBureau: params.auditor.bureau,
      collectionName: params.collectionName,
      documentId: params.impacted.id,
      fieldName: params.fieldName,
      operation: params.operation,
      impactedPersonId: params.impacted.id,
      impactedPersonName: params.impacted.name,
      details: params.details || `Operation: ${params.operation} on ${params.collectionName}`,
    };

    await createAuditLog(logData);
    return { success: true, message: 'Audit log created.' };
  } catch (error) {
    console.error('Error creating audit log:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Error: ${errorMessage}` };
  }
}
