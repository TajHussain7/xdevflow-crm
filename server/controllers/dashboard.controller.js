import { supabase } from '../config/supabase.js';

// ── GET /dashboard/stats ──────────────────────
export const getStats = async (_req, res, next) => {
  try {
    // Aggregate counts in a single query
    const { data: leads, error } = await supabase
      .from('leads')
      .select('status, created_at');

    if (error) throw error;

    const now = new Date();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const stats = {
      total_leads: leads.length,
      new_leads: leads.filter(
        (l) => l.status === 'new' && new Date(l.created_at) >= sevenDaysAgo
      ).length,
      qualified_leads: leads.filter((l) => l.status === 'qualified').length,
      closed_leads: leads.filter((l) => ['closed_won', 'closed_lost'].includes(l.status)).length,
      won_leads: leads.filter((l) => l.status === 'closed_won').length,
      lost_leads: leads.filter((l) => l.status === 'closed_lost').length,
    };

    // Pipeline breakdown per status for the funnel chart
    const statusOrder = ['new', 'contacted', 'qualified', 'proposal', 'closed_won', 'closed_lost'];
    const countByStatus = leads.reduce((acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1;
      return acc;
    }, {});

    stats.pipeline_breakdown = statusOrder.map((status) => ({
      status,
      count: countByStatus[status] || 0,
    }));

    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};
