import { useEffect, useRef, useState } from 'react';
import { Download, Play } from 'lucide-react';
import type { Track } from '../content';
import { Line } from '../highlight';
import { cn } from '../cn';
import { CopyButton } from './ui';

type Props = { t: Track; copied: string | null; onCopy: (id: string, text: string) => void };

export const ymlText = (t: Track) => t.yml.map(([line]) => line).join('\n') + '\n';

/** O workflow linha a linha: tocar numa linha mostra o que ela faz, logo abaixo dela. */
export function WorkflowFile({ t, copied, onCopy }: Props) {
  const [active, setActive] = useState(0);
  const text = ymlText(t);

  function download() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/yaml' }));
    a.download = t.wf;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  return (
    <figure className="overflow-hidden rounded-xl border border-ctp-surface-0 bg-ctp-mantle">
      <figcaption className="flex items-center justify-between gap-3 border-b border-ctp-surface-0 px-4 py-2">
        <span className="truncate font-mono text-xs text-ctp-subtext-0">.github/workflows/{t.wf}</span>
        <span className="flex items-center gap-1">
          <button
            type="button"
            onClick={download}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 font-mono text-xs text-ctp-meta transition-colors hover:bg-ctp-surface-0/60 hover:text-ctp-text"
          >
            <Download size={13} aria-hidden="true" /> baixar
          </button>
          <CopyButton id="yml" text={text} copied={copied} onCopy={onCopy} />
        </span>
      </figcaption>
      <ol className="py-2 font-mono text-[13px] leading-6">
        {t.yml.map(([line, note], i) => {
          const on = i === active;
          return (
            <li key={i}>
              <button
                type="button"
                aria-expanded={on}
                onClick={() => setActive(on ? -1 : i)}
                className={cn(
                  'flex w-full cursor-pointer border-l-2 pr-4 text-left transition-colors',
                  on ? 'border-ctp-accent bg-ctp-surface-0/50' : 'border-transparent hover:bg-ctp-surface-0/30'
                )}
              >
                <span className="w-10 shrink-0 pr-3 text-right text-ctp-meta tabular-nums select-none">{i + 1}</span>
                <span className="whitespace-pre">
                  <Line text={line} lang="yaml" />
                </span>
              </button>
              {on && (
                <p className="border-l-2 border-ctp-accent bg-ctp-surface-0/50 py-2 pr-4 pl-12 font-sans text-sm leading-relaxed text-ctp-subtext-1">
                  {note}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </figure>
  );
}

type RunState = { mode: 'bug' | 'fix'; i: number; end: boolean } | null;

/** Simulação do check no PR: os steps rodam um a um, e no fim aparece o log e o estado do merge. */
export function CheckSimulation({ t }: { t: Track }) {
  const [run, setRun] = useState<RunState>(null);
  const timer = useRef<number>(undefined);
  const n = t.run.length;

  useEffect(() => () => window.clearInterval(timer.current), []);
  useEffect(() => {
    window.clearInterval(timer.current);
    setRun(null);
  }, [t.id]);

  function simulate(mode: 'bug' | 'fix') {
    window.clearInterval(timer.current);
    setRun({ mode, i: 0, end: false });
    timer.current = window.setInterval(() => {
      setRun((r) => {
        if (!r || r.end) return r;
        if (r.i >= n - 1) {
          window.clearInterval(timer.current);
          return { ...r, end: true };
        }
        return { ...r, i: r.i + 1 };
      });
    }, 650);
  }

  const failed = run?.end && run.mode === 'bug';
  const passed = run?.end && run.mode === 'fix';
  let total = 0;
  const steps = t.run.map(([name, sec], k) => {
    let icon = '○';
    let color = 'text-ctp-meta';
    let time = '';
    let nameColor = 'text-ctp-subtext-0';
    if (run) {
      if (k < run.i) {
        icon = '✓';
        color = 'text-ctp-green';
        time = `${sec}s`;
        nameColor = 'text-ctp-text';
        total += sec;
      } else if (k === run.i) {
        nameColor = 'text-ctp-text';
        if (!run.end) {
          icon = '●';
          color = 'text-ctp-yellow';
          time = 'rodando';
        } else {
          icon = failed ? '✗' : '✓';
          color = failed ? 'text-ctp-red' : 'text-ctp-green';
          time = `${sec}s`;
          total += sec;
        }
      } else if (run.end) {
        icon = '–';
        time = 'pulado';
      }
    }
    return { name, icon, color, time, nameColor };
  });
  const title = !run
    ? 'Escolha uma versão para simular'
    : !run.end
      ? `${t.check} · rodando…`
      : failed
        ? `${t.check} · falhou em ${total}s`
        : `${t.check} · passou em ${total}s`;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-ctp-text">Simule o check no PR</h3>
        <p className="prose-text">Rode este workflow de mentira e veja o que aparece no PR, com o bug e com a correção.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ['bug', 'Com o bug'],
            ['fix', 'Com a correção'],
          ] as const
        ).map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            onClick={() => simulate(mode)}
            className={cn(
              'inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors',
              run?.mode === mode
                ? 'border-ctp-accent/60 bg-ctp-accent/10 text-ctp-accent'
                : 'border-ctp-surface-1 text-ctp-subtext-1 hover:border-ctp-surface-2 hover:text-ctp-text'
            )}
          >
            <Play size={14} aria-hidden="true" /> {label}
          </button>
        ))}
      </div>
      <div
        className={cn(
          'overflow-hidden rounded-xl border bg-ctp-mantle transition-colors',
          failed ? 'border-ctp-red/50' : passed ? 'border-ctp-green/50' : 'border-ctp-surface-0'
        )}
      >
        <p
          aria-live="polite"
          className={cn(
            'border-b border-ctp-surface-0 px-4 py-2.5 font-mono text-sm',
            failed ? 'text-ctp-red' : passed ? 'text-ctp-green' : run ? 'text-ctp-yellow' : 'text-ctp-meta'
          )}
        >
          {!run ? '○' : !run.end ? '●' : failed ? '✗' : '✓'} {title}
        </p>
        <ol className="space-y-1 px-4 py-3 font-mono text-[13px]">
          {steps.map((s) => (
            <li key={s.name} className="flex items-center gap-3">
              <span aria-hidden="true" className={cn('w-4 text-center', s.color)}>
                {s.icon}
              </span>
              <span className={cn('flex-1', s.nameColor)}>{s.name}</span>
              <span className="text-xs text-ctp-meta tabular-nums">{s.time}</span>
            </li>
          ))}
        </ol>
        {run?.end && (
          <>
            <pre className="overflow-x-auto border-t border-ctp-surface-0 px-4 py-3 font-mono text-[13px] leading-6">
              {(failed ? t.logBug : t.logOk).split('\n').map((line, i) => (
                <span key={i} className="block">
                  <Line text={line} lang="out" />
                </span>
              ))}
            </pre>
            <p
              className={cn(
                'border-t px-4 py-2.5 text-sm font-medium',
                failed ? 'border-ctp-red/30 bg-ctp-red/10 text-ctp-red' : 'border-ctp-green/30 bg-ctp-green/10 text-ctp-green'
              )}
            >
              {failed ? 'Merge bloqueado: check obrigatório reprovado' : 'Merge liberado'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
