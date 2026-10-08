import * as React from "react";

/**
 * Sellora icon set.
 *
 * One consistent line language for every icon in the product: 24×24 grid,
 * round caps/joins, 1.75 stroke at rest and a slightly heavier 2.1 stroke when
 * the icon marks an active state. Icons inherit `currentColor` so they can be
 * tinted by the parent, and they are always `aria-hidden` — the accessible
 * name belongs to the surrounding control.
 */
export type IconProps = {
  size?: number;
  className?: string;
  active?: boolean;
  strokeWidth?: number;
};

function Svg({
  size = 20,
  className,
  active,
  strokeWidth,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth ?? (active ? 2.1 : 1.75)}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/* ------------------------------------------------------------------ product */

export function IconDashboard(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="2.2" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="2.2" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2.2" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2.2" />
    </Svg>
  );
}

export function IconInbox(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M20.5 12.4c0 4-3.8 7.2-8.5 7.2-1 0-2-.15-2.9-.42L4.6 21l1.3-3.5A6.9 6.9 0 0 1 3.5 12.4c0-4 3.8-7.2 8.5-7.2s8.5 3.2 8.5 7.2Z" />
      <path d="M8.6 12.2h.01M12 12.2h.01M15.4 12.2h.01" />
    </Svg>
  );
}

export function IconBolt(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M13.6 2.5 4.9 13.1a.6.6 0 0 0 .47.98h5.2l-1.17 7.42 8.7-10.6a.6.6 0 0 0-.47-.98h-5.2L13.6 2.5Z" />
    </Svg>
  );
}

export function IconBag(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5.4 8h13.2l1 11.2a1.6 1.6 0 0 1-1.6 1.75H6a1.6 1.6 0 0 1-1.6-1.75L5.4 8Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </Svg>
  );
}

export function IconFlame(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 2.8c3.1 3.1 6.2 5.6 6.2 9.6A6.2 6.2 0 0 1 12 21a6.2 6.2 0 0 1-6.2-8.6c1-2 2.2-3 3-4.9.2 1.4.6 2.4 1.4 3.2 1-2 .6-4.6 1.8-6.9Z" />
      <path d="M12 21a2.7 2.7 0 0 0 2.5-3.8c-.5-1.2-1.5-1.7-2.5-3-.9 1.3-2 1.8-2.5 3A2.7 2.7 0 0 0 12 21Z" />
    </Svg>
  );
}

export function IconBell(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M18 9a6 6 0 1 0-12 0c0 4-1.5 5.2-1.5 5.2h15S18 13 18 9Z" />
      <path d="M10.3 18a2 2 0 0 0 3.4 0" />
    </Svg>
  );
}

export function IconCog(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.8v2.4M12 18.8v2.4M4.5 7.5l2.1 1.2M17.4 15.3l2.1 1.2M4.5 16.5l2.1-1.2M17.4 8.7l2.1-1.2" />
    </Svg>
  );
}

export function IconSparkle(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 3.2 13.7 9l5.8 1.7-5.8 1.7L12 18.2 10.3 12.4 4.5 10.7 10.3 9 12 3.2Z" />
      <path d="M18.6 3.4l.6 1.8 1.8.6-1.8.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6.6-1.8Z" />
    </Svg>
  );
}

export function IconInstagram(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5.2" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.1 6.9h.01" />
    </Svg>
  );
}

export function IconCard(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="2.8" y="5" width="18.4" height="14" rx="3" />
      <path d="M2.8 10h18.4M6.5 14.5h3.5" />
    </Svg>
  );
}

export function IconShield(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 2.9 5 5.6v5.6c0 4 2.8 7.6 7 9.9 4.2-2.3 7-5.9 7-9.9V5.6L12 2.9Z" />
      <path d="m9.2 12 2 2 3.6-3.8" />
    </Svg>
  );
}

export function IconChart(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 20V4M4 20h16" />
      <path d="M8 16v-4M12.5 16V8M17 16v-6" />
    </Svg>
  );
}

/* ------------------------------------------------------------------ controls */

export function IconPlus(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function IconSearch(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 3.2 3.2" />
    </Svg>
  );
}

export function IconClose(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="m6 6 12 12M18 6 6 18" />
    </Svg>
  );
}

export function IconGrid(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="6" cy="6" r="1.6" />
      <circle cx="12" cy="6" r="1.6" />
      <circle cx="18" cy="6" r="1.6" />
      <circle cx="6" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="18" cy="12" r="1.6" />
      <circle cx="6" cy="18" r="1.6" />
      <circle cx="12" cy="18" r="1.6" />
      <circle cx="18" cy="18" r="1.6" />
    </Svg>
  );
}

export function IconMenu(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  );
}

export function IconChevronLeft(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="m14.5 6-6 6 6 6" />
    </Svg>
  );
}

export function IconChevronRight(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="m9.5 6 6 6-6 6" />
    </Svg>
  );
}

export function IconArrowRight(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </Svg>
  );
}

export function IconCheck(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="m5 12.8 4.3 4.2L19 6.6" />
    </Svg>
  );
}

export function IconCheckCircle(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.2 2.7 2.6L16 9.4" />
    </Svg>
  );
}

export function IconAlert(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 16.5h.01" />
    </Svg>
  );
}

export function IconInfo(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.2M12 7.8h.01" />
    </Svg>
  );
}

export function IconClock(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 1.8" />
    </Svg>
  );
}

export function IconUser(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="8.5" r="3.7" />
      <path d="M4.8 20c.9-3.4 3.8-5.3 7.2-5.3s6.3 1.9 7.2 5.3" />
    </Svg>
  );
}

export function IconLogout(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M15 4.5h2.8A2.2 2.2 0 0 1 20 6.7v10.6a2.2 2.2 0 0 1-2.2 2.2H15" />
      <path d="M11 8 7 12l4 4M7 12h9" />
    </Svg>
  );
}

export function IconUpload(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 16V4.5M8 8l4-3.5L16 8" />
      <path d="M4.5 15v3A2.5 2.5 0 0 0 7 20.5h10a2.5 2.5 0 0 0 2.5-2.5v-3" />
    </Svg>
  );
}

export function IconSend(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M20.5 3.5 3.6 10.2a.5.5 0 0 0 .05.94l6.4 1.8 1.8 6.4a.5.5 0 0 0 .94.05L20.5 3.5Z" />
      <path d="m10.05 12.95 4.2-4.2" />
    </Svg>
  );
}

export function IconLink(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M10.5 13.5a3.6 3.6 0 0 0 5.1 0l2.6-2.6a3.6 3.6 0 0 0-5.1-5.1l-1 1" />
      <path d="M13.5 10.5a3.6 3.6 0 0 0-5.1 0l-2.6 2.6a3.6 3.6 0 0 0 5.1 5.1l1-1" />
    </Svg>
  );
}

export function IconPulse(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M2.8 12.5h3.4l2-5.5 3.3 10.5 2.3-6 1.7 3.5h5.7" />
    </Svg>
  );
}
