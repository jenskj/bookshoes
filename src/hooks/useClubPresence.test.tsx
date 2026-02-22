import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { useClubPresence } from './useClubPresence';
import { useCurrentUserStore } from './useCurrentUserStore';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

vi.mock('@lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}));

const HookHarness = ({ clubId }: { clubId?: string }) => {
  useClubPresence(clubId);
  return null;
};

describe('useClubPresence', () => {
  let root: Root;
  let container: HTMLDivElement;

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    useCurrentUserStore.setState({
      members: undefined,
      presenceByUserId: {},
    });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('does not trigger a render loop when members are undefined', () => {
    let updates = 0;
    const unsubscribe = useCurrentUserStore.subscribe(() => {
      updates += 1;
    });

    expect(() => {
      act(() => {
        root.render(<HookHarness />);
      });
    }).not.toThrow();

    act(() => {
      root.render(<HookHarness />);
    });

    unsubscribe();

    expect(updates).toBeLessThan(4);
  });
});
