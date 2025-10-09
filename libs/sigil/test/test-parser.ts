import { parseTemplateExpression, TemplateNode } from '../src/template-parser.js';
import assert from 'assert';
import { test, describe } from 'node:test';

describe('SIGIL Template Parser', () => {
  test('parses plain text', () => {
    const node = parseTemplateExpression('hello');
    assert.deepStrictEqual(node, { type: 'text', value: 'hello' });
  });

  test('parses table reference', () => {
    const node = parseTemplateExpression('[foo]');
    assert.deepStrictEqual(node, {
      type: 'table',
      tablePath: 'foo',
      modifiers: undefined,
      isOptional: false,
      exclusions: [],
      repetition: 1
    });
  });

  test('parses AND (&) at top level', () => {
    const node = parseTemplateExpression('{[a]&[b]}');
    assert.deepStrictEqual(node, {
      type: 'and',
      nodes: [
        {
          type: 'table',
          tablePath: 'a',
          modifiers: undefined,
          isOptional: false,
          exclusions: [],
          repetition: 1
        },
        {
          type: 'table',
          tablePath: 'b',
          modifiers: undefined,
          isOptional: false,
          exclusions: [],
          repetition: 1
        }
      ]
    });
  });

  test('parses OR (|) at top level', () => {
    const node = parseTemplateExpression('{[a]|[b]}');
    assert.deepStrictEqual(node, {
      type: 'or',
      nodes: [
        {
          type: 'table',
          tablePath: 'a',
          modifiers: undefined,
          isOptional: false,
          exclusions: [],
          repetition: 1
        },
        {
          type: 'table',
          tablePath: 'b',
          modifiers: undefined,
          isOptional: false,
          exclusions: [],
          repetition: 1
        }
      ]
    });
  });

  test('parses nested AND/OR', () => {
    const node = parseTemplateExpression('{[a*2]&{[b]|[c?]}}');
    assert.deepStrictEqual(node, {
      type: 'and',
      nodes: [
        {
          type: 'table',
          tablePath: 'a',
          modifiers: undefined,
          isOptional: false,
          exclusions: [],
          repetition: 2
        },
        {
          type: 'or',
          nodes: [
            {
              type: 'table',
              tablePath: 'b',
              modifiers: undefined,
              isOptional: false,
              exclusions: [],
              repetition: 1
            },
            {
              type: 'table',
              tablePath: 'c',
              modifiers: undefined,
              isOptional: true,
              exclusions: [],
              repetition: 1
            }
          ]
        }
      ]
    });
  });

  test('parses group expression', () => {
    const node = parseTemplateExpression('({[a]|[b]})');
    assert.deepStrictEqual(node, {
      type: 'group',
      node: {
        type: 'or',
        nodes: [
          {
            type: 'table',
            tablePath: 'a',
            modifiers: undefined,
            isOptional: false,
            exclusions: [],
            repetition: 1
          },
          {
            type: 'table',
            tablePath: 'b',
            modifiers: undefined,
            isOptional: false,
            exclusions: [],
            repetition: 1
          }
        ]
      }
    });
  });
});