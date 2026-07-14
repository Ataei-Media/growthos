/**
 * Prompt versioning.
 *
 * Every prompt is versioned. When an audit runs, the exact prompt version used
 * is stored alongside its output (see `audits.prompt_version` /
 * `audit_sections.prompt_version`) so results are reproducible and we can
 * measure the impact of prompt changes over time.
 *
 * This module is the registry contract. Concrete prompt templates are added as
 * the audit/generator engines are built (Milestone 5/6). Never mutate a
 * published version in place — publish a new one.
 */

export interface PromptTemplate {
  /** Stable identifier, e.g. "homepage-audit". */
  key: string;
  /** Semantic-ish version, e.g. "v1", "v2". */
  version: string;
  /** Human note describing what changed in this version. */
  description: string;
  /** Builds the system prompt (may be static). */
  buildSystem: (input: Record<string, unknown>) => string;
  /** Builds the user prompt from structured context. */
  buildUser: (input: Record<string, unknown>) => string;
}

const templates = new Map<string, PromptTemplate>();

function id(key: string, version: string) {
  return `${key}@${version}`;
}

/** Register a prompt template version. */
export function registerPrompt(template: PromptTemplate) {
  templates.set(id(template.key, template.version), template);
}

/** Resolve a specific version of a prompt. */
export function getPrompt(key: string, version: string): PromptTemplate {
  const template = templates.get(id(key, version));
  if (!template) {
    throw new Error(`Prompt "${id(key, version)}" is not registered.`);
  }
  return template;
}

/** Latest registered version for a prompt key (highest by registration order). */
export function getLatestPrompt(key: string): PromptTemplate {
  const matches = [...templates.values()].filter((t) => t.key === key);
  if (matches.length === 0) {
    throw new Error(`No versions registered for prompt "${key}".`);
  }
  return matches[matches.length - 1];
}
