import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Habit, HabitInput, ISODate } from '@/types/database';

type Completions = Record<string, ISODate[]>;

interface HabitsContextValue {
  habits: Habit[];
  completions: Completions;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  refresh: () => Promise<void>;
  createHabit: (input: HabitInput) => Promise<Habit>;
  updateHabit: (id: string, input: HabitInput) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleCompletion: (habitId: string, date: ISODate) => Promise<void>;
}

const HabitsContext = createContext<HabitsContextValue | null>(null);

const PAGE_SIZE = 1000; // Supabase's default max rows per request

async function fetchAllCompletions(): Promise<Completions> {
  const result: Completions = {};
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('habit_completions')
      .select('habit_id, completed_on')
      .order('completed_on')
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    for (const row of data) (result[row.habit_id] ??= []).push(row.completed_on);
    if (data.length < PAGE_SIZE) return result;
  }
}

const message = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong.');

export function HabitsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletionsState] = useState<Completions>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref mirror so rapid taps decide insert vs delete from the latest optimistic state.
  const completionsRef = useRef<Completions>({});
  const setCompletions = useCallback((update: (prev: Completions) => Completions) => {
    completionsRef.current = update(completionsRef.current);
    setCompletionsState(completionsRef.current);
  }, []);

  // Serialize writes per habit/day so the server ends in the same state as the UI.
  const queues = useRef(new Map<string, Promise<void>>());

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [habitsRes, allCompletions] = await Promise.all([
        supabase.from('habits').select('*').order('created_at'),
        fetchAllCompletions(),
      ]);
      if (habitsRes.error) throw habitsRes.error;
      setHabits(habitsRes.data);
      setCompletions(() => allCompletions);
      setError(null);
    } catch (e) {
      setError(message(e));
    } finally {
      setIsLoading(false);
    }
  }, [setCompletions]);

  useEffect(() => {
    if (user) refresh();
  }, [user?.id, refresh]); // eslint-disable-line react-hooks/exhaustive-deps

  const createHabit = useCallback(async (input: HabitInput) => {
    const { data, error } = await supabase.from('habits').insert(input).select().single();
    if (error) throw error;
    setHabits((prev) => [...prev, data]);
    return data;
  }, []);

  const updateHabit = useCallback(async (id: string, input: HabitInput) => {
    const { data, error } = await supabase.from('habits').update(input).eq('id', id).select().single();
    if (error) throw error;
    setHabits((prev) => prev.map((h) => (h.id === id ? data : h)));
  }, []);

  const deleteHabit = useCallback(async (id: string) => {
    const { error } = await supabase.from('habits').delete().eq('id', id);
    if (error) throw error;
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setCompletions(({ [id]: _removed, ...rest }) => rest);
  }, [setCompletions]);

  const toggleCompletion = useCallback(
    (habitId: string, date: ISODate) => {
      if (!user) return Promise.resolve();
      const wasDone = (completionsRef.current[habitId] ?? []).includes(date);
      const apply = (done: boolean) =>
        setCompletions((prev) => {
          const current = (prev[habitId] ?? []).filter((d) => d !== date);
          return { ...prev, [habitId]: done ? [...current, date] : current };
        });

      apply(!wasDone); // optimistic

      const write = async () => {
        const { error } = wasDone
          ? await supabase.from('habit_completions').delete().eq('habit_id', habitId).eq('completed_on', date)
          : await supabase
              .from('habit_completions')
              .upsert(
                { habit_id: habitId, user_id: user.id, completed_on: date },
                { onConflict: 'habit_id,completed_on', ignoreDuplicates: true },
              );
        if (error) {
          apply(wasDone); // roll back
          setError(`Couldn't save that change. ${error.message}`);
        }
      };

      const key = `${habitId}:${date}`;
      const next = (queues.current.get(key) ?? Promise.resolve()).then(write);
      queues.current.set(key, next);
      return next;
    },
    [user, setCompletions],
  );

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      habits,
      completions,
      isLoading,
      error,
      clearError,
      refresh,
      createHabit,
      updateHabit,
      deleteHabit,
      toggleCompletion,
    }),
    [habits, completions, isLoading, error, clearError, refresh, createHabit, updateHabit, deleteHabit, toggleCompletion],
  );

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabits(): HabitsContextValue {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error('useHabits must be used inside HabitsProvider');
  return ctx;
}

/** Convenience hook for a single habit and its completion set. */
export function useHabit(id: string | undefined) {
  const { habits, completions } = useHabits();
  const habit = habits.find((h) => h.id === id);
  const dates = id ? completions[id] : undefined;
  const completedDates = useMemo(() => new Set(dates ?? []), [dates]);
  return { habit, completedDates };
}
