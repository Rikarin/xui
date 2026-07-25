export type Language = 'html' | 'ts' | 'css' | 'bash' | 'json';

export interface Token {
  text: string;
  class: string;
}

type Kind = 'comment' | 'string' | 'keyword' | 'tag' | 'attr' | 'number' | 'punct' | 'plain';

const CLASS: Record<Kind, string> = {
  comment: 'text-foreground-subtle italic',
  string: 'text-success-emphasis',
  keyword: 'text-primary-emphasis',
  tag: 'text-info-emphasis',
  attr: 'text-warning-emphasis',
  number: 'text-secondary-emphasis',
  punct: 'text-foreground-muted',
  plain: 'text-foreground'
};

/**
 * Ordered rules per language. First match at the cursor wins, so the order matters: comments and
 * strings have to be tried before anything that could match inside them.
 *
 * This is deliberately a tokeniser and not a parser. It is wrong on pathological input in ways a
 * real grammar would not be, and the cost of that is a mis-coloured word — the text itself is
 * rendered from the token, never re-assembled, so nothing can be lost or injected.
 */
const RULES: Record<Language, [Kind, RegExp][]> = {
  html: [
    ['comment', /<!--[\s\S]*?-->/y],
    ['string', /"[^"]*"|'[^']*'/y],
    ['tag', /<\/?[a-zA-Z][\w-]*|\/?>/y],
    ['keyword', /\{\{[\s\S]*?\}\}|@[a-z]+\b|\}/y],
    ['attr', /[[(]?[a-zA-Z_@#*][\w.-]*[\])]?(?==)/y],
    ['plain', /[^<>"'{@]+/y]
  ],
  ts: [
    ['comment', /\/\/[^\n]*|\/\*[\s\S]*?\*\//y],
    ['string', /`[^`]*`|"[^"]*"|'[^']*'/y],
    [
      'keyword',
      /\b(?:import|from|export|const|let|var|class|extends|implements|interface|type|function|return|new|await|async|if|else|for|of|in|as|readonly|public|private|protected|static|true|false|null|undefined|this)\b/y
    ],
    ['number', /\b\d+(?:\.\d+)?\b/y],
    ['tag', /@[A-Z][\w]*/y],
    ['punct', /[{}()[\];:,.<>=|&?!+*/-]+/y],
    ['plain', /[^\s{}()[\];:,.<>=|&?!+*/`"'-]+|\s+/y]
  ],
  css: [
    ['comment', /\/\*[\s\S]*?\*\//y],
    ['string', /"[^"]*"|'[^']*'/y],
    ['keyword', /@[a-z-]+|--[\w-]+/y],
    ['number', /\b\d+(?:\.\d+)?(?:rem|em|px|%|s|ms)?\b/y],
    ['attr', /[a-z-]+(?=\s*:)/y],
    ['punct', /[{}();:,]+/y],
    ['plain', /[^\s{}();:,"'@-]+|\s+|-/y]
  ],
  bash: [
    ['comment', /#[^\n]*/y],
    ['string', /"[^"]*"|'[^']*'/y],
    ['keyword', /^\s*(?:pnpm|npm|npx|ng|nx|yarn|git|node|wrangler)\b/y],
    ['attr', /\s--?[\w-]+/y],
    ['plain', /\S+|\s+/y]
  ],
  json: [
    ['string', /"[^"]*"/y],
    ['keyword', /\b(?:true|false|null)\b/y],
    ['number', /-?\b\d+(?:\.\d+)?\b/y],
    ['punct', /[{}[\],:]+/y],
    ['plain', /\s+|[^\s{}[\],:"]+/y]
  ]
};

export function highlight(code: string, lang: Language): Token[] {
  const rules = RULES[lang];
  const tokens: Token[] = [];
  let cursor = 0;

  while (cursor < code.length) {
    const token = nextToken(code, cursor, rules);

    if (!token) {
      // No rule matched — emit the character as-is so the sample is never truncated.
      push(tokens, code[cursor], 'plain');
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
function push(tokens: Token[], text: string, kind: Kind): void {
  const last = tokens[tokens.length - 1];

  if (last && last.class === CLASS[kind]) {
    last.text += text;

    return;
  }

  tokens.push({ text, class: CLASS[kind] });
}
