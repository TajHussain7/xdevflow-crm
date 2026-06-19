import { supabase } from "../config/supabase.js";
import { logActivity } from "../services/activity.service.js";
import { leadSchema, leadUpdateSchema } from "../validators/lead.validator.js";

// ── GET /leads ────────────────────────────────
export const getLeads = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from("leads")
      .select(
        "*, creator:created_by(id,full_name,email), assignee:assigned_to(id,full_name,email)",
        { count: "exact" },
      );

    if (search?.trim()) {
      query = query.ilike("full_name", `%${search.trim()}%`);
    }
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) throw error;

    res.json({
      success: true,
      data,
      meta: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /leads/:id ────────────────────────────
export const getLead = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("leads")
      .select(
        "*, creator:created_by(id,full_name,email), assignee:assigned_to(id,full_name,email)",
      )
      .eq("id", req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Lead not found." },
      });
    }

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ── POST /leads ───────────────────────────────
export const createLead = async (req, res, next) => {
  try {
    const parsed = leadSchema.parse(req.body);

    const { data, error } = await supabase
      .from("leads")
      .insert({ ...parsed, created_by: req.user.id })
      .select()
      .single();

    if (error) throw error;

    await logActivity(data.id, req.user.id, "created", null);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ── PUT /leads/:id ────────────────────────────
export const updateLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const parsed = leadUpdateSchema.parse(req.body);

    // Fetch before state for diff
    const { data: before, error: fetchErr } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !before) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Lead not found." },
      });
    }

    // If status is being updated, ensure it's a valid transition
    if (parsed.status && parsed.status !== before.status) {
      const validTransitions = {
        new: ["contacted", "closed_lost"],
        contacted: ["qualified", "closed_lost"],
        qualified: ["proposal", "closed_lost"],
        proposal: ["closed_won", "closed_lost"],
        closed_won: [],
        closed_lost: [],
      };

      if (!validTransitions[before.status]?.includes(parsed.status)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_TRANSITION",
            message: `Cannot transition from "${before.status}" to "${parsed.status}".`,
          },
        });
      }
    }

    const { data, error } = await supabase
      .from("leads")
      .update(parsed)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Build changed_fields diff
    const changed = Object.keys(parsed).reduce((acc, key) => {
      if (before[key] !== data[key]) {
        acc[key] = { from: before[key], to: data[key] };
      }
      return acc;
    }, {});

    if (Object.keys(changed).length > 0) {
      await logActivity(id, req.user.id, "updated", changed);
    }

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /leads/:id ─────────────────────────
export const deleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify lead exists first
    const { data: existing, error: fetchErr } = await supabase
      .from("leads")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchErr || !existing) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Lead not found." },
      });
    }

    // Log before deleting (cascade will remove activity_log rows)
    await logActivity(id, req.user.id, "deleted", null);

    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) throw error;

    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
};
