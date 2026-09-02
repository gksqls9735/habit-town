# Project Description

## Purpose

Habit Town is a mobile-first goal achievement app where users set meaningful personal goals, receive AI-generated daily tasks, earn rewards by completing those tasks, and use the rewards to grow and decorate a pixel-art character world.

The app should turn long-term goals into a daily loop that feels clear, rewarding, and emotionally engaging: set a goal, get today's tasks, complete them, receive resources, improve the character or room, and return tomorrow.

## Target Users

- People who want help breaking broad goals into small daily actions.
- Users who enjoy habit trackers, life-simulation games, Tamagotchi-like character growth, and cozy pixel-art interfaces.
- Users who need light structure and reward feedback rather than a complex productivity system.

## Core Goals

- Let users define a goal in plain language.
- Use AI to generate practical daily tasks that move the user toward the goal.
- Reward task completion with in-app currency, experience, items, or character growth resources.
- Let rewards feed into character development, room decoration, inventory, and visible progression.
- Make the first screen feel like a pixel-art room where the character, goal progress, and daily tasks are immediately visible.
- Support a soft, cozy, game-like tone without hiding the productivity workflow.

## Non-Goals

- The first version is not a full project management tool.
- The first version should not include social feeds, leaderboards, or competitive multiplayer.
- The first version should not depend on paid AI automation without an explicit product decision.
- The first version should not require complex avatar combat, open-world exploration, or deep RPG systems.
- The first version should avoid health, legal, financial, or clinical coaching claims.

## User Experience

### Primary Loop

1. The user creates a long-term goal, such as learning English, exercising consistently, preparing for a job, or building a portfolio.
2. The app asks for only the details needed to make useful daily tasks: current level, target deadline, available daily time, preferred difficulty, and constraints.
3. AI generates a small daily task set.
4. The user completes tasks and can optionally add a short reflection or proof note.
5. The app grants rewards based on task effort, streak, and importance.
6. Rewards are spent on character growth, room upgrades, cosmetics, or utility boosts.
7. The home room visibly changes as progress accumulates.

### Home Screen Direction

Use the attached reference image only as visual layout inspiration. Do not copy proprietary assets, exact characters, icons, or brand-specific visual details.

The home screen should be portrait-first and pixel-art styled:

- Top status bar: user level, experience progress, premium or special currency, and main soft currency.
- Center stage: character and room scene as the emotional focus.
- Left vertical actions: daily tasks, events, challenge list, shop or rotating offers.
- Right vertical actions: rewards, treasure box, inventory, my room, character pass or growth path.
- Main focal layout: a cozy room with furniture, mirror or wall object, decorative props, and character near the bottom center.
- Floating claim states: reward icons, gift boxes, or completion badges should appear around the room without blocking core interaction.

### Tone

- Cozy, encouraging, and lightly playful.
- Clear enough for daily productivity use.
- Character feedback should feel supportive, not judgmental.
- The app should avoid making missed days feel punishing.

## Functional Requirements

### Goal Setup

- Users can create, edit, pause, archive, and complete goals.
- Each goal stores title, motivation, target outcome, deadline, weekly commitment, difficulty preference, and daily available time.
- Users can choose a goal category, such as learning, fitness, career, creative, health routine, finance habit, or custom.
- The app should support one active primary goal for the first version, with multi-goal support deferred unless needed.

### AI Daily Task Generation

- Generate 1 to 5 tasks per day based on the active goal.
- Each task should have a title, short description, estimated time, difficulty, reward value, and completion criteria.
- Users can regenerate, replace, or simplify tasks.
- The AI should consider recent completion history and avoid repeating stale tasks.
- Tasks should be concrete and verifiable by the user.
- The app should include guardrails for sensitive categories and avoid professional advice claims.

### Task Completion

- Users can mark a task complete.
- Users can optionally attach a text note, checklist result, timer result, or photo proof in later phases.
- Completion grants experience and currency immediately.
- Partial completion can grant reduced rewards if the task supports it.
- Streaks and consistency bonuses should reward returning without making missed days too punitive.

### Reward System

- Main currency: earned by completing daily tasks.
- Experience: levels up the user and character.
- Special currency: optional, rare, and should not be necessary for core progress.
- Reward amount should scale by task difficulty, estimated effort, streak state, and goal importance.
- Daily reward pacing should be predictable enough that users understand how to earn upgrades.

### Character Growth

- The character should have level, mood, growth stage, cosmetic slots, and optional stat-like traits.
- Growth should be tied to the user's real progress, not random grinding.
- Mood can reflect recent activity but should remain forgiving.
- Character animations should be simple pixel-art loops in the first version: idle, happy, sleeping, reward claim, and level-up.

### Room And Inventory

- Users can spend rewards on furniture, wall items, floor items, character accessories, and utility items.
- Inventory should show owned, equipped, locked, and newly obtained items.
- Room layout can start with fixed slots instead of free placement.
- Decoration upgrades should provide visible progress and collection motivation.

### Progress Tracking

