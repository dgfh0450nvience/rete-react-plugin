import * as React from 'react';
import { Customize, Item } from '../types';
export declare const ItemStyle: import("styled-components").StyledComponent<"div", any, {
    hasSubitems?: boolean | undefined;
}, never>;
export declare const SubitemStyles: import("styled-components").StyledComponent<"div", any, {}, never>;
declare type Props = {
    data: Item;
    delay: number;
    hide(): void;
    children: React.ReactNode;
    components?: Pick<Customize, 'item' | 'subitems'>;
};
export declare function ItemElement(props: Props): React.JSX.Element;
export {};
//# sourceMappingURL=Item.d.ts.map