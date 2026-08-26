/*
  Gerado a partir do schema. Não edite à mão.

  Espelha `supabase/migrations/`, que é onde o schema deste projeto mora, e
  serve para uma coisa só: parametrizar o cliente. Com `createClient<Database>`,
  `.from()`, `.select()`, `.insert()` e `.rpc()` passam a ser conferidos pelo
  compilador, inclusive o resultado de junção embutida — que era de onde vinha a
  maioria dos `any` da camada de dados.

  Para atualizar depois de uma migration nova, com o CLI e acesso ao projeto:

      supabase gen types typescript --project-id <ref> > src/types/database.ts

  O que este arquivo não faz é descrever o domínio. Aqui não há enum de
  Postgres: `public_name_form`, `level`, `status` e `tier` são `text` com
  CHECK, e chegam do banco como `string`. As uniões estreitas — e conferidas —
  moram em `./index.ts` (`NivelDaEspecialidade`, `UserProfile`, `Badge`...), e
  continuam sendo a fonte para o domínio. Não troque uma pela outra:
  `getPublicName` depende de `public_name_form` ser uma união exaustiva, coisa
  que `string` não dá.
*/

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      activity_events: {
        Row: {
          created_at: string
          curriculum_version: string | null
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: string
          metadata: Json
          requirement_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          curriculum_version?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          metadata?: Json
          requirement_id?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          curriculum_version?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          metadata?: Json
          requirement_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_events_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_provider_settings: {
        Row: {
          config: Json
          id: string
          is_active: boolean
          max_generations_per_activity: number
          model: string | null
          provider_name: string
          service_type: string
          updated_at: string
        }
        Insert: {
          config?: Json
          id?: string
          is_active?: boolean
          max_generations_per_activity?: number
          model?: string | null
          provider_name: string
          service_type: string
          updated_at?: string
        }
        Update: {
          config?: Json
          id?: string
          is_active?: boolean
          max_generations_per_activity?: number
          model?: string | null
          provider_name?: string
          service_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          code: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          sort_order: number
          tier: string
        }
        Insert: {
          code: string
          created_at?: string
          description: string
          icon?: string
          id?: string
          name: string
          sort_order?: number
          tier?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          sort_order?: number
          tier?: string
        }
        Relationships: []
      }
      certification_events: {
        Row: {
          certification_id: string
          created_at: string
          event_type: string
          id: string
          metadata: Json
        }
        Insert: {
          certification_id: string
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
        }
        Update: {
          certification_id?: string
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "certification_events_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
        ]
      }
      certification_snapshots: {
        Row: {
          certification_id: string
          created_at: string
          id: string
          progress_snapshot: Json
          requirements_snapshot: Json
        }
        Insert: {
          certification_id: string
          created_at?: string
          id?: string
          progress_snapshot?: Json
          requirements_snapshot?: Json
        }
        Update: {
          certification_id?: string
          created_at?: string
          id?: string
          progress_snapshot?: Json
          requirements_snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "certification_snapshots_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          code: string
          curriculum_code: string
          curriculum_version: string
          hash: string
          id: string
          issued_at: string
          level: string
          reference_certification_id: string | null
          revocation_reason: string | null
          revoked_at: string | null
          signature: string | null
          specialty_id: string
          status: string
          user_id: string
        }
        Insert: {
          code: string
          curriculum_code: string
          curriculum_version: string
          hash: string
          id?: string
          issued_at?: string
          level: string
          reference_certification_id?: string | null
          revocation_reason?: string | null
          revoked_at?: string | null
          signature?: string | null
          specialty_id: string
          status?: string
          user_id: string
        }
        Update: {
          code?: string
          curriculum_code?: string
          curriculum_version?: string
          hash?: string
          id?: string
          issued_at?: string
          level?: string
          reference_certification_id?: string | null
          revocation_reason?: string | null
          revoked_at?: string | null
          signature?: string | null
          specialty_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certifications_reference_certification_id_fkey"
            columns: ["reference_certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certifications_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculum_versions: {
        Row: {
          code: string
          created_at: string
          id: string
          is_published: boolean
          name: string
          version: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_published?: boolean
          name: string
          version?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_published?: boolean
          name?: string
          version?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          last_activity_date: string | null
          specialty_id: string
          started_at: string
          status: string
          streak_days: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          last_activity_date?: string | null
          specialty_id: string
          started_at?: string
          status?: string
          streak_days?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          last_activity_date?: string | null
          specialty_id?: string
          started_at?: string
          status?: string
          streak_days?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_attempts: {
        Row: {
          active_duration_ms: number
          answers: Json
          completed_at: string | null
          id: string
          lesson_id: string
          passed: boolean
          score: number
          started_at: string
          total: number
          user_id: string
        }
        Insert: {
          active_duration_ms?: number
          answers?: Json
          completed_at?: string | null
          id?: string
          lesson_id: string
          passed?: boolean
          score?: number
          started_at?: string
          total?: number
          user_id?: string
        }
        Update: {
          active_duration_ms?: number
          answers?: Json
          completed_at?: string | null
          id?: string
          lesson_id?: string
          passed?: boolean
          score?: number
          started_at?: string
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_attempts_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          code: string
          content: Json
          created_at: string
          id: string
          lesson_type: string
          module_id: string
          sort_order: number
          title: string
        }
        Insert: {
          code: string
          content?: Json
          created_at?: string
          id?: string
          lesson_type?: string
          module_id: string
          sort_order?: number
          title: string
        }
        Update: {
          code?: string
          content?: Json
          created_at?: string
          id?: string
          lesson_type?: string
          module_id?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          sort_order: number
          specialty_id: string
          title: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          specialty_id: string
          title: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          specialty_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      privacy_preferences: {
        Row: {
          allow_auditor: boolean
          created_at: string
          id: string
          share_certifications: boolean
          show_club_publicly: boolean
          show_on_leaderboard: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_auditor?: boolean
          created_at?: string
          id?: string
          share_certifications?: boolean
          show_club_publicly?: boolean
          show_on_leaderboard?: boolean
          updated_at?: string
          user_id?: string
        }
        Update: {
          allow_auditor?: boolean
          created_at?: string
          id?: string
          share_certifications?: boolean
          show_club_publicly?: boolean
          show_on_leaderboard?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "privacy_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "privacy_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      requirement_progress: {
        Row: {
          attempts: number
          checkpoint_passed: boolean
          correct_count: number
          id: string
          mastery_score: number
          requirement_id: string
          retention_passed: boolean
          status: string
          total_questions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          checkpoint_passed?: boolean
          correct_count?: number
          id?: string
          mastery_score?: number
          requirement_id: string
          retention_passed?: boolean
          status?: string
          total_questions?: number
          updated_at?: string
          user_id?: string
        }
        Update: {
          attempts?: number
          checkpoint_passed?: boolean
          correct_count?: number
          id?: string
          mastery_score?: number
          requirement_id?: string
          retention_passed?: boolean
          status?: string
          total_questions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "requirement_progress_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requirement_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requirement_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      requirements: {
        Row: {
          code: string
          created_at: string
          description: string
          id: string
          sort_order: number
          specialty_id: string
          title: string
          type: string
        }
        Insert: {
          code: string
          created_at?: string
          description: string
          id?: string
          sort_order?: number
          specialty_id: string
          title: string
          type: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          id?: string
          sort_order?: number
          specialty_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "requirements_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      specialties: {
        Row: {
          code: string
          created_at: string
          curriculum_version_id: string
          description: string | null
          id: string
          level: string
          name: string
          sort_order: number
        }
        Insert: {
          code: string
          created_at?: string
          curriculum_version_id: string
          description?: string | null
          id?: string
          level: string
          name: string
          sort_order?: number
        }
        Update: {
          code?: string
          created_at?: string
          curriculum_version_id?: string
          description?: string | null
          id?: string
          level?: string
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "specialties_curriculum_version_id_fkey"
            columns: ["curriculum_version_id"]
            isOneToOne: false
            referencedRelation: "curriculum_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      text_projects: {
        Row: {
          body: string
          created_at: string
          criteria_met: Json
          etapas: Json
          id: string
          quiz_score: number | null
          quiz_total: number | null
          specialty_code: string
          status: string
          title: string | null
          updated_at: string
          user_id: string
          word_count: number
        }
        Insert: {
          body?: string
          created_at?: string
          criteria_met?: Json
          etapas?: Json
          id?: string
          quiz_score?: number | null
          quiz_total?: number | null
          specialty_code: string
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string
          word_count?: number
        }
        Update: {
          body?: string
          created_at?: string
          criteria_met?: Json
          etapas?: Json
          id?: string
          quiz_score?: number | null
          quiz_total?: number | null
          specialty_code?: string
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string
          word_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "text_projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "text_projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          awarded_at: string
          badge_id: string
          context: Json
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          badge_id: string
          context?: Json
          id?: string
          user_id?: string
        }
        Update: {
          awarded_at?: string
          badge_id?: string
          context?: Json
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          club: string | null
          club_association: string | null
          club_city: string | null
          club_code: string | null
          created_at: string
          display_name: string
          email: string
          id: string
          is_admin: boolean
          public_name_form: string
          security_answer_hash: string | null
          security_question_code: string | null
          terms_accepted_at: string | null
          terms_version: string
          unit: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          club?: string | null
          club_association?: string | null
          club_city?: string | null
          club_code?: string | null
          created_at?: string
          display_name: string
          email: string
          id?: string
          is_admin?: boolean
          public_name_form?: string
          security_answer_hash?: string | null
          security_question_code?: string | null
          terms_accepted_at?: string | null
          terms_version?: string
          unit?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          club?: string | null
          club_association?: string | null
          club_city?: string | null
          club_code?: string | null
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          is_admin?: boolean
          public_name_form?: string
          security_answer_hash?: string | null
          security_question_code?: string | null
          terms_accepted_at?: string | null
          terms_version?: string
          unit?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      xp_events: {
        Row: {
          amount: number
          created_at: string
          id: string
          specialty_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          specialty_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          specialty_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xp_events_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          club: string | null
          club_association: string | null
          club_city: string | null
          club_code: string | null
          display_name: string | null
          id: string | null
          public_name_form: string | null
          unit: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          club?: string | null
          club_association?: string | null
          club_city?: string | null
          club_code?: string | null
          display_name?: string | null
          id?: string | null
          public_name_form?: string | null
          unit?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          club?: string | null
          club_association?: string | null
          club_city?: string | null
          club_code?: string | null
          display_name?: string | null
          id?: string | null
          public_name_form?: string | null
          unit?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_certificate_counts: {
        Args: never
        Returns: {
          ativos: number
          curriculum_code: string
          emitidos: number
          primeiro: string
          revogados: number
          ultimo: string
        }[]
      }
      admin_revoke_certificate: {
        Args: { p_code: string; p_reason: string }
        Returns: {
          code: string
          curriculum_code: string
          issued_at: string
          status: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      leaderboard: {
        Args: { p_periodo?: string }
        Returns: {
          avatar_url: string
          badge_count: number
          best_streak: number
          club: string
          club_city: string
          display_name: string
          id: string
          public_name_form: string
          total_xp: number
        }[]
      }
      promote_first_admin: { Args: { p_email: string }; Returns: boolean }
      verify_certificate: {
        Args: { p_code: string }
        Returns: {
          club: string
          code: string
          curriculum_code: string
          curriculum_version: string
          full_name: string
          hash: string
          issued_at: string
          level: string
          status: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
