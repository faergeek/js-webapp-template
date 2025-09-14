import type { Arbitrary } from 'fast-check';
import {
  assert,
  letrec,
  oneof,
  property,
  record,
  stringMatching,
} from 'fast-check';
import { expect, test } from 'vitest';

import { parseSegments } from './parseSegments.ts';

interface SegmentNode {
  left: SegmentTreeValue;
  separator: string;
  right: SegmentTreeValue;
}

type SegmentTreeValue = string | SegmentNode;

interface Visitors {
  segment?: (leaf: string) => void;
  separator?: (separator: string) => void;
}

class SegmentTree {
  readonly #value;

  constructor(value: SegmentTreeValue) {
    this.#value = value;
  }

  toInput(toInput = (s: string) => s) {
    const input: string[] = [];

    this.visit({
      segment: s => {
        input.push(toInput(s));
      },
      separator: s => {
        input.push(s);
      },
    });

    return input.join('');
  }

  toSegments() {
    const segments: string[] = [];

    this.visit({
      segment: s => {
        segments.push(s);
      },
    });

    return segments;
  }

  visit(visitors: Visitors) {
    function visit(value: SegmentTreeValue) {
      if (typeof value === 'string') {
        visitors.segment?.(value);
      } else {
        visit(value.left);
        visitors.separator?.(value.separator);
        visit(value.right);
      }
    }

    visit(this.#value);
  }
}

function segmentTree(segment: Arbitrary<string>) {
  const { tree } = letrec<{
    segment: string;
    node: SegmentNode;
    tree: SegmentTreeValue;
  }>(tie => ({
    segment,
    node: record({
      left: tie('tree'),
      separator: stringMatching(/^[./]$/),
      right: tie('tree'),
    }),
    tree: oneof(
      { depthSize: 'small', withCrossShrink: true },
      tie('segment'),
      tie('node'),
    ),
  }));

  return tree.map(value => new SegmentTree(value));
}

test('static segments', () => {
  assert(
    property(
      segmentTree(stringMatching(/^[^./[$][^./[]*$/)).map(tree => ({
        input: tree.toInput(segment => segment),
        expected: tree.toSegments(),
      })),
      x => {
        expect(parseSegments(x.input)).toStrictEqual(x.expected);
      },
    ),
  );
});

test('dynamic segments', () => {
  assert(
    property(
      segmentTree(stringMatching(/^:[^./[]+$/)).map(tree => ({
        input: tree.toInput(segment => segment.replace(/^:/, '$')),
        expected: tree.toSegments(),
      })),
      x => {
        expect(parseSegments(x.input)).toStrictEqual(x.expected);
      },
    ),
  );
});

test('mixed static and dynamic segments', () => {
  assert(
    property(
      segmentTree(
        oneof(
          stringMatching(/^[^./[$:][^./[]*$/),
          stringMatching(/^:[^./[]+$/),
        ),
      ).map(tree => ({
        input: tree.toInput(segment => segment.replace(/^:/, '$')),
        expected: tree.toSegments(),
      })),
      x => {
        expect(parseSegments(x.input)).toStrictEqual(x.expected);
      },
    ),
  );
});

test('splats', () => {
  expect(parseSegments('$')).toStrictEqual(['*']);

  assert(
    property(
      segmentTree(
        oneof(
          stringMatching(/^[^./[$:][^./[]*$/),
          stringMatching(/^:[^./[]+$/),
        ),
      ).chain(tree => {
        const input = tree.toInput(segment => segment.replace(/^:/, '$'));
        const segments = tree.toSegments();

        return stringMatching(/^[./]$/).map(sep => ({
          input: [input, sep, '$'].join(''),
          expected: [...segments, '*'],
        }));
      }),
      x => {
        expect(parseSegments(x.input)).toStrictEqual(x.expected);
      },
    ),
  );
});

test('escaping in static segments', () => {
  assert(
    property(
      segmentTree(stringMatching(/^[^/]+$/)).map(tree => ({
        input: tree.toInput(segment =>
          segment.replace(/^[./[$]+|[./[]+/g, '[$&]'),
        ),

        expected: tree.toSegments(),
      })),
      x => {
        expect(parseSegments(x.input)).toStrictEqual(x.expected);
      },
    ),
  );
});

test('escaping in dynamic segments', () => {
  assert(
    property(
      segmentTree(stringMatching(/^:[^/]+$/)).map(tree => ({
        input: tree.toInput(segment =>
          segment.replace(/^:/, '$').replace(/([./[]+)/g, '[$1]'),
        ),

        expected: tree.toSegments(),
      })),
      x => {
        expect(parseSegments(x.input)).toStrictEqual(x.expected);
      },
    ),
  );
});

test('escaping the whole static segment', () => {
  assert(
    property(
      segmentTree(stringMatching(/^[^/[\]]+$/)).map(tree => ({
        input: tree.toInput(segment => `[${segment}]`),
        expected: tree.toSegments(),
      })),
      x => {
        expect(parseSegments(x.input)).toStrictEqual(x.expected);
      },
    ),
  );
});

test('escaping the whole dynamic segments', () => {
  assert(
    property(
      segmentTree(stringMatching(/^:[^/[\]]+$/)).map(tree => ({
        input: tree.toInput(segment => segment.replace(/^:(.+)$/, '$[$1]')),
        expected: tree.toSegments(),
      })),
      x => {
        expect(parseSegments(x.input)).toStrictEqual(x.expected);
      },
    ),
  );
});

test('failures with no segments at all', () => {
  expect(() => parseSegments('')).toThrow(
    `Failed to parse segments
  ''
   ^ expected '$' or path segment`,
  );
});

test('failure when splat is not at the end', () => {
  expect(() => parseSegments('$.invalid')).toThrowErrorMatchingInlineSnapshot(
    `
    [Error: Failed to parse segments
      '$.invalid'
        ^ expected dynamic segment name or splat]
  `,
  );

  expect(() => parseSegments('$/invalid')).toThrowErrorMatchingInlineSnapshot(
    `
    [Error: Failed to parse segments
      '$/invalid'
        ^ expected dynamic segment name or splat]
  `,
  );
});

test('failure when escape sequence contains a slash', () => {
  expect(() => parseSegments('u[/]ers')).toThrowErrorMatchingInlineSnapshot(
    `
    [Error: Failed to parse segments
      'u[/]ers'
         ^ expected anything except '/']
  `,
  );

  expect(() => parseSegments('u[/s]ers')).toThrowErrorMatchingInlineSnapshot(
    `
    [Error: Failed to parse segments
      'u[/s]ers'
         ^ expected anything except '/']
  `,
  );

  expect(() => parseSegments('u[s/]ers')).toThrowErrorMatchingInlineSnapshot(
    `
    [Error: Failed to parse segments
      'u[s/]ers'
          ^ expected anything except '/']
  `,
  );
});

test('failure when escape sequence is not closed', () => {
  expect(() => parseSegments('u[sers')).toThrowErrorMatchingInlineSnapshot(
    `
    [Error: Failed to parse segments
      'u[sers'
             ^ expected ']']
  `,
  );

  expect(() => parseSegments('u[.s.ers')).toThrowErrorMatchingInlineSnapshot(
    `
    [Error: Failed to parse segments
      'u[.s.ers'
               ^ expected ']']
  `,
  );
});

test('failure when missing an initial segment', () => {
  assert(
    property(
      segmentTree(
        oneof(
          stringMatching(/^[^./[$:][^./[]*$/),
          stringMatching(/^:[^./[]+$/),
        ),
      ).chain(tree =>
        stringMatching(/^[./]$/).map(sep =>
          [sep, tree.toInput(segment => segment.replace(/^:/, '$'))].join(''),
        ),
      ),
      input => {
        expect(() => parseSegments(input)).toThrow(
          `Failed to parse segments
  '${input}'
   ^ expected '$' or path segment`,
        );
      },
    ),
  );
});

test('failure when missing a final segment', () => {
  assert(
    property(
      segmentTree(
        oneof(
          stringMatching(/^[^./[$:][^./[]*$/),
          stringMatching(/^:[^./[]+$/),
        ),
      ).chain(tree =>
        stringMatching(/^[./]$/).map(sep =>
          [tree.toInput(segment => segment.replace(/^:/, '$')), sep].join(''),
        ),
      ),
      input => {
        expect(() => parseSegments(input)).toThrow(
          `Failed to parse segments
  '${input}'
   ${' '.repeat(input.length)}^ expected '$' or path segment`,
        );
      },
    ),
  );
});
