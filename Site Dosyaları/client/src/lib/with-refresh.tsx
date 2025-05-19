import React from 'react';
import { useLocation } from 'wouter';

type WithOnClick = {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  href?: string;
  noRefresh?: boolean;
};

export function withRefresh<P extends WithOnClick>(
  WrappedComponent: React.ComponentType<P>
) {
  return React.forwardRef<HTMLButtonElement, P>((props, ref) => {
    const [, setLocation] = useLocation();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Execute original onClick if it exists
      if (props.onClick) {
        props.onClick(e);
      }

      // If this is a navigation button (has href) and noRefresh is not set
      if (props.href && !props.noRefresh) {
        e.preventDefault();
        // First navigate
        setLocation(props.href);
        // Then reload after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
      // If it's not a navigation button and noRefresh is not set, just reload
      else if (!props.noRefresh) {
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    };

    // Clone the props and override onClick
    const newProps = {
      ...props,
      onClick: handleClick,
      ref
    };

    return <WrappedComponent {...newProps} />;
  });
}