- Show daily completion, weekly consistency, goal progress, character level, and reward history.
- Include a lightweight calendar or streak view in a later phase.
- Provide a simple recap after completing all daily tasks.

### Notifications

- Remind users about daily tasks at a chosen time.
- Notify users when new daily tasks are ready.
- Avoid excessive reward or urgency notifications.
- Notification scheduling and quiet hours should be explicit user settings.

## Data And State

### Local State

- User profile and onboarding preferences.
- Active goal and goal history.
- Daily generated task set.
- Task completion records.
- Currency balances and reward transactions.
- Character state, equipped items, inventory, and room state.
- App settings such as notification time, sound, and reduced motion.

### Suggested Data Models

- `UserProfile`: id, displayName, timezone, onboardingComplete, preferences.
- `Goal`: id, title, category, motivation, targetOutcome, deadline, status, difficultyPreference, dailyTimeBudgetMinutes.
- `DailyPlan`: id, goalId, date, generatedAt, source, tasks.
- `Task`: id, dailyPlanId, title, description, estimatedMinutes, difficulty, reward, status, completionCriteria.
- `Completion`: id, taskId, completedAt, proofType, note, rewardGranted.
- `Wallet`: userId, coins, gems, experience.
- `Character`: userId, level, stage, mood, equippedCosmetics, animationState.
- `InventoryItem`: id, itemId, ownedAt, equipped, quantity.
- `RoomState`: userId, equippedFurnitureBySlot, backgroundTheme.

### Persistence Direction

- Start with local persistence suitable for Expo.
- Use a structured local store or SQLite when task history and inventory become large.
- Defer cloud sync, accounts, and cross-device restore until the core loop is validated.

## Technical Direction

- Use the existing Expo and React Native project direction.
- Keep TypeScript as the default language.
- Build route screens with Expo Router.
- Keep reusable UI components separate from feature logic.
- Place domain logic under feature folders such as `features/goals`, `features/tasks`, `features/rewards`, `features/character`, and `features/room`.
- Use pixel-art assets for characters, furniture, icons, and background tiles.
- Prefer deterministic reward calculation in app code; use AI only for task planning and adaptation.
- Keep AI prompts and response schemas versioned and testable.

## Visual Design Direction

- Overall style: cozy pixel-art room, soft pastel palette, compact game UI, portrait-first mobile layout.
- First screen: usable home room, not a marketing page.
- Top HUD: level, experience bar, and currency counters.
- Side rails: icon-first vertical navigation buttons with small labels when needed.
- Center scene: character, room furniture, mirror or wall feature, and decorative collection items.
- Task entry point: visible on the left side, with a badge for remaining tasks.
- Reward entry point: visible on the right side, with a claim state when available.
- Avoid copying the attached reference's exact characters, icon art, button art, colors, or proprietary layout details.
- Use responsive constraints so UI controls do not overlap the center character scene on different device heights.

## Implementation Phases

### Phase 1: Planning And Core Prototype

- Define data models and app navigation.
- Build the home room screen with placeholder pixel-art assets.
- Add goal creation and active goal display.
- Add a mocked AI daily task generator.
- Add task completion and deterministic rewards.
- Add character level and currency display.

### Phase 2: AI Task Generation

- Add structured AI prompt and response schema.
- Generate daily tasks from goal details and history.
- Add task regeneration and task difficulty adjustment.
- Add guardrails for sensitive goal categories.
- Add local caching so the daily plan is stable after generation.

### Phase 3: Growth And Room Systems

- Add inventory, shop, and item unlocks.
- Add fixed room decoration slots.
- Add character stages, cosmetics, and basic animations.
- Add reward balancing and streak bonuses.

### Phase 4: Retention And Polish

- Add notifications, reminders, and daily reset handling.
- Add weekly recap and progress calendar.
- Add sound, haptics, reduced motion settings, and accessibility refinements.
- Replace placeholder assets with final pixel-art assets.

### Phase 5: Accounts And Sync

- Add authentication only if cross-device sync is required.
- Add cloud backup for goals, history, character, wallet, and inventory.
- Add migration strategy for local-first users.

## Risks And Constraints

- AI-generated tasks may be vague unless prompts and schemas enforce concrete completion criteria.
- Reward balance can become either too slow or too easy; this needs tuning with real usage.
- Pixel-art UI can become crowded on small screens; layout needs early device testing.
- Daily resets and timezone handling must be explicit to avoid lost rewards or duplicated tasks.
- Character growth should support motivation without creating unhealthy pressure around missed tasks.
- If using paid AI APIs, cost controls and generation limits must be defined before launch.

## Open Questions

- Should the first release target iOS, Android, web, or all Expo-supported platforms?
- Will AI generation run through a backend service or locally call an API from the app?
- Should users have one active goal or multiple concurrent goals in the first release?
- What is the desired monetization model, if any?
- Should photo or file proof be required, optional, or deferred?
- Should the pixel-art assets be custom-made, generated, purchased, or placeholder-only during prototype work?
- What age range is the app intended for, and does it need parental controls or stricter safety boundaries?
