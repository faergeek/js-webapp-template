import invariant from 'tiny-invariant';

type ParseResult<T> =
  | { ok: true; nextIndex: number; value: T }
  | { ok: false; index: number; expected: string[] };

function ok<const T>(nextIndex: number, value: T): ParseResult<T> {
  return { ok: true, nextIndex, value };
}

function err(index: number, expected: string[]): ParseResult<never> {
  return { ok: false, index, expected };
}

type Parse<T> = (input: string, index: number) => ParseResult<T>;

class Parser<T = never> {
  readonly parse;

  constructor(parse: Parse<T>) {
    this.parse = parse;
  }

  label(expected: string[]) {
    return new Parser((input, index): ParseResult<T> => {
      const result = this.parse(input, index);

      return result.ok
        ? result
        : result.index === index
          ? err(index, expected)
          : result;
    });
  }

  or<U>(other: Parser<U>) {
    return new Parser((input, index): ParseResult<T | U> => {
      const first = this.parse(input, index);
      if (first.ok) return first;
      if (first.index !== index) return err(first.index, first.expected);

      const second = other.parse(input, index);
      if (second.ok) return second;
      if (second.index !== index) return err(second.index, second.expected);

      return err(second.index, first.expected.concat(second.expected));
    });
  }

  and<U>(other: Parser<U>) {
    return new Parser((input, index) => {
      const x = this.parse(input, index);
      if (!x.ok) return x;

      const y = other.parse(input, x.nextIndex);
      if (!y.ok) return y;

      return ok(y.nextIndex, [x.value, y.value]);
    });
  }

  left(other: Parser<unknown>) {
    return new Parser((input, index) => {
      const left = this.parse(input, index);
      if (!left.ok) return left;

      const right = other.parse(input, left.nextIndex);
      if (!right.ok) return right;

      return { ...left, nextIndex: right.nextIndex };
    });
  }

  right<U>(other: Parser<U>) {
    return new Parser((input, index) => {
      const left = this.parse(input, index);
      if (!left.ok) return left;

      return other.parse(input, left.nextIndex);
    });
  }

  pick() {
    return new Parser((input, index) => {
      const result = this.parse(input, index);

      return result.ok ? ok(index, result.value) : result;
    });
  }

  map<U>(f: (value: T) => U) {
    return new Parser<U>((input, index) => {
      const x = this.parse(input, index);

      return x.ok ? { ...x, value: f(x.value) } : x;
    });
  }

  until(stop: Parser<unknown>) {
    return new Parser((input, index) => {
      const value: T[] = [];
      let stopResult = stop.parse(input, index);
      while (index < input.length && !stopResult.ok) {
        const result = this.parse(input, index);
        if (!result.ok) return result;

        value.push(result.value);
        index = result.nextIndex;
        stopResult = stop.parse(input, index);
      }

      return ok(index, value);
    });
  }

  oneOrMore() {
    return new Parser((input, index) => {
      let result = this.parse(input, index);
      if (!result.ok) return result;

      const value: T[] = [result.value];

      index = result.nextIndex;
      while (true) {
        result = this.parse(input, index);

        if (!result.ok) {
          return result.index === index
            ? ok(index, value)
            : err(result.index, result.expected);
        }

        value.push(result.value);
        index = result.nextIndex;
      }
    });
  }
}

function literal(str: string) {
  return new Parser((input, index) =>
    input.indexOf(str, index) === index
      ? ok(index + str.length, str)
      : err(index, [`'${str}'`]),
  );
}

function match(re: RegExp) {
  invariant(re.flags.includes('y'));

  return new Parser((input, index) => {
    re.lastIndex = index;
    const result = re.exec(input);

    return result
      ? ok(re.lastIndex, result[0])
      : err(index, [`/${re.source}/`]);
  });
}

const end = new Parser((input, index) =>
  index === input.length ? ok(index + 1, null) : err(index, ['end of input']),
);

const dollar = literal('$');
const plain = match(/[^./[]+/y);
const escapeStop = literal(']');

const escaped = literal('[')
  .right(
    match(/[^/\]]+/y)
      .label(["anything except '/'"])
      .until(escapeStop)
      .map(xs => xs.join('')),
  )
  .left(escapeStop);

const separator = match(/[./]/y);

const staticSegmentOrSegmentName = plain
  .or(escaped)
  .oneOrMore()
  .map(xs => xs.join(''));

const segment = dollar
  .right(
    staticSegmentOrSegmentName
      .map(xs => `:${xs}`)
      .label(['dynamic segment name'])
      .or(
        end
          .pick()
          .map(() => '*')
          .label(['splat']),
      ),
  )
  .or(staticSegmentOrSegmentName.label(['path segment']));

const segments = segment
  .and(separator.right(segment).until(end))
  .map(([first, rest]) => [first].concat(rest));

const listFormat = new Intl.ListFormat('en-US', { type: 'disjunction' });

export function parseSegments(input: string) {
  const result = segments.parse(input, 0);

  if (!result.ok) {
    throw new Error(
      ['Failed to parse segments']
        .concat(
          [
            `'${input}'`,
            `${' '.repeat(
              result.index,
            )} ^ expected ${listFormat.format(result.expected)}`,
          ].map(s => (s ? `  ${s}` : s)),
        )
        .join('\n'),
    );
  }

  return result.value;
}
