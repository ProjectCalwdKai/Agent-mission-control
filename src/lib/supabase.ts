import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bxnunccjqnuobinhnyml.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4bnVuY2NqcW51b2JpbmhueW1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMzYzMDEsImV4cCI6MjA4OTYxMjMwMX0.anKYAOSnXgPOs95kCifrlaOmSPvANhCPDUJWLYXluMw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string;
          name: string;
          model: string;
          role: string;
          availability: string;
          current_task: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          model: string;
          role: string;
          availability?: string;
          current_task?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          model?: string;
          role?: string;
          availability?: string;
          current_task?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          prompt: string | null;
          details: string | null;
          category: string;
          priority: string;
          status: string;
          assigned_agent_id: string | null;
          requires_approval: boolean;
          has_delegation: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          prompt?: string | null;
          details?: string | null;
          category: string;
          priority?: string;
          status?: string;
          assigned_agent_id?: string | null;
          requires_approval?: boolean;
          has_delegation?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          prompt?: string | null;
          details?: string | null;
          category?: string;
          priority?: string;
          status?: string;
          assigned_agent_id?: string | null;
          requires_approval?: boolean;
          has_delegation?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      approvals: {
        Row: {
          id: string;
          task_id: string | null;
          requested_by: string | null;
          status: string;
          requested_at: string;
          resolved_at: string | null;
          resolved_by: string | null;
        };
        Insert: {
          id?: string;
          task_id?: string | null;
          requested_by?: string | null;
          status?: string;
          requested_at?: string;
          resolved_at?: string | null;
          resolved_by?: string | null;
        };
        Update: {
          id?: string;
          task_id?: string | null;
          requested_by?: string | null;
          status?: string;
          requested_at?: string;
          resolved_at?: string | null;
          resolved_by?: string | null;
        };
      };
      outputs: {
        Row: {
          id: string;
          task_id: string | null;
          agent_id: string | null;
          title: string | null;
          content: string | null;
          file_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id?: string | null;
          agent_id?: string | null;
          title?: string | null;
          content?: string | null;
          file_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string | null;
          agent_id?: string | null;
          title?: string | null;
          content?: string | null;
          file_url?: string | null;
          created_at?: string;
        };
      };
      activity_events: {
        Row: {
          id: string;
          event_type: string;
          description: string | null;
          entity_type: string | null;
          entity_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          description?: string | null;
          entity_type?: string | null;
          entity_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_type?: string;
          description?: string | null;
          entity_type?: string | null;
          entity_id?: string | null;
          created_at?: string;
        };
      };
      conversation_threads: {
        Row: {
          id: string;
          title: string;
          user_id: string | null;
          current_session_key: string | null;
          current_model: string;
          session_count: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          user_id?: string | null;
          current_session_key?: string | null;
          current_model?: string;
          session_count?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          user_id?: string | null;
          current_session_key?: string | null;
          current_model?: string;
          session_count?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      session_chain: {
        Row: {
          id: string;
          thread_id: string;
          session_key: string;
          model: string;
          reason: string | null;
          context_snapshot: string | null;
          start_tokens: number;
          end_tokens: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          thread_id: string;
          session_key: string;
          model: string;
          reason?: string | null;
          context_snapshot?: string | null;
          start_tokens?: number;
          end_tokens?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          thread_id?: string;
          session_key?: string;
          model?: string;
          reason?: string | null;
          context_snapshot?: string | null;
          start_tokens?: number;
          end_tokens?: number | null;
          created_at?: string;
        };
      };
    };
  };
};
