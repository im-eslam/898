import { PATHS, type IconName } from "./data";

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

function Icon({ name, size = 24, strokeWidth = 1.8, className }: IconProps) {
  const classes = [className].filter(Boolean).join(" ");

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
