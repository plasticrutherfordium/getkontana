import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function loadBudgetHelpers() {
  const src = readFileSync(new URL('../site/static/app/budget_onboarding.js', import.meta.url), 'utf8');
  const sandbox = {
    window: {
      KontanaMoney: {
        toMinor(value) {
          const raw = String(value || '').trim();
          if (!raw) return 0;
          const normalized = Number(raw.replace(/,/g, '.'));
          if (!Number.isFinite(normalized)) throw new TypeError('invalid');
          return Math.trunc(normalized * 100);
        },
      },
    },
  };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  return sandbox.window.KontanaBudgetOnboarding;
}

const budget = loadBudgetHelpers();

test('buildWalletBudget enables budget and stores envelope target_minor as integers', () => {
  const result = budget.buildWalletBudget({}, {
    cadence: 'weekly',
    weekStart: 'mon',
    trackingLevel: 'big_only',
    bigSpendThresholdMinor: 2500,
    envelopes: [
      { id: 'env_food', name: 'Food', target_minor: 1200 },
      { id: 'env_fun', name: 'Fun', target_minor: 3050.99 },
    ],
    generateId: () => 'env_generated',
  });

  assert.equal(result.enabled, true);
  assert.equal(result.cadence, 'weekly');
  assert.equal(result.period_anchor.week_start, 'mon');
  assert.equal(result.envelopes.length, 2);
  assert.equal(result.envelopes[0].id, 'env_food');
  assert.equal(result.envelopes[0].tracking_level, 'big_only');
  assert.equal(result.envelopes[0].big_spend_threshold_minor, 2500);
  assert.equal(Number.isInteger(result.envelopes[0].target_minor), true);
  assert.equal(Number.isInteger(result.envelopes[1].target_minor), true);
});

test('buildWalletBudget keeps envelope ids stable when ids already exist', () => {
  const first = budget.buildWalletBudget({}, {
    cadence: 'monthly',
    weekStart: 'mon',
    trackingLevel: 'all',
    bigSpendThresholdMinor: 0,
    envelopes: [
      { id: 'env_a', name: 'A', target_minor: 1000 },
      { id: 'env_b', name: 'B', target_minor: 2000 },
    ],
    generateId: () => 'env_generated',
  });
  const second = budget.buildWalletBudget(first, {
    cadence: 'monthly',
    weekStart: 'mon',
    trackingLevel: 'all',
    bigSpendThresholdMinor: 0,
    envelopes: first.envelopes,
    generateId: () => 'env_regenerated',
  });

  assert.equal(second.envelopes[0].id, 'env_a');
  assert.equal(second.envelopes[1].id, 'env_b');
});

test('validateEnvelopeInput rejects invalid names and targets', () => {
  const missingName = budget.validateEnvelopeInput({ name: '   ', targetInput: '10.00' });
  const invalidTarget = budget.validateEnvelopeInput({ name: 'Food', targetInput: 'abc' });
  const negativeTarget = budget.validateEnvelopeInput({ name: 'Food', targetInput: '-1' });

  assert.equal(missingName.ok, false);
  assert.equal(missingName.error, 'name_required');
  assert.equal(invalidTarget.ok, false);
  assert.equal(invalidTarget.error, 'invalid_target');
  assert.equal(negativeTarget.ok, false);
  assert.equal(negativeTarget.error, 'invalid_target');
});
