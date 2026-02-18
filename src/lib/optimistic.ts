interface OptimisticMutationParams<TSnapshot> {
  getSnapshot: () => TSnapshot;
  apply: () => void;
  commit: () => Promise<void>;
  rollback: (snapshot: TSnapshot) => void;
  onError?: (error: unknown) => void;
}

export const runOptimisticMutation = async <TSnapshot>({
  getSnapshot,
  apply,
  commit,
  rollback,
  onError,
}: OptimisticMutationParams<TSnapshot>) => {
  const snapshot = getSnapshot();
  apply();

  try {
    await commit();
    return true;
  } catch (error) {
    rollback(snapshot);
    onError?.(error);
    return false;
  }
};
