const CONFIG = {
  colors: {
    base: "#d7c4a7",
    cream: "#eadbc3",
    sand: "#c5ad8c",
    ice: "#9ec7d1",
    teal: "#005569",
  },
  tile: {
    width: 270,
    height: 180,
    offsetX: -30,
    offsetY: -10,
  },
  band: {
    height: "90dvh",
    radialShape: "ellipse 70% 42% at 50% 30%",
    radialOpacity: "90%",
    linearFadeStart: "50%",
  },
  classes: {
    root: "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
    band: "absolute inset-x-0 top-0",
  },
} as const;

const TILE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="${CONFIG.tile.width}" height="${CONFIG.tile.height}" viewBox="0 0 ${CONFIG.tile.width} ${CONFIG.tile.height}">
  <g transform="translate(0 0) scale(0.75)">
    <rect width="120" height="120" fill="${CONFIG.colors.cream}" fill-opacity=".9"/>
    <path d="M0 120V0A120 120 0 0 1 120 120Z" fill="${CONFIG.colors.ice}" fill-opacity=".5"/>
  </g>
  <g transform="translate(90 0) scale(0.75)">
    <path d="M30 120V55A30 30 0 0 1 90 55V120Z" fill="${CONFIG.colors.sand}" fill-opacity=".9"/>
  </g>
  <g transform="translate(180 0) scale(0.75)">
    <rect width="120" height="120" fill="${CONFIG.colors.cream}" fill-opacity=".9"/>
    <path d="M48 120A12 12 0 0 1 72 120M39 120A21 21 0 0 1 81 120M30 120A30 30 0 0 1 90 120M21 120A39 39 0 0 1 99 120M12 120A48 48 0 0 1 108 120M3 120A57 57 0 0 1 117 120" fill="none" stroke="${CONFIG.colors.teal}" stroke-opacity=".14" stroke-width="4"/>
  </g>
  <g transform="translate(0 90) scale(0.75)">
    <rect width="120" height="120" fill="${CONFIG.colors.sand}" fill-opacity=".6"/>
    <path d="M120 0H0A120 120 0 0 0 120 120Z" fill="${CONFIG.colors.cream}" fill-opacity=".55"/>
  </g>
  <g transform="translate(90 90) scale(0.75)">
    <rect width="120" height="120" fill="${CONFIG.colors.ice}" fill-opacity=".35"/>
    <circle cx="60" cy="60" r="34" fill="${CONFIG.colors.cream}" fill-opacity=".7"/>
    <path d="M60 26A34 34 0 0 1 60 94Z" fill="${CONFIG.colors.teal}" fill-opacity=".12"/>
  </g>
  <g transform="translate(180 90) scale(0.75)">
    <rect x="50" y="10" width="20" height="100" rx="10" fill="${CONFIG.colors.sand}" fill-opacity=".8"/>
  </g>
</svg>`.trim();

const PATTERN_URL = `url("data:image/svg+xml,${encodeURIComponent(TILE_SVG)}")`;

const ROOT_STYLE = {
  backgroundColor: CONFIG.colors.base,
} as const;

const band_STYLE = {
  height: CONFIG.band.height,
  backgroundImage: [
    `radial-gradient(${CONFIG.band.radialShape}, color-mix(in srgb, ${CONFIG.colors.base} ${CONFIG.band.radialOpacity}, transparent), transparent)`,
    `linear-gradient(to bottom, transparent ${CONFIG.band.linearFadeStart}, ${CONFIG.colors.base})`,
    PATTERN_URL,
  ].join(", "),
  backgroundSize: `auto, auto, ${CONFIG.tile.width}px ${CONFIG.tile.height}px`,
  backgroundPosition: `0 0, 0 0, ${CONFIG.tile.offsetX}px ${CONFIG.tile.offsetY}px`,
  backgroundRepeat: "no-repeat, no-repeat, repeat",
} as const;

function Background() {
  return (
    <div aria-hidden="true" className={CONFIG.classes.root} style={ROOT_STYLE}>
      <div className={CONFIG.classes.band} style={band_STYLE} />
    </div>
  );
}

export { Background };
