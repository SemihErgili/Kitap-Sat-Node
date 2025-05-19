declare module 'lucide-react' {
  import { ComponentType } from 'react';

  interface IconProps {
    size?: number | string;
    color?: string;
    strokeWidth?: number;
    className?: string;
  }

  export const Search: ComponentType<IconProps>;
  export const User: ComponentType<IconProps>;
  export const ShoppingCart: ComponentType<IconProps>;
  export const Menu: ComponentType<IconProps>;
  export const X: ComponentType<IconProps>;
  export const Book: ComponentType<IconProps>;
  export const PlusCircle: ComponentType<IconProps>;
  export const Edit: ComponentType<IconProps>;
  export const Trash2: ComponentType<IconProps>;
  export const Tag: ComponentType<IconProps>;
  export const List: ComponentType<IconProps>;
}
