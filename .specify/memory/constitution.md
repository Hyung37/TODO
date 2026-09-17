<!--
Sync Impact Report
- Version change: scaffold -> 1.0.0
- Modified principles: none; initial constitution established
- Added sections: Core Principles, Technical Constraints, Development Workflow,
	Governance
- Removed sections: none
- Follow-up TODOs: Confirm the original ratification date.
-->

# mini-todo-sqlite Constitution

## Core Principles

### I. App Router and TypeScript

The application MUST use the Next.js App Router and TypeScript for application
code. New code MUST preserve the existing App Router structure and MUST NOT
introduce JavaScript alternatives without an approved amendment.

### II. JSON API Contract

Every API response MUST use JSON, including success and error responses. API
routes MUST expose stable, documented response shapes so clients can handle
results without parsing presentation-specific text.

### III. Explicit Types

Application code MUST NOT use the `any` type. Data crossing an API, persistence,
or component boundary MUST have an explicit or safely inferred TypeScript type;
unknown external data MUST be validated before use.

### IV. Specification Before Implementation

A user-visible feature MUST be described in the applicable Spec Kit artifacts
before implementation begins. The specification defines behavior, the plan
defines technical choices, and the task list defines executable work. Changes
that alter scope MUST update the relevant artifact before code is changed.

### V. Verifiable Changes

Every implementation change MUST have a focused validation step. At minimum,
the project MUST pass `npm run lint` and `npm run build` before a feature is
considered complete, unless a documented environment limitation prevents one
of them.

## Technical Constraints

- The repository MUST remain compatible with the Next.js App Router and the
	TypeScript configuration already committed to the project.
- API behavior MUST remain machine-readable JSON; human-readable messages MAY
	appear only as fields inside a JSON response.
- Dependencies MUST be added only when they directly support a specified
	requirement and their effect on local development MUST be documented in the
	implementation plan.

## Development Workflow

- Work MUST proceed through the Spec Kit sequence appropriate to the change:
	constitution, specify, clarify, plan, tasks, implementation, and validation.
- Reviews MUST check the changed behavior against the active specification and
	confirm that API responses remain JSON and that no `any` type was introduced.
- Unrelated refactoring MUST remain outside the feature change unless it is
	required to satisfy a stated acceptance criterion or quality gate.

## Governance

This constitution is the governing project guidance for feature specifications,
plans, tasks, implementation, and review. An amendment MUST describe its reason,
affected principles, and any migration or validation impact in the Sync Impact
Report before the file is committed.

The constitution uses semantic versioning. A MAJOR version removes or
redefines a principle, a MINOR version adds or materially expands a principle or
governance section, and a PATCH version clarifies wording without changing
required behavior. Every feature review MUST verify compliance with the current
version. Any exception MUST be documented in the relevant plan and approved by
the project owner before implementation.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): confirm original adoption date | **Last Amended**: 2026-09-16
