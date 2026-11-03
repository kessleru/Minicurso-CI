import type { Lang } from './content';

// Realce de sintaxe simples, linha a linha, nas cores do Catppuccin.
export type Seg = { t: string; c: string };

const C = {
  kw: 'syn text-ctp-mauve',
  fn: 'syn text-ctp-blue',
  str: 'syn text-ctp-green',
  num: 'syn text-ctp-peach',
  key: 'syn text-ctp-lavender',
  com: 'text-ctp-meta italic',
  pr: 'text-ctp-accent',
  tx: 'text-ctp-text',
  ok: 'text-ctp-green',
  err: 'text-ctp-red',
  dim: 'text-ctp-subtext-0',
};

const KW: Partial<Record<Lang, Set<string>>> = {
  ts: new Set('import from export const function return async await let new'.split(' ')),
  py: new Set('import from def return with as for in assert lambda'.split(' ')),
};

export function hlLine(line: string, lang: Lang): Seg[] {
  const segs: Seg[] = [];
  const push = (t: string, c: string) => t && segs.push({ t, c });
  let rest = line;

  if (/^\$ /.test(rest)) {
    push('$ ', C.pr);
    rest = rest.slice(2);
    if (lang === 'out') {
      push(rest, C.tx);
      return segs;
    }
  }
  if (/^>>> /.test(rest)) {
    push('>>> ', C.pr);
    rest = rest.slice(4);
  }
  if (lang === 'out') {
    push(rest || ' ', /✗|FAILED|Error|failed|assert /.test(rest) ? C.err : /✓|passed/.test(rest) ? C.ok : C.dim);
    return segs;
  }
  if (lang === 'csv' || lang === 'tree') {
    push(rest || ' ', lang === 'tree' && /\.github|workflows|\.yml/.test(rest) ? C.ok : C.tx);
    return segs;
  }
  if (lang === 'yaml') {
    const m = rest.match(/^(\s*(?:- )?)([\w-]+)(:)/);
    if (m) {
      push(m[1], C.tx);
      push(m[2], C.key);
      push(m[3], C.tx);
      rest = rest.slice(m[0].length);
    }
  }

  const com = lang === 'ts' ? '\\/\\/.*$' : '#.*$';
  const re = new RegExp(`(${com})|('[^']*'|"[^"]*")|(\\b\\d+(?:\\.\\d+)?\\b)|([A-Za-z_$][\\w$]*)`, 'g');
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(rest))) {
    push(rest.slice(last, m.index), C.tx);
    if (m[1]) push(m[1], C.com);
    else if (m[2]) push(m[2], C.str);
    else if (m[3]) push(m[3], C.num);
    else {
      const w = m[4];
      const next = rest[m.index + w.length];
      const isKw = KW[lang]?.has(w);
      push(
        w,
        isKw ? C.kw : lang === 'ts' && /^(number|string|boolean)$/.test(w) ? C.key : next === '(' ? C.fn : C.tx
      );
    }
    last = re.lastIndex;
  }
  push(rest.slice(last), C.tx);
  if (!segs.length) push(' ', C.tx);
  return segs;
}

export function Line({ text, lang }: { text: string; lang: Lang }) {
  return hlLine(text, lang).map((s, i) => (
    <span key={i} className={s.c}>
      {s.t}
    </span>
  ));
}
