import type { XuiCodeLine, XuiCodeTokenKind } from '@xui/code-block';

export type Language = 'html' | 'ts' | 'css' | 'bash' | 'json';

type Kind = XuiCodeTokenKind;

/**
 * Ordered rules per language. First match at the cursor wins, so the order matters: comments and
 * strings have to be tried before anything that could match inside them.
 *
 * This is deliberately a tokeniser and not a parser. It is wrong on pathological input in ways a
 * real grammar would not be, and the cost of that is a mis-classified word — the text itself is
 * rendered from the token, never re-assembled, so nothing can be lost or injected.
 *
 * It classifies and stops there: the colours belong to `@xui/code-block`, which is what lets a
 * highlighted sample follow the active theme.
 */
const RULES: Record<Language, [Kind, RegExp][]> = {
  html: [
    ['comment', /<!--[\s\S]*?-->/y],
    ['string', /"[^"]*"|'[^']*'/y],
    ['tag', /<\/?[a-zA-Z][\w-]*|\/?>/y],
    ['keyword', /\{\{[\s\S]*?\}\}|@[a-z]+\b|\}/y],
    ['attribute', /[[(]?[a-zA-Z_@#*][\w.-]*[\])]?(?==)/y],
    ['plain', /[^<>"'{@\n]+/y]
  ],
  ts: [
    ['comment', /\/\/[^\n]*|\/\*[\s\S]*?\*\//y],
    ['string', /`[^`]*`|"[^"]*"|'[^']*'/y],
    [
      'keyword',
      /\b(?:import|from|export|const|let|var|class|extends|implements|interface|type|function|return|new|await|async|if|else|for|of|in|as|readonly|public|private|protected|static|true|false|null|undefined|this)\b/y
    ],
    ['number', /\b\d+(?:\.\d+)?\b/y],
    ['type', /@[A-Z][\w]*/y],
    ['punctuation', /[{}()[\];:,.<>=|&?!+*/-]+/y],
    ['plain', /[^\s{}()[\];:,.<>=|&?!+*/`"'-]+|[^\S\n]+/y]
  ],
  css: [
    ['comment', /\/\*[\s\S]*?\*\//y],
    ['string', /"[^"]*"|'[^']*'/y],
    ['keyword', /@[a-z-]+|--[\w-]+/y],
    ['number', /\b\d+(?:\.\d+)?(?:rem|em|px|%|s|ms)?\b/y],
    ['attribute', /[a-z-]+(?=\s*:)/y],
    ['punctuation', /[{}();:,]+/y],
    ['plain', /[^\s{}();:,"'@-]+|[^\S\n]+|-/y]
  ],
  bash: [
    ['comment', /#[^\n]*/y],
    ['string', /"[^"]*"|'[^']*'/y],
    ['keyword', /^[^\S\n]*(?:pnpm|npm|npx|ng|nx|yarn|git|node|wrangler)\b/y],
    ['attribute', /[^\S\n]--?[\w-]+/y],
    ['plain', /[^\s]+|[^\S\n]+/y]
  ],
  json: [
    ['string', /"[^"]*"/y],
    ['keyword', /\b(?:true|false|null)\b/y],
    ['number', /-?\b\d+(?:\.\d+)?\b/y],
    ['punctuation', /[{}[\],:]+/y],
    ['plain', /[^\S\n]+|[^\s{}[\],:"]+/y]
  ]
};

/**
 * Classify a sample, one entry per line.
 *
 * Line-based because that is the shape `xui-code-block` renders: it numbers and
 * highlights lines, so a token may not span one. Rules therefore never match a
 * newline — every `\s` that could have has been narrowed to `[^\S\n]`.
 */
export function highlight(code: string, lang: Language): XuiCodeLine[] {
  return code.split('\n').map(line => tokenizeLine(line, RULES[lang]));
}

function tokenizeLine(line: string, rules: [Kind, RegExp][]): XuiCodeLine {
  const tokens: { text: string; kind: Kind }[] = [];
  let cursor = 0;

  while (cursor < line.length) {
    const token = nextToken(line, cursor, rules);

    if (!token) {
      // No rule matched — emit the character as-is so the sample is never truncated.
      push(tokens, line[cursor], 'plain');
      cursor += 1;
      continue;
    }

    push(tokens, token.text, token.kind);
    cursor += token.text.length;
  }

  return tokens;
}

function nextToken(code: string, cursor: number, rules: [Kind, RegExp][]): { text: string; kind: Kind } | undefined {
  for (const [kind, pattern] of rules) {
    pattern.lastIndex = cursor;
    const match = pattern.exec(code);

    if (match && match[0].length > 0) {
      return { text: match[0], kind };
    }
  }

  return undefined;
}

/** Adjacent tokens of the same kind become one element, which keeps the DOM roughly half the size. */
function push(tokens: { text: string; kind: Kind }[], text: string, kind: Kind): void {
  const last = tokens[tokens.length - 1];

  if (last && last.kind === kind) {
    last.text += text;

    return;
  }

  tokens.push({ text, kind });
}
