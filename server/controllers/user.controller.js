import { supabase } from '../config/supabase.js';
import { roleUpdateSchema } from '../validators/lead.validator.js';

// ── GET /users ────────────────────────────────
export const getUsers = async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// ── PATCH /users/:id/role ─────────────────────
export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = roleUpdateSchema.parse(req.body);

    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select('id, full_name, email, role')
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found.' },
      });
    }

    res.json({ success: true, data });
  } catch (err) { next(err); }
};
