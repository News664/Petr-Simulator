import type { ConditionNode } from './conditions/ast.js';
import type {
  FactionDef,
  FactionLifecycleState,
  FactionRules,
  FactionTransition,
  RunState,
} from './types.js';

/**
 * Faction lifecycle FSM. Faction System Spec v0.2 / Content Schema v0.4.
 *
 *   NONE -> CONTACTED -> ENGAGED -> COMMITTED
 *   with authored exits to OPTED_OUT / CLOSED
 *
 * State is stored as at most one registered lifecycle flag per faction; roles
 * are separate, orthogonal flags. `NONE` is the absence of a lifecycle flag and
 * is never stored.
 *
 * There is no numeric reputation, loyalty, hostility or alignment value here,
 * and the condition grammar gained no faction syntax: authored conditions read
 * lifecycle through ordinary `FLAG[...]`.
 *
 * The legal-transition table, the active-context states and the terminal states
 * all come from the Faction Registry. This module contains no faction policy of
 * its own.
 */

export class IllegalFactionTransitionError extends Error {
  constructor(
    readonly factionId: string,
    readonly from: FactionLifecycleState,
    readonly to: FactionLifecycleState,
  ) {
    super(`illegal faction transition ${factionId}: ${from} -> ${to}`);
    this.name = 'IllegalFactionTransitionError';
  }
}

/** Registered lifecycle flags for a faction, in declaration order. */
export function lifecycleFlagsOf(faction: FactionDef): string[] {
  return Object.values(faction.lifecycleFlags);
}

/** Registered role flags for a faction. */
export function roleFlagsOf(faction: FactionDef): string[] {
  return Object.values(faction.roleFlags);
}

/** Every flag the registry claims for a faction: history, lifecycle and roles. */
export function allFactionFlags(faction: FactionDef): string[] {
  return [...faction.historyFlags, ...lifecycleFlagsOf(faction), ...roleFlagsOf(faction)];
}

/**
 * Has this run ever crossed the faction's path?
 *
 * True for a historical `FAC_*_CONTACT` marker or any lifecycle flag, including
 * the terminal ones — a safe exit does not erase that contact happened.
 */
export function everContacted(flags: ReadonlySet<string>, faction: FactionDef): boolean {
  return [...faction.historyFlags, ...lifecycleFlagsOf(faction)].some((flag) => flags.has(flag));
}

/**
 * Current lifecycle state, read from flags.
 *
 * Returns `NONE` when no lifecycle flag is present. If more than one is present
 * the state is corrupt — callers that care use `lifecycleStatesHeld`.
 */
export function factionState(flags: ReadonlySet<string>, faction: FactionDef): FactionLifecycleState {
  for (const [state, flag] of Object.entries(faction.lifecycleFlags)) {
    if (flags.has(flag)) return state as FactionLifecycleState;
  }
  return 'NONE';
}

/** Every lifecycle state currently flagged. Must never exceed one entry. */
export function lifecycleStatesHeld(flags: ReadonlySet<string>, faction: FactionDef): FactionLifecycleState[] {
  const held: FactionLifecycleState[] = [];
  for (const [state, flag] of Object.entries(faction.lifecycleFlags)) {
    if (flags.has(flag)) held.push(state as FactionLifecycleState);
  }
  return held;
}

/** Roles currently held for a faction. Orthogonal to lifecycle state. */
export function factionRoles(flags: ReadonlySet<string>, faction: FactionDef): string[] {
  return Object.entries(faction.roleFlags)
    .filter(([, flag]) => flags.has(flag))
    .map(([role]) => role);
}

export function isTransitionLegal(
  rules: FactionRules,
  from: FactionLifecycleState,
  to: FactionLifecycleState,
): boolean {
  return (rules.legalTransitions[from] ?? []).includes(to);
}

/** `OPTED_OUT` / `CLOSED`: ordinary personalized faction content is over. */
export function isPersonalTerminal(rules: FactionRules, state: FactionLifecycleState): boolean {
  return rules.personalTerminalStates.includes(state);
}

/** States that grant faction route-context favor. */
export function grantsRouteContext(rules: FactionRules, state: FactionLifecycleState): boolean {
  return rules.activeContextStates.includes(state);
}

export interface AppliedTransition {
  factionId: string;
  from: FactionLifecycleState;
  to: FactionLifecycleState;
  addedRoles: string[];
  removedRoles: string[];
}

/**
 * Applies one lifecycle transition atomically.
 *
 * Either every flag change lands or none does: the new flag set is built to the
 * side and only swapped in once the transition is known to be legal, so an
 * illegal or unknown-role transition can never leave a half-applied state or
 * two lifecycle flags for one faction.
 *
 * Resolution order is Content Schema v0.4 §"Structured faction transition
 * action": read current state, validate, drop the old lifecycle flag, add the
 * new one, remove roles, add roles, and clear every role on a terminal state.
 * Historical `FAC_*_CONTACT` markers are never touched.
 *
 * Throws `IllegalFactionTransitionError` rather than applying an illegal edge.
 */
