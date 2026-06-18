import { supabase } from '../config/supabase.js';

// ── GET /activity/:leadId ─────────────────────
export const getActivityByLead = async (req, res, next) => {
  try {
    const { leadId } = req.params;
    const { limit = 50 } = req.query;

    const { data, error } = await supabase
      .from('activity_log')
      .select('*, user:user_id(id, full_name, email)')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
      .limit(Math.min(100, parseInt(limit)));

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) { next(err); }
};
