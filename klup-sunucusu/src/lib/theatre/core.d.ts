// Kullandığımız @theatre/core yüzeyinin sınırlı tipleri (paketin global tip eklerini projeye sokmamak için).
export type NumberProp = { readonly __number: true };
export type Types = { number: (def: number, opts?: { range?: [number, number]; nudgeMultiplier?: number }) => NumberProp };
export type ISequence = { position: number; readonly pointer: unknown; play: (opts?: { iterationCount?: number; range?: [number, number]; rate?: number }) => Promise<boolean>; pause: () => void };
export type ISheetObject<V> = { readonly value: V; onValuesChange: (cb: (v: V) => void) => () => void };
export type ISheet = { readonly sequence: ISequence; object: <P extends Record<string, NumberProp>>(key: string, props: P) => ISheetObject<{ [K in keyof P]: number }> };
export type IProject = { readonly ready: Promise<void>; readonly address: { projectId: string }; sheet: (id: string, instance?: string) => ISheet };
export declare function getProject(id: string, config?: { state?: unknown }): IProject;
export declare const types: Types;
export declare function onChange<T>(pointer: unknown, cb: (v: T) => void): () => void;
export declare function val<T>(pointer: unknown): T;
