export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  method: string;
  path: string;
  ip: string;
  userAgent: string;
  statusCode: number;
  resourceId?: string;
  requestData?: any;
  timestamp: string;
}

export interface ActivityLogStatistics {
  total: number;
  byAction: Record<string, number>;
  byUser: Record<string, number>;
  byDate: Record<string, number>;
}
