import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { useRoutePath } from '@/routeState';

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  to: string;
  children: ReactNode;
};

export function Link({ to, children, ...props }: LinkProps) {
  return (
    <a href={`#${to}`} {...props}>
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
