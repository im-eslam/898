interface RollingNumberProps {
  text: string;
  className?: string;
}

interface DigitSlotProps {
  digit: number;
}

interface NumberGroupProps {
  text: string;
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

const isDigit = (char: string) => /\d/.test(char);

function DigitSlot(props: DigitSlotProps) {
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

function NumberGroup(props: NumberGroupProps) {
  const chars = [...props.text];
  const digitCount = chars.filter(isDigit).length;
  let digitsSeen = 0;

  return (
    <span dir="ltr" className={STYLES.numberGroup}>
      {chars.map((char, index) => {
        if (!isDigit(char)) {
          return (
            <span key={`sep-${index}`} className={STYLES.plain}>
              {char}
            </span>
          );
        }

        digitsSeen += 1;
        const placeValue = digitCount - digitsSeen;
        return <DigitSlot key={`digit-${placeValue}`} digit={Number(char)} />;
      })}
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
