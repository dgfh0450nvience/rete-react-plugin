export declare function copyEvent<T extends Event & Record<string, any>>(e: T): T;
declare const rootPrefix = "__reactContainer$";
declare type Keys = `${typeof rootPrefix}${string}` | '_reactRootContainer';
declare type ReactNode = {
    [key in Keys]?: unknown;
} & HTMLElement;
export declare function findReactRoot(element: HTMLElement): ReactNode | undefined;
export {};
//# sourceMappingURL=utils.d.ts.map