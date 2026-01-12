<!--
Sync Impact Report
- Version change: null -> 1.0.0
- List of modified principles (old title -> new title if renamed):
    - [PRINCIPLE_1_NAME] -> I. Context7 Safety Protocol (Anti-Hallucination)
    - [PRINCIPLE_2_NAME] -> II. Branch-Gated Execution (Phase Control)
    - [PRINCIPLE_3_NAME] -> III. Spec-Driven Development (SDD)
    - [PRINCIPLE_4_NAME] -> IV. Presentation-Agnostic Core
    - [PRINCIPLE_5_NAME] -> V. Async-First & Tool-Centric Design
    - [PRINCIPLE_6_NAME] -> VI. Zero-Knowledge Assumption
- Added sections: Core Principles, Technical Invariants & Standards, Governance
- Removed sections: None
- Templates requiring updates (✅ updated / ⚠ pending) with file paths:
    - .specify/templates/plan-template.md (✅ updated)
    - .specify/templates/spec-template.md (✅ updated)
    - .specify/templates/tasks-template.md (✅ updated)
- Follow-up TODOs if any placeholders intentionally deferred: None
-->

# Evolve Todo App Constitution

## Core Principles

### I. Context7 Safety Protocol (Anti-Hallucination)
The agent MUST NOT rely on its internal weights for API syntax, library configurations, or best practices. Before implementing any feature involving external libraries (e.g., `uv`, `sqlmodel`, `dapr`, `fastapi`), the agent MUST invoke `context7:resolve-library-id` followed by `context7:query-docs` to retrieve the latest documentation. This ensures the implementation matches the actual, current state of the technology rather than potentially outdated training data.

### II. Branch-Gated Execution (Phase Control)
The project follows a strictly phased expansion. The agent's technical focus and allowed tools are restricted by the current branch prefix.
- **Phase I (`phase-1/*`)**: Core CLI & Logic (Python 3.13+, UV). No Web/DB code.
- **Phase II (`phase-2/*`)**: Full-Stack (Next.js 16+, FastAPI, SQLModel, Neon DB).
- **Phase III (`phase-3/*`)**: AI Intelligence (OpenAI Agents, MCP SDK).
- **Phase IV (`phase-4/*`)**: Orchestration (K8s, Minikube, Helm).
- **Phase V (`phase-5/*`)**: Distributed (Dapr, Kafka, Cloud).
Do not implement tech from a later phase in an earlier branch unless defining abstract interfaces for forward compatibility.

### III. Spec-Driven Development (SDD)
No code implementation shall begin without a validated `spec.md`, `plan.md`, and `tasks.md`. Every change must be small, testable, and explicitly mapped to a task. The agent must prioritize architectural integrity and maintenance over raw implementation speed.

### IV. Presentation-Agnostic Core
The core business logic and models must be strictly decoupled from the presentation layer (CLI or Web). The "Todo Engine" must be developed as a standalone service/library that can be imported by different interfaces without modification. This ensures the Phase I CLI code remains viable for the Phase II Web API transition.

### V. Async-First & Tool-Centric Design
All I/O operations (file, network, database) must be `async`. Every core function should be designed as a modular "Tool" with comprehensive docstrings and explicit type hints. This prepares the codebase for high-concurrency environments (Dapr/FastAPI) and seamless integration with AI Agent toolboxes via MCP.

### VI. Zero-Knowledge Assumption
The agent must verify every implementation detail against live documentation via Context7. Any implementation that contradicts verified documentation must be flagged immediately. This principle eliminates "hallucination-driven development" and ensures the project uses the most secure and performant patterns available.

## Additional Constitution Areas

### VII. Skill Creation Constitution
- Define rules for creating, validating, and evolving skills
- Specify boundaries, responsibilities, and extension rules
- Enforce consistency and reuse

### VIII. Personalized Agent Constitution
- Define how personalized agents are created and managed
- Specify data boundaries, behavior constraints, and customization rules
- Prevent uncontrolled agent behavior

### IX. Test-Driven Development (TDD) Constitution
- Define mandatory TDD workflow
- Specify test types, order of implementation, and acceptance criteria
- Define failure handling and refactoring rules

## Technical Invariants & Standards

- **Dependency Management**: Use `UV` exclusively for Python. Direct use of `pip` or `venv` is prohibited.
- **Data Integrity**: Use `Pydantic` for all data validation and `SQLModel` for ORM-ready schemas.
- **Typing**: Strict Python type hints (PEP 484) are mandatory for all public-facing and internal core functions.
- **Interfaces**: Prioritize Python result wrappers or clear exception hierarchies over silent failures.

## Development Workflow

- **Preparation**: Use `EnterPlanMode` for any task requiring architectural changes or multi-phase integration.
- **Execution**: Follow the `tasks.md` order. Commit after each completed task.
- **Validation**: All tasks must include an "Independent Test" description. Code is not complete until it passes its defined acceptance criteria.

## Governance

- **Amendment**: Updates to this constitution require a version bump and a Sync Impact Report. Changes should be discussed with the architect (User) prior to execution via `/sp.constitution`.
- **Compliance**: Every PR and plan must be checked against these principles. Violations must be explicitly justified in the "Complexity Tracking" section of the plan.
- **Versioning**: MAJOR.MINOR.PATCH.
    - MAJOR: Backward incompatible changes to core principles.
    - MINOR: New principles or significant technical expansions.
    - PATCH: Wording, typos, or minor clarifications.

<!--Sync Impact Report
-Version change: 1.0.0 -> 1.1.0
-List of modified principles (old title -> new title if renamed):
    - None
-Added sections: Additional Constitution Areas (Skill Creation, Personalized Agent, TDD)
-Removed sections: None
-Templates requiring updates (✅ updated / ⚠ pending) with file paths:
    - .specify/templates/plan-template.md (⚠ pending)
    - .specify/templates/spec-template.md (⚠ pending)
    - .specify/templates/tasks-template.md (⚠ pending)
-Follow-up TODOs if any placeholders intentionally deferred: Update templates to reflect new principles
-->

**Version**: 1.1.0 | **Ratified**: 2025-12-31 | **Last Amended**: 2026-01-09
