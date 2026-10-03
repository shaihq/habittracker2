# HabitKit — CLAUDE.md

## Project Overview

Build a minimal, polished habit tracking mobile application called **HabitKit**.

The core idea is simple:

> Users create habits and track their completion through a GitHub-style contribution grid.

The UI should feel modern, dark, minimal, and highly visual.

A reference UI has been provided in the conversation. Use it as the primary visual inspiration for layout, spacing, cards, contribution grids, colors, and overall interaction patterns.

Do NOT blindly copy the reference. Create an original implementation with the same general design language.

---

# Tech Stack

## Mobile App

- **Expo**
- **React Native**
- **TypeScript**
- **Expo Router**

## Backend

- **Supabase**
  - Supabase Auth
  - PostgreSQL database
  - Row Level Security (RLS)

## Styling

- React Native StyleSheet or NativeWind
- Prefer simple, maintainable styling
- Dark-first UI

## Icons

- Lucide React Native / Expo-compatible icon library

## State

Keep state management simple.

Use:
- React state
- React Context where necessary
- Supabase queries

Do NOT introduce Redux, Zustand, or another state management library unless there is a clear need.

## Deployment

- Expo / EAS

---

# Product Scope

This is an MVP.

The MVP should have only these core features:

1. Sign up
2. Login
3. Logout
4. Create a habit
5. View habits
6. Mark a habit as completed for a date
7. Unmark a habit
8. View habit history through a GitHub-style contribution grid
9. View a habit detail screen
10. Calculate basic streak information

Do NOT build:

- Social features
- Friends
- Leaderboards
- Notifications
- Reminders
- Subscriptions
- Payments
- Gamification systems
- Complex analytics
- AI features
- Calendar integrations
- Apple Health integrations
- Google integrations
- Onboarding flows
- Multiple themes

Keep the MVP focused.

---

# Core Screens

## 1. Login

Create a simple dark login screen.

Elements:

- HabitKit logo/name
- Email input
- Password input
- Continue/Login button
- Link to Sign Up

Example:

    HabitKit

    Build habits.
    See yourself improve.

    [ Email ]

    [ Password ]

    [ Continue ]

    Don't have an account?
    Create account

---

# 2. Sign Up

Fields:

- Name
- Email
- Password

Button:

- Create account

After successful signup, take the user to the Home screen.

---

# 3. Home

This is the primary screen.

The Home screen should contain:

### Header

- HabitKit
- Settings/logout icon
- Add habit button

### Habit cards

Each habit appears as a large rounded card.

Example:

    ┌──────────────────────────────┐
    │ 🏋 Sport                 ✓  │
    │ Weightlifting, running...   │
    │                             │
    │ ▪ ▪ █ ▪ ▪ █ ▪ ▪ █ ▪ ▪     │
    │ ▪ █ █ ▪ ▪ █ █ ▪ ▪ ▪       │
    │ █ █ ▪ ▪ █ ▪ █ ▪ ▪ █       │
    │ ▪ ▪ █ ▪ █ ▪ █ ▪ ▪ ▪       │
    │                             │
    │ 🔥 12 day streak            │
    │ 4 of 5 this week           │
    └──────────────────────────────┘

Each habit should have:

- Name
- Optional description
- Habit-specific accent color
- Contribution grid
- Current streak
- Weekly completion progress

---

# Contribution Grid

The contribution grid is the most important component in the application.

It should behave similarly to the GitHub contribution graph.

Each cell represents one calendar day.

Example:

    ▪ ▪ █ ▪ ▪ █ ▪ ▪ █ ▪
    ▪ █ █ ▪ ▪ █ █ ▪ ▪ ▪
    █ █ ▪ ▪ █ ▪ █ ▪ ▪ █
    ▪ ▪ █ ▪ █ ▪ █ ▪ ▪ ▪

### Cell states

Incomplete:

    dark / muted

Completed:

    habit accent color

The completed state should be visually prominent but not overly bright.

### Interaction

Tapping today's cell:

    incomplete → completed

Tapping a completed cell:

    completed → incomplete

The UI should update immediately.

Do not require the user to open the habit detail screen just to complete today's habit.

---

# Date Logic

The contribution grid should display approximately the last 6 months of activity.

Generate the dates dynamically.

