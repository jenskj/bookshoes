import { describe, expect, it, vi } from 'vitest';
import { runOptimisticMutation } from './optimistic';

describe('runOptimisticMutation', () => {
  it('commits optimistic state on success', async () => {
    let state = 1;

    const didSucceed = await runOptimisticMutation({
      getSnapshot: () => state,
      apply: () => {
        state = 2;
      },
      commit: async () => {},
      rollback: (snapshot) => {
        state = snapshot;
      },
    });

    expect(didSucceed).toBe(true);
    expect(state).toBe(2);
  });

  it('rolls back optimistic state on failure', async () => {
    let state = 1;
    const onError = vi.fn();

    const didSucceed = await runOptimisticMutation({
      getSnapshot: () => state,
      apply: () => {
        state = 2;
      },
      commit: async () => {
        throw new Error('failed');
      },
      rollback: (snapshot) => {
        state = snapshot;
      },
      onError,
    });

    expect(didSucceed).toBe(false);
    expect(state).toBe(1);
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
