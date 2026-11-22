interface RollingNumberProps {
  text: string;
  className?: string;
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const STYLES = {
  root: "relative inline-flex items-baseline tabular-nums",
  visual: "inline-flex items-baseline",
  plain: "whitespace-pre",
  numberGroup: "inline-flex",
  slot: "inline-block h-[1lh] overflow-clip",
  column:
    "flex flex-col transition-transform duration-300 ease-smooth motion-reduce:transition-none",
  digit: "block h-[1lh]",
  srOnly: "sr-only",
} as const;

function DigitSlot(props: { digit: number }) {
  return (
    <span className={STYLES.slot}>
      <span
        className={STYLES.column}
        style={{ transform: `translateY(${-props.digit}lh)` }}
      >
        {DIGITS.map((value) => (
          <span key={value} className={STYLES.digit}>
            {value}
          </span>
        ))}
      </span>
    </span>
  );
}

function NumberGroup(props: { text: string }) {
  const chars = [...props.text];
  let place = chars.filter((char) => /\d/.test(char)).length;

  return (
    <span dir="ltr" className={STYLES.numberGroup}>
      {chars.map((char, index) =>
        /\d/.test(char) ? (
          <DigitSlot key={`d${--place}`} digit={Number(char)} />
        ) : (
          <span key={`s${chars.length - index}`} className={STYLES.plain}>
            {char}
          </span>
        )
      )}
    </span>
  );
}

export function RollingNumber(props: RollingNumberProps) {
  const rootClass = [STYLES.root, props.className].filter(Boolean).join(" ");

  return (
    <span className={rootClass}>
      <span className={STYLES.srOnly}>{props.text}</span>
      <span aria-hidden="true" className={STYLES.visual}>
        {props.text.split(/(\d[\d,.]*)/).map((part, index) =>
          index % 2 === 1 ? (
            <NumberGroup key={index} text={part} />
          ) : (
            part !== "" && (
              <span key={index} className={STYLES.plain}>
                {part}
              </span>
            )
          )
        )}
      </span>
    </span>
  );
}
