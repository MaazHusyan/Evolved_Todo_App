---
id: 0005
title: Phase 1.1 Architectural Planning
stage: plan
date: 2025-12-31
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-phase-1-todo-cli
branch: 001-phase-1-todo-cli
user: Maaz
command: /sp.plan "[PHASE_CONTEXT]: Phase 1.1 - Evolution from CLI Tool to Persistent Interactive App..."
labels: ["architecture", "json-persistence", "repl", "pydantic", "vscode"]
links:
  spec: specs/001-phase-1-todo-cli/spec.md
  ticket: null
  adr: history/adr/0001-persistent-json-storage-and-interactive-shell.md
  pr: null
files:
  - specs/001-phase-1-todo-cli/plan.md
  - specs/001-phase-1-todo-cli/tasks.md
  - specs/001-phase-1-todo-cli/data-model.md
  - specs/001-phase-1-todo-cli/research.md
  - specs/001-phase-1-todo-cli/quickstart.md
tests:
  - none
---

## Prompt

[PHASE_CONTEXT]: Phase 1.1 - Evolution from CLI Tool to Persistent Interactive App.

    [TASKS]:
    1. Environment & IDE Support:
       - Create root-level 'main.py' to act as a unified entry point (fixes ModuleNotFoundError).
       - Add '.vscode/settings.json' and 'launch.json' to enable the 'Run' button and debugging.
    2. Data Model & Engine Intelligence (src/core/):
       - Extend Pydantic models with 'Priority' (Enum), 'Tags' (list), and 'DueDate' placeholder.
       - Enhance 'TaskEngine' logic to support Search (keywords), Filter (status, priority, tags), and Sort (alphabetical, priority).
    3. Persistent Storage (src/repositories/):
       - Switch from 'InMemoryTaskRepository' to 'JSONTaskRepository'.
       - Ensure all task data is saved to and loaded from 'tasks.json' automatically.
    4. Interactive CLI Experience (src/cli/):
     - Implement a 'shell' command providing an interactive REPL loop.
     - Design a 'Dashboard' view using Rich that shows summary stats and an interactive menu.
     - Update 'add' and 'list' commands to support the new metadata (priority, tags).

    [ARCHITECTURAL_MANDATES]:
    - 100% Async Core: All new Engine/Repository logic must remain asynchronous.
    - Decoupled Integrity: The CLI must remain a thin layer; all logic belongs in 'src/core'.
    - Backward Compatibility: Existing 'good code' structure must be enhanced, not rewritten.

    [DELIVERABLES]:
    - Updated plan.md and tasks.md in the feature specs folder.
    - Verification plan for the new interactive shell."

## Response snapshot

As the System Architect, I have designed a comprehensive upgrade path for Phase 1.1. The plan introduces JSON persistence for data longevity, advanced organizational features (Priority, Tags, Search), and an interactive REPL loop for enhanced UX. I have also included environment-level fixes (root main.py and VS Code launch configs) to resolve path resolution issues. The architecture remains strictly decoupled and sync-safe through async placeholders.

## Outcome

- ✅ Impact: Strategic roadmap established for evolving the prototype into a professional persistent application.
- 🧪 Tests: none (planning phase)
- 📁 Files: Generated/Updated plan.md, tasks.md, data-model.md, research.md, quickstart.md.
- 🔁 Next prompts: /sp.tasks
- 🧠 Reflection: Using SpecifyPlus workflows enabled a clean transition from in-memory to persistent storage without impacting the core engine's design.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Implement JSON repository first to unlock persistence for all other features.