export function applyFactionTransition(
  state: RunState,
  faction: FactionDef,
  rules: FactionRules,
  transition: FactionTransition,
): AppliedTransition {
  const from = factionState(state.flags, faction);
  const to = transition.to;
  if (!isTransitionLegal(rules, from, to)) {
    throw new IllegalFactionTransitionError(faction.id, from, to);
  }

  const unknownRole = [...(transition.removeRoles ?? []), ...(transition.addRoles ?? [])].find(
    (role) => !faction.allowedRoles.includes(role) || faction.roleFlags[role] === undefined,
  );
  if (unknownRole !== undefined) {
    throw new Error(`faction ${faction.id}: role ${unknownRole} is not registered for this faction`);
  }

  const next = new Set(state.flags);
  // At most one lifecycle flag per faction: drop every one before adding.
  for (const flag of lifecycleFlagsOf(faction)) next.delete(flag);
  next.add(faction.lifecycleFlags[to]);

  const removedRoles: string[] = [];
  const addedRoles: string[] = [];
  const dropRole = (role: string): void => {
    const flag = faction.roleFlags[role]!;
    if (next.delete(flag)) removedRoles.push(role);
  };

  for (const role of transition.removeRoles ?? []) dropRole(role);
  for (const role of transition.addRoles ?? []) {
    const flag = faction.roleFlags[role]!;
    if (!next.has(flag)) {
      next.add(flag);
      addedRoles.push(role);
    }
  }
  // A safe exit or a closed case is not a relationship any more.
  if (isPersonalTerminal(rules, to)) {
    for (const role of factionRoles(next, faction)) dropRole(role);
  }

  state.flags.clear();
  for (const flag of next) state.flags.add(flag);
  return { factionId: faction.id, from, to, addedRoles, removedRoles };
}

// ---------------------------------------------------------------------------
// Static reachability analysis
// ---------------------------------------------------------------------------

interface Possible {
  canBeTrue: boolean;
  canBeFalse: boolean;
}

/**
 * Three-valued evaluation over a partial flag assignment.
 *
 * Every atom the caller does not pin is treated as free, so the result answers
 * "could this condition hold in *some* state where these flags have these
 * values?". It over-approximates (correlated numeric atoms are treated as
 * independent), which is the safe direction for a validation that rejects
 * conditions still satisfiable after a safe exit.
 */
function possible(node: ConditionNode, known: ReadonlyMap<string, boolean>): Possible {
  switch (node.kind) {
    case 'literal':
      return { canBeTrue: node.value, canBeFalse: !node.value };
    case 'not': {
      const inner = possible(node.operand, known);
      return { canBeTrue: inner.canBeFalse, canBeFalse: inner.canBeTrue };
    }
    case 'and': {
      const a = possible(node.left, known);
      const b = possible(node.right, known);
      return { canBeTrue: a.canBeTrue && b.canBeTrue, canBeFalse: a.canBeFalse || b.canBeFalse };
    }
    case 'or': {
      const a = possible(node.left, known);
      const b = possible(node.right, known);
      return { canBeTrue: a.canBeTrue || b.canBeTrue, canBeFalse: a.canBeFalse && b.canBeFalse };
    }
    case 'predicate': {
      if (node.ref !== 'FLAG') return { canBeTrue: true, canBeFalse: true };
      const value = known.get(node.id);
      if (value === undefined) return { canBeTrue: true, canBeFalse: true };
      return { canBeTrue: value, canBeFalse: !value };
    }
    default:
      return { canBeTrue: true, canBeFalse: true };
  }
}

/**
 * Can `condition` still hold once the protagonist has safely left `faction`?
 *
 * Pins every one of the faction's active lifecycle flags false and the terminal
 * flag true, leaving everything else free. Used to prove that no ordinary
 * personalized faction event survives OPTED_OUT / CLOSED.
 */
export function satisfiableAfterExit(
  condition: ConditionNode,
  faction: FactionDef,
  rules: FactionRules,
  terminal: FactionLifecycleState,
): boolean {
  const known = new Map<string, boolean>();
  for (const state of rules.activeContextStates) {
    const flag = faction.lifecycleFlags[state as Exclude<FactionLifecycleState, 'NONE'>];
    if (flag) known.set(flag, false);
  }
  for (const other of rules.personalTerminalStates) {
    const flag = faction.lifecycleFlags[other as Exclude<FactionLifecycleState, 'NONE'>];
    if (flag) known.set(flag, other === terminal);
  }
  // Roles are cleared on exit, so they cannot keep a personal chain alive either.
  for (const flag of roleFlagsOf(faction)) known.set(flag, false);
  return possible(condition, known).canBeTrue;
}
