import AdminActivityLog from '../models/AdminActivityLog.js';

export const logActivity = async ({ adminId, action, targetType, targetId, metadata = {} }) => {
  await AdminActivityLog.create({ adminId, action, targetType, targetId, metadata });
};