Do not hardcode dates.

Each cell must map to an actual date.

Example:

    2026-10-01
    2026-10-02
    2026-10-03

etc.

When rendering the grid:

    completedDates.includes(date)

should determine whether the cell is completed.

Use a consistent date format internally.

Prefer ISO date strings:

    YYYY-MM-DD

Store only the date for habit completion, not an unnecessary timestamp.

---

# Add Habit

When the user taps the + button, show an Add Habit screen/modal.

Keep it simple.

Fields:

### Habit name

Example:

    Reading

### Description

Optional.

Example:

    Read for 15 minutes

### Frequency

For MVP support:

- Every day
- 3 times a week
- 5 times a week

### Color

Provide a small set of predefined accent colors.

Example:

- Purple
- Cyan
- Orange
- Green
- Pink

### Create

After creating a habit:

    Add habit
        ↓
    Save to Supabase
        ↓
    Return to Home
        ↓
    Display new habit

---

# Habit Detail

Tapping a habit card opens the Habit Detail screen.

The screen should contain:

- Habit name
- Description
- Large contribution grid
- Current streak
- Total completions
- Weekly completion information
- Edit habit
- Delete habit

The detail screen should provide a larger version of the same contribution graph.

---

# Database

Use Supabase PostgreSQL.

Create the following tables.

## profiles

Fields:

    id
    email
    name
    created_at

`id` should reference the authenticated Supabase user.

---

## habits

Fields:

    id
    user_id
    name
    description
    color
    frequency
    created_at

Example:

    id: UUID
    user_id: UUID
    name: "Reading"
    description: "Read for 15 minutes"
    color: "#55C7E8"
    frequency: "daily"
    created_at: timestamp

---

## habit_completions

Fields:

    id
    habit_id
    user_id
    completed_on
    created_at

Example:

    habit_id: abc
    user_id: xyz
    completed_on: 2026-10-03

`completed_on` should represent the calendar date.

---

# Supabase Security

Row Level Security MUST be enabled.

Users must only be able to:

- Read their own profile
- Update their own profile
- Read their own habits
- Create their own habits
- Update their own habits
- Delete their own habits
- Read their own habit completions
- Create their own habit completions
- Delete their own habit completions

Never expose another user's habit data.

Use the authenticated Supabase user ID to enforce ownership.

---

# Authentication

Use Supabase Auth.

Authentication flow:

    App opens
        ↓
    Check Supabase session
        ↓
    Session exists?
       / \
     YES  NO
      ↓    ↓
    Home  Login

Unauthenticated users should not be able to access the main application.

Authenticated users should not see Login/Signup unless they explicitly log out.

Use Expo Router protected routes where appropriate.

---

# Data Flow

## Fetch habits

When Home loads:

    Supabase Auth
        ↓
    Get current user
        ↓
    Fetch user's habits
        ↓
    Fetch relevant completions
        ↓
    Render habit cards

---

## Complete habit

When a user taps a cell:

    Tap cell
        ↓
    Check completion exists
        ↓
    If NOT exists
        ↓
    INSERT completion

or:

    If exists
        ↓
    DELETE completion

Then immediately update the UI.

Prefer optimistic UI updates where practical.

---

# Streak Calculation

Create a utility function for calculating streaks.

Example:

    calculateStreak(completedDates)

The current streak is the number of consecutive completed days ending today.

Example:

    Oct 1 ✓
    Oct 2 ✓
    Oct 3 ✓
    Oct 4 ✓

Result:

    4 day streak

If today is not completed, the current streak should be 0 unless the product logic explicitly supports a different interpretation.

Keep streak logic isolated in a utility function so it can be tested independently.

---

# Suggested Project Structure

Use a clean structure similar to:

    app/
    ├── (auth)/
    │   ├── login.tsx
    │   └── signup.tsx
    │
    ├── (app)/
    │   ├── index.tsx
    │   ├── add-habit.tsx
    │   └── habit/
    │       └── [id].tsx
    │
    └── _layout.tsx

    components/
    ├── HabitCard.tsx
    ├── ContributionGrid.tsx
    ├── HabitHeader.tsx
    ├── AddHabitForm.tsx
    └── Button.tsx

    lib/
    └── supabase.ts

    utils/
    ├── dates.ts
    └── streaks.ts

    types/
    └── database.ts

