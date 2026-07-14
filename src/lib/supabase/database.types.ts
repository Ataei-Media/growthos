/**
 * Database types.
 *
 * Hand-authored in the exact shape `supabase gen types typescript` produces, so
 * the Supabase clients are fully typed. Covers the tables/functions used through
 * Milestone 3; extended per milestone (or replaced by generated output once the
 * Supabase CLI is wired against the live project).
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type MemberRole = "owner" | "admin" | "manager" | "analyst" | "viewer";
type PlanTier = "free" | "growth" | "agency" | "enterprise";
type InvitationStatus = "pending" | "accepted" | "revoked" | "expired";
type OpportunityStatus = "open" | "in_progress" | "done" | "dismissed";
type OpportunityDifficulty = "easy" | "medium" | "hard";
type OpportunityAction = "fix" | "generate" | "create_flow" | "review";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
        };
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          owner_id: string;
          plan: PlanTier;
          created_at: string;
          updated_at: string;
        };
        Insert: { name: string; slug: string; owner_id: string; plan?: PlanTier };
        Update: { name?: string; slug?: string; plan?: PlanTier };
        Relationships: [];
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: MemberRole;
          created_at: string;
        };
        Insert: {
          organization_id: string;
          user_id: string;
          role?: MemberRole;
        };
        Update: { role?: MemberRole };
        Relationships: [];
      };
      invitations: {
        Row: {
          id: string;
          organization_id: string;
          email: string;
          role: MemberRole;
          token: string;
          status: InvitationStatus;
          invited_by: string | null;
          expires_at: string;
          accepted_at: string | null;
          created_at: string;
        };
        Insert: {
          organization_id: string;
          email: string;
          token: string;
          role?: MemberRole;
          status?: InvitationStatus;
          invited_by?: string | null;
          expires_at?: string;
        };
        Update: { role?: MemberRole; status?: InvitationStatus; accepted_at?: string | null };
        Relationships: [];
      };
      organization_memory: {
        Row: {
          organization_id: string;
          brand_voice: string | null;
          audience: string | null;
          country: string | null;
          industry: string | null;
          average_order_value_cents: number | null;
          currency: string;
          facts: Json;
          updated_at: string;
        };
        Insert: { organization_id: string };
        Update: {
          brand_voice?: string | null;
          audience?: string | null;
          country?: string | null;
          industry?: string | null;
          average_order_value_cents?: number | null;
          currency?: string;
          facts?: Json;
        };
        Relationships: [];
      };
      opportunities: {
        Row: {
          id: string;
          organization_id: string;
          audit_id: string | null;
          finding_id: string | null;
          title: string;
          area: string | null;
          potential_monthly_cents: number | null;
          difficulty: OpportunityDifficulty;
          estimated_minutes: number | null;
          confidence: number | null;
          action: OpportunityAction;
          status: OpportunityStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          organization_id: string;
          title: string;
          audit_id?: string | null;
          finding_id?: string | null;
          area?: string | null;
          potential_monthly_cents?: number | null;
          difficulty?: OpportunityDifficulty;
          estimated_minutes?: number | null;
          confidence?: number | null;
          action?: OpportunityAction;
          status?: OpportunityStatus;
        };
        Update: {
          title?: string;
          status?: OpportunityStatus;
          difficulty?: OpportunityDifficulty;
          confidence?: number | null;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          organization_id: string | null;
          actor_id: string | null;
          action: string;
          target_type: string | null;
          target_id: string | null;
          ip: string | null;
          user_agent: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          action: string;
          organization_id?: string | null;
          actor_id?: string | null;
          target_type?: string | null;
          target_id?: string | null;
          ip?: string | null;
          user_agent?: string | null;
          metadata?: Json;
        };
        Update: { metadata?: Json };
        Relationships: [];
      };
      revenue_reports: {
        Row: {
          id: string;
          url: string;
          domain: string | null;
          brand_name: string | null;
          status: string;
          report: Json | null;
          screenshot_url: string | null;
          overall_score: number | null;
          opportunity_low_cents: number | null;
          opportunity_high_cents: number | null;
          provider: string | null;
          model: string | null;
          prompt_version: string | null;
          error: string | null;
          paid: boolean;
          email: string | null;
          amount_cents: number | null;
          currency: string;
          stripe_session_id: string | null;
          stripe_payment_intent: string | null;
          paid_at: string | null;
          industry: string | null;
          country: string | null;
          average_order_value_cents: number | null;
          main_goal: string | null;
          biggest_challenge: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          url: string;
          status?: string;
          domain?: string | null;
          industry?: string | null;
          country?: string | null;
          average_order_value_cents?: number | null;
          main_goal?: string | null;
          biggest_challenge?: string | null;
        };
        Update: {
          status?: string;
          report?: Json | null;
          domain?: string | null;
          brand_name?: string | null;
          screenshot_url?: string | null;
          overall_score?: number | null;
          opportunity_low_cents?: number | null;
          opportunity_high_cents?: number | null;
          provider?: string | null;
          model?: string | null;
          prompt_version?: string | null;
          error?: string | null;
          paid?: boolean;
          email?: string | null;
          amount_cents?: number | null;
          stripe_session_id?: string | null;
          stripe_payment_intent?: string | null;
          paid_at?: string | null;
          industry?: string | null;
          country?: string | null;
          average_order_value_cents?: number | null;
          main_goal?: string | null;
          biggest_challenge?: string | null;
        };
        Relationships: [];
      };
      ai_generations: {
        Row: {
          id: string;
          report_id: string | null;
          provider: string;
          model: string;
          prompt_version: string | null;
          prompt_tokens: number;
          completion_tokens: number;
          total_tokens: number;
          cost_micros: number;
          duration_ms: number;
          success: boolean;
          error: string | null;
          created_at: string;
        };
        Insert: {
          provider: string;
          model: string;
          report_id?: string | null;
          prompt_version?: string | null;
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
          cost_micros?: number;
          duration_ms?: number;
          success?: boolean;
          error?: string | null;
        };
        Update: { success?: boolean };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_organization: {
        Args: { org_name: string; org_slug: string };
        Returns: Database["public"]["Tables"]["organizations"]["Row"];
      };
      accept_invitation: {
        Args: { invite_token: string };
        Returns: string;
      };
      is_org_member: { Args: { org: string }; Returns: boolean };
      is_org_admin: { Args: { org: string }; Returns: boolean };
    };
    Enums: {
      member_role: MemberRole;
      plan_tier: PlanTier;
      invitation_status: InvitationStatus;
      opportunity_status: OpportunityStatus;
      opportunity_difficulty: OpportunityDifficulty;
      opportunity_action: OpportunityAction;
    };
    CompositeTypes: Record<string, never>;
  };
}
