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
  | Json[];

export type Database = {
  public: {
    Tables: {
      activity_events: {
        Row: {
          id: string
          user_id: string
          event_type: string
          requirement_id: string | null
          entity_type: string | null
          entity_id: string | null
          metadata: Json
          curriculum_version: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          event_type: string
          requirement_id?: string | null
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json
          curriculum_version?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: string
          requirement_id?: string | null
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json
          curriculum_version?: string | null
          created_at?: string
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
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_provider_settings: {
        Row: {
          id: string
          provider_name: string
          service_type: string
          is_active: boolean
          model: string | null
          config: Json
          max_generations_per_activity: number
          updated_at: string
        }
        Insert: {
          id?: string
          provider_name: string
          service_type: string
          is_active?: boolean
          model?: string | null
          config?: Json
          max_generations_per_activity?: number
          updated_at?: string
        }
        Update: {
          id?: string
          provider_name?: string
          service_type?: string
          is_active?: boolean
          model?: string | null
          config?: Json
          max_generations_per_activity?: number
          updated_at?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          id: string
          code: string
          name: string
          description: string
          icon: string
          tier: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description: string
          icon?: string
          tier?: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string
          icon?: string
          tier?: string
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      certification_events: {
        Row: {
          id: string
          certification_id: string
          event_type: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          certification_id: string
          event_type: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          certification_id?: string
          event_type?: string
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "certification_events_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          }
        ]
      }
      certification_snapshots: {
        Row: {
          id: string
          certification_id: string
          requirements_snapshot: Json
          progress_snapshot: Json
          created_at: string
        }
        Insert: {
          id?: string
          certification_id: string
          requirements_snapshot?: Json
          progress_snapshot?: Json
          created_at?: string
        }
        Update: {
          id?: string
          certification_id?: string
          requirements_snapshot?: Json
          progress_snapshot?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "certification_snapshots_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          }
        ]
      }
      certifications: {
        Row: {
          id: string
          user_id: string
          specialty_id: string
          code: string
          hash: string
          signature: string | null
          level: string
          curriculum_code: string
          curriculum_version: string
          status: string
          issued_at: string
          revoked_at: string | null
          revocation_reason: string | null
          reference_certification_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          specialty_id: string
          code: string
          hash: string
          signature?: string | null
          level: string
          curriculum_code: string
          curriculum_version: string
          status?: string
          issued_at?: string
          revoked_at?: string | null
          revocation_reason?: string | null
          reference_certification_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          specialty_id?: string
          code?: string
          hash?: string
          signature?: string | null
          level?: string
          curriculum_code?: string
          curriculum_version?: string
          status?: string
          issued_at?: string
          revoked_at?: string | null
          revocation_reason?: string | null
          reference_certification_id?: string | null
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
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      curriculum_versions: {
        Row: {
          id: string
          code: string
          name: string
          version: string
          is_published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          version?: string
          is_published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          version?: string
          is_published?: boolean
          created_at?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          id: string
          user_id: string
          specialty_id: string
          status: string
          started_at: string
          completed_at: string | null
          xp: number
          streak_days: number
          last_activity_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          specialty_id: string
          status?: string
          started_at?: string
          completed_at?: string | null
          xp?: number
          streak_days?: number
          last_activity_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          specialty_id?: string
          status?: string
          started_at?: string
          completed_at?: string | null
          xp?: number
          streak_days?: number
          last_activity_date?: string | null
          created_at?: string
          updated_at?: string
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
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      lesson_attempts: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          score: number
          total: number
          passed: boolean
          answers: Json
          started_at: string
          completed_at: string | null
          active_duration_ms: number
        }
        Insert: {
          id?: string
          user_id?: string
          lesson_id: string
          score?: number
          total?: number
          passed?: boolean
          answers?: Json
          started_at?: string
          completed_at?: string | null
          active_duration_ms?: number
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          score?: number
          total?: number
          passed?: boolean
          answers?: Json
          started_at?: string
          completed_at?: string | null
          active_duration_ms?: number
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
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      lessons: {
        Row: {
          id: string
          module_id: string
          code: string
          title: string
          lesson_type: string
          content: Json
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          module_id: string
          code: string
          title: string
          lesson_type?: string
          content?: Json
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          code?: string
          title?: string
          lesson_type?: string
          content?: Json
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          }
        ]
      }
      modules: {
        Row: {
          id: string
          specialty_id: string
          code: string
          title: string
          description: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          specialty_id: string
          code: string
          title: string
          description?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          specialty_id?: string
          code?: string
          title?: string
          description?: string | null
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          }
        ]
      }
      privacy_preferences: {
        Row: {
          id: string
          user_id: string
          show_club_publicly: boolean
          share_certifications: boolean
          allow_auditor: boolean
          created_at: string
          updated_at: string
          show_on_leaderboard: boolean
        }
        Insert: {
          id?: string
          user_id?: string
          show_club_publicly?: boolean
          share_certifications?: boolean
          allow_auditor?: boolean
          created_at?: string
          updated_at?: string
          show_on_leaderboard?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          show_club_publicly?: boolean
          share_certifications?: boolean
          allow_auditor?: boolean
          created_at?: string
          updated_at?: string
          show_on_leaderboard?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "privacy_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      requirement_progress: {
        Row: {
          id: string
          user_id: string
          requirement_id: string
          status: string
          mastery_score: number
          attempts: number
          correct_count: number
          total_questions: number
          retention_passed: boolean
          checkpoint_passed: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          requirement_id: string
          status?: string
          mastery_score?: number
          attempts?: number
          correct_count?: number
          total_questions?: number
          retention_passed?: boolean
          checkpoint_passed?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          requirement_id?: string
          status?: string
          mastery_score?: number
          attempts?: number
          correct_count?: number
          total_questions?: number
          retention_passed?: boolean
          checkpoint_passed?: boolean
          updated_at?: string
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
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      requirements: {
        Row: {
          id: string
          specialty_id: string
          code: string
          title: string
          description: string
          type: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          specialty_id: string
          code: string
          title: string
          description: string
          type: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          specialty_id?: string
          code?: string
          title?: string
          description?: string
          type?: string
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "requirements_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          }
        ]
      }
      specialties: {
        Row: {
          id: string
          curriculum_version_id: string
          code: string
          name: string
          level: string
          description: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          curriculum_version_id: string
          code: string
          name: string
          level: string
          description?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          curriculum_version_id?: string
          code?: string
          name?: string
          level?: string
          description?: string | null
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialties_curriculum_version_id_fkey"
            columns: ["curriculum_version_id"]
            isOneToOne: false
            referencedRelation: "curriculum_versions"
            referencedColumns: ["id"]
          }
        ]
      }
      text_projects: {
        Row: {
          id: string
          user_id: string
          title: string | null
          body: string
          word_count: number
          status: string
          criteria_met: Json
          quiz_score: number | null
          quiz_total: number | null
          created_at: string
          updated_at: string
          specialty_code: string
          etapas: Json
        }
        Insert: {
          id?: string
          user_id?: string
          title?: string | null
          body?: string
          word_count?: number
          status?: string
          criteria_met?: Json
          quiz_score?: number | null
          quiz_total?: number | null
          created_at?: string
          updated_at?: string
          specialty_code: string
          etapas?: Json
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          body?: string
          word_count?: number
          status?: string
          criteria_met?: Json
          quiz_score?: number | null
          quiz_total?: number | null
          created_at?: string
          updated_at?: string
          specialty_code?: string
          etapas?: Json
        }
        Relationships: [
          {
            foreignKeyName: "text_projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          awarded_at: string
          context: Json
        }
        Insert: {
          id?: string
          user_id?: string
          badge_id: string
          awarded_at?: string
          context?: Json
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          awarded_at?: string
          context?: Json
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
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          display_name: string
          username: string | null
          club: string | null
          unit: string | null
          public_name_form: string
          is_admin: boolean
          terms_version: string
          terms_accepted_at: string | null
          created_at: string
          updated_at: string
          avatar_url: string | null
          security_question_code: string | null
          security_answer_hash: string | null
          club_code: string | null
          club_city: string | null
          club_association: string | null
        }
        Insert: {
          id?: string
          email: string
          display_name: string
          username?: string | null
          club?: string | null
          unit?: string | null
          public_name_form?: string
          is_admin?: boolean
          terms_version?: string
          terms_accepted_at?: string | null
          created_at?: string
          updated_at?: string
          avatar_url?: string | null
          security_question_code?: string | null
          security_answer_hash?: string | null
          club_code?: string | null
          club_city?: string | null
          club_association?: string | null
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          username?: string | null
          club?: string | null
          unit?: string | null
          public_name_form?: string
          is_admin?: boolean
          terms_version?: string
          terms_accepted_at?: string | null
          created_at?: string
          updated_at?: string
          avatar_url?: string | null
          security_question_code?: string | null
          security_answer_hash?: string | null
          club_code?: string | null
          club_city?: string | null
          club_association?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      xp_events: {
        Row: {
          id: string
          user_id: string
          specialty_id: string | null
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          specialty_id?: string | null
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          specialty_id?: string | null
          amount?: number
          created_at?: string
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
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          id: string | null
          display_name: string | null
          username: string | null
          club: string | null
          unit: string | null
          public_name_form: string | null
          avatar_url: string | null
          club_code: string | null
          club_city: string | null
          club_association: string | null
        }
        Insert: {
          id?: string | null
          display_name?: string | null
          username?: string | null
          club?: string | null
          unit?: string | null
          public_name_form?: string | null
          avatar_url?: string | null
          club_code?: string | null
          club_city?: string | null
          club_association?: string | null
        }
        Update: {
          id?: string | null
          display_name?: string | null
          username?: string | null
          club?: string | null
          unit?: string | null
          public_name_form?: string | null
          avatar_url?: string | null
          club_code?: string | null
          club_city?: string | null
          club_association?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_certificate_counts: {
        Args: Record<PropertyKey, never>
        Returns: {
          curriculum_code: string | null
          emitidos: number | null
          ativos: number | null
          revogados: number | null
          primeiro: string | null
          ultimo: string | null
        }[]
      }
      admin_revoke_certificate: {
        Args: {
          p_code: string
          p_reason: string
        }
        Returns: {
          code: string | null
          status: string | null
          curriculum_code: string | null
          issued_at: string | null
        }[]
      }
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      leaderboard: {
        Args: {
          p_periodo?: string
        }
        Returns: {
          id: string | null
          display_name: string | null
          public_name_form: string | null
          avatar_url: string | null
          club: string | null
          club_city: string | null
          total_xp: number | null
          best_streak: number | null
          badge_count: number | null
        }[]
      }
      promote_first_admin: {
        Args: {
          p_email: string
        }
        Returns: boolean
      }
      update_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      verify_certificate: {
        Args: {
          p_code: string
        }
        Returns: {
          code: string | null
          hash: string | null
          level: string | null
          curriculum_code: string | null
          curriculum_version: string | null
          status: string | null
          issued_at: string | null
          full_name: string | null
          club: string | null
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
};

