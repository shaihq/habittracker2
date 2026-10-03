export type Frequency = 'daily' | '3_per_week' | '5_per_week';

/** Calendar date in YYYY-MM-DD format. */
export type ISODate = string;

export type Profile = {
  id: string;
  email: string;
  name: string;
  created_at: string;
};

export type Habit = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  frequency: Frequency;
  created_at: string;
};

export type HabitCompletion = {
  id: string;
  habit_id: string;
  user_id: string;
  completed_on: ISODate;
  created_at: string;
};

export type HabitInput = {
  name: string;
  description: string | null;
  color: string;
  frequency: Frequency;
};

/** Schema types for the typed Supabase client (mirrors supabase/migrations). */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Pick<Profile, 'id' | 'email'> & Partial<Pick<Profile, 'name' | 'created_at'>>;
        Update: Partial<Pick<Profile, 'name' | 'email'>>;
        Relationships: [];
      };
      habits: {
        Row: Habit;
        Insert: HabitInput & Partial<Pick<Habit, 'id' | 'user_id' | 'created_at'>>;
        Update: Partial<HabitInput>;
        Relationships: [];
      };
      habit_completions: {
        Row: HabitCompletion;
        Insert: Pick<HabitCompletion, 'habit_id' | 'completed_on'> &
          Partial<Pick<HabitCompletion, 'id' | 'user_id' | 'created_at'>>;
        Update: never;
        Relationships: [
          {
            foreignKeyName: 'habit_completions_habit_id_fkey';
            columns: ['habit_id'];
            isOneToOne: false;
            referencedRelation: 'habits';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
