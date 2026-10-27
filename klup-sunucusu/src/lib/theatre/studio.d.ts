// Kullandığımız @theatre/studio yüzeyinin sınırlı tipleri.
declare const studio: {
  initialize: (opts?: { usePersistentStorage?: boolean }) => void;
  ui: { hide: () => void; restore: () => void; readonly isHidden: boolean };
  setSelection: (sel: unknown[]) => void;
  createContentOfSaveFile: (projectId: string) => Record<string, unknown>;
};
export default studio;
