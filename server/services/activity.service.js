import { supabase } from '../config/supabase.js';

/**
 * Inserts a record into activity_log.
 * @param {string} leadId
 * @param {string} userId
 * @param {'created'|'updated'|'deleted'} action
 * @param {object|null} changedFields  e.g. { status: { from: 'new', to: 'contacted' } }
 */
export const logActivity = async (leadId, userId, action, changedFields) => {
  const { error } = await supabase.from('activity_log').insert({
    lead_id: leadId,
    user_id: userId,
    action,
    changed_fields: changedFields ?? null,
  });

  if (error) {
    // Non-fatal — log to console but don't crash the request
    console.error('[activity.service] Failed to log activity:', error.message);
  }
};