Do not create unnecessary abstractions.

---

# Design Direction

The reference UI uses a dark, premium, minimal aesthetic.

Follow these principles:

### Background

Near-black.

Example:

    #0B0B0D

### Cards

Dark gray.

Example:

    #17171A

### Borders

Very subtle.

Do not use heavy borders everywhere.

### Contribution cells

Dark inactive state:

    #29292F

Active state:

    Use the habit's accent color.

### Border radius

Use generous rounded corners.

Cards:

    20–24px

Buttons:

    14–18px

Contribution cells:

    4–5px

### Typography

Use a clean modern sans-serif.

Prefer:

- Inter
- SF Pro / system font

Avoid decorative fonts.

---

# Color System

Habits should be visually distinguishable.

Suggested colors:

    Purple
    #8B7CFF

    Cyan
    #55C7E8

    Orange
    #E9A44C

    Green
    #6FD08C

    Pink
    #E982B5

Do not hardcode colors throughout components.

Create a central color configuration.

---

# UX Principles

## 1. Fast interaction

Completing a habit should require one tap.

## 2. Visual feedback

When a cell is completed:

- Update immediately
- Provide subtle animation
- Optionally use haptic feedback

## 3. Minimal navigation

The user should be able to:

    Open app
        ↓
    See habits
        ↓
    Tap today's cells
        ↓
    Done

## 4. No unnecessary complexity

If a feature does not directly contribute to tracking habits, leave it out of the MVP.

---

# Component Guidelines

Build reusable components.

For example:

    <HabitCard />

    <ContributionGrid />

    <HabitHeader />

    <PrimaryButton />

Do not duplicate large UI blocks across screens.

The ContributionGrid should be reusable on:

- Home
- Habit Detail

---

# Code Quality

Use TypeScript throughout.

Avoid:

- `any`
- Huge components
- Duplicate logic
- Hardcoded dates
- Hardcoded user IDs
- Hardcoded Supabase data
- Unnecessary dependencies

Prefer:

- Small components
- Clear naming
- Reusable utilities
- Strong typing
- Simple functions
- Predictable data flow

---

# Environment Variables

Use environment variables for Supabase.

Example:

    EXPO_PUBLIC_SUPABASE_URL=
    EXPO_PUBLIC_SUPABASE_ANON_KEY=

Never hardcode secrets in the application.

Never commit `.env` files containing secrets.

---

# Development Order

Build in this order.

## Phase 1

Create the Expo project.

Set up:

- TypeScript
- Expo Router
- Styling
- Basic navigation

## Phase 2

Build the UI with mock data.

Create:

- Login
- Signup
- Home
- Habit Card
- Contribution Grid
- Add Habit
- Habit Detail

Do NOT connect Supabase yet.

Focus on matching the visual quality of the reference.

## Phase 3

Set up Supabase.

Implement:

- Authentication
- Database
- RLS

## Phase 4

Connect the UI to Supabase.

Implement:

- Create habit
- Fetch habits
- Complete habit
- Delete completion
- Edit habit
- Delete habit

## Phase 5

Add:

- Streak calculation
- Weekly progress
- Loading states
- Error states
- Empty states
- Optimistic updates

## Phase 6

Polish:

- Animations
- Haptics
- Keyboard handling
- Safe areas
- Small spacing improvements
- Accessibility

---

# Important Development Rule

Do not try to build the entire application in one huge step.

Build incrementally.

After each major feature:

1. Run the app
2. Test the interaction
3. Fix errors
4. Confirm the UI works
5. Then continue

Do not add features that are not part of the MVP.

---

# Definition of Done

The MVP is complete when a new user can:

    Sign up
       ↓
    Login
       ↓
    Create "Reading"
       ↓
    See Reading on Home
       ↓
    Tap today's contribution cell
       ↓
    Cell becomes active
       ↓
    Close and reopen app
       ↓
    Completion is still there
       ↓
    Open Reading
       ↓
    See historical contribution grid
       ↓
    See current streak

And all user data is securely isolated through Supabase RLS.

---

# Final Product Principle

HabitKit should feel like:

> "GitHub contributions, but for your life."

The contribution grid is the hero interaction.

Keep everything else simple.