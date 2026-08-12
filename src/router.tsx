import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { preloadRoute } from '@/routeModules';
import { useRoutePath } from '@/routeState';

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  to: string;
  children: ReactNode;
};

export function Link({
  to,
  children,
  onFocus,
  onPointerDown,
  onPointerEnter,
  ...props
}: LinkProps) {
  const prepareRoute = () => void preloadRoute(to);
  return (
    <a
      href={`#${to}`}
      onFocus={(event) => {
        prepareRoute();
        onFocus?.(event);
      }}
      onPointerDown={(event) => {
        prepareRoute();
        onPointerDown?.(event);
      }}
      onPointerEnter={(event) => {
        prepareRoute();
        onPointerEnter?.(event);
      }}
      {...props}
    >
      {children}
    </a>
  );
}

type NavLinkProps = Omit<LinkProps, 'className'> & {
  end?: boolean;
  className?: string | ((state: { isActive: boolean }) => string);
};

export function NavLink({ to, end = false, className, children, ...props }: NavLinkProps) {
  const path = useRoutePath();
  const isActive = end ? path === to : path === to || path.startsWith(`${to}/`);
  const resolvedClassName = typeof className === 'function' ? className({ isActive }) : className;
  return (
    <Link
      to={to}
      className={resolvedClassName}
      aria-current={isActive ? 'page' : undefined}
      {...props}
    >
      {children}
    </Link>
  );
}
