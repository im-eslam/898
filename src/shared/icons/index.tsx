import { FLIP_IN_RTL, PATHS, type IconName } from "./data";

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

function Icon({ name, size = 24, strokeWidth = 1.8, className }: IconProps) {
  const flip = FLIP_IN_RTL.has(name) ? "rtl:-scale-x-100" : "";
  const classes = [flip, className].filter(Boolean).join(" ");

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={classes || undefined}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

export { PATHS, type IconName, Icon };
