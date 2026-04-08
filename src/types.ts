export type Stage = 'DISCOVERED' | 'CONTACTED' | 'INVITED' | 'IN_REVIEW' | 'CONVERTED' | 'DECLINED';

export interface Brand {
  id: string;
  name: string;
  website?: string;
  category: string;
  stage: Stage;
  score?: number;
  igFollowers?: number;
  isMicro: boolean;
  contactName?: string;
  contactEmail?: string;
  signals?: Record<string, any>;
  notes?: string;
  addedBy: string;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface ActivityLog {
  id: string;
  brandId: string;
  type: 'STAGE_CHANGE' | 'OUTREACH' | 'INVITE_SENT' | 'NOTE_ADDED';
  fromStage?: Stage;
  toStage?: Stage;
  message?: string;
  userId: string;
  userName?: string;
  createdAt: any; // Firestore Timestamp
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'viewer';
  createdAt: any; // Firestore Timestamp
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}
