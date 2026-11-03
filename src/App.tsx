import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { NODE, PY, REPO_NODE, REPO_PY } from './content';
import { Line } from './highlight';
import { useCopy, useStored } from './useCopy';
import { CodeBlock, CopyButton, Section, Toggle } from './components/ui';
import { CheckSimulation, WorkflowFile } from './components/Workflow';
import Practice from './components/Practice';

const NAV = [
  ['conceito', 'Conceito'],
  ['projeto', 'Projeto'],
  ['testes', 'Testes'],
  ['workflow', 'Workflow'],
  ['roteiro', 'Roteiro'],
  ['alem', 'Para ir além'],
] as const;

const PIPELINE = [
  ['commit', 'push ou PR'],
  ['build', 'VM limpa, dependências instaladas'],
  ['teste', 'a suíte inteira, sempre'],
  ['feedback', 'check verde ou vermelho no PR'],
];

const WORDS = [
  ['workflow', 'um arquivo YAML em .github/workflows/'],
  ['trigger', 'o evento que dispara: push, pull_request, schedule'],
  ['job', 'bloco isolado de trabalho; é ele que aparece como check no PR'],
  ['step', 'uma tarefa do job, em ordem: run: ou uses:'],
  ['action', 'step pronto que você reusa: actions/checkout@v4'],
  ['runner', 'a máquina que executa o job, uma VM limpa a cada run'],
];

const LINKS = [
  ['kessleru.com.br', 'https://kessleru.com.br'],
  ['GitHub', 'https://github.com/kessleru'],
  ['LinkedIn', 'https://www.linkedin.com/in/otavio-ustra-8b50bb364/'],
];

function initialTrack(): 'node' | 'py' | null {
  try {
    const q = new URLSearchParams(location.search).get('trilha');
    if (q === 'python' || q === 'py') return 'py';
    if (q === 'node') return 'node';
  } catch {
    // sem location (não acontece no navegador)
  }
  return null;
}

function App() {
  const [stored, setStored] = useStored<'node' | 'py'>('ci-apoio-trilha', 'node', ['node', 'py']);
  const [fromUrl] = useState(initialTrack);
  const [override, setOverride] = useState<'node' | 'py' | null>(fromUrl);
  const track = override ?? stored;
  const t = track === 'py' ? PY(REPO_PY) : NODE(REPO_NODE);
  const setTrack = (next: 'node' | 'py') => {
    setOverride(null);
    setStored(next);
  };

  const [theme, setThemeState] = useState(() => document.documentElement.dataset.theme ?? 'dark');
  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    setThemeState(next);
    try {
      localStorage.setItem('ci-apoio-tema', next);
    } catch {
      // sem localStorage: vale só para esta visita
    }
  };

  // Seção que está na tela, para sublinhar o item do menu (a linha desce até a borda do header).
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const sections = NAV.map(([id]) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: '-25% 0px -65% 0px' }
    );
    sections.forEach((el) => observer.observe(el));
    const top = () => scrollY < 200 && setActive(null);
    addEventListener('scroll', top, { passive: true });
    return () => {
      observer.disconnect();
      removeEventListener('scroll', top);
    };
  }, []);

  const { copied, copy } = useCopy();
  const [showOut, setShowOut] = useState(false);

  const tracks = [
    { id: 'node' as const, name: 'Node.js · API', title: 'Testar código', text: 'Uma API Express em TypeScript com um bug de desconto. Vitest e Supertest pegam o preço negativo antes do merge.' },
    { id: 'py' as const, name: 'Python · dados', title: 'Testar dados', text: 'Um CSV de cupons editado pelo comercial no navegador. O pytest confere cada linha, em todo PR e todo dia pelo cron.' },
  ];

  return (
    <>
      <a
        href="#conteudo"
        className="fixed top-3 left-3 z-50 -translate-y-16 rounded-lg bg-ctp-mantle px-4 py-2 text-sm text-ctp-accent shadow-lg transition-transform focus-visible:translate-y-0"
      >
        Pular para o conteúdo
      </a>

      <header className="sticky top-0 z-40 border-b border-ctp-surface-0 bg-ctp-base/85 backdrop-blur">
        <div className="mx-auto flex max-w-[52rem] items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <a href="#topo" className="font-mono text-sm font-semibold text-ctp-text">
            minicurso<span className="text-ctp-accent">/ci</span>
          </a>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Usar tema escuro' : 'Usar tema claro'}
              title={theme === 'light' ? 'Tema escuro' : 'Tema claro'}
              className="cursor-pointer rounded-md p-1.5 text-ctp-subtext-0 transition-colors hover:text-ctp-text"
            >
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>
          </div>
        </div>
        <nav aria-label="Seções" className="mx-auto hidden max-w-[52rem] gap-6 overflow-x-auto overflow-y-hidden px-5 text-sm [scrollbar-width:none] sm:flex sm:px-8">
          {NAV.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active === id ? 'true' : undefined}
              className="nav-link relative whitespace-nowrap py-2.5 text-ctp-subtext-0 transition-colors hover:text-ctp-text aria-[current=true]:text-ctp-text"
            >
              {label}
            </a>
          ))}
        </nav>
      </header>

      <main id="conteudo" tabIndex={-1} className="mx-auto max-w-[52rem] px-5 outline-none sm:px-8">
        <section id="topo" className="space-y-6 py-14 sm:py-20">
          <h1 className="text-4xl font-semibold tracking-tight text-ctp-text sm:text-5xl">
            Integração Contínua com <span className="text-ctp-accent">GitHub Actions</span>
          </h1>
          <p className="prose-text">
            O que passa nos slides está aqui também, com os comandos prontos para copiar e o roteiro da prática passo a passo.
          </p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="font-medium text-ctp-text">Otávio Kessler Ustra</span>
            {LINKS.map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" className="text-ctp-subtext-0 underline decoration-ctp-surface-1 underline-offset-4 transition-colors hover:text-ctp-text hover:decoration-ctp-accent">
                {label}
              </a>
            ))}
          </p>
        </section>

        <section aria-labelledby="trilha-titulo" className="space-y-5 pb-16">
          <div className="space-y-2">
            <h2 id="trilha-titulo" className="text-xl font-semibold text-ctp-text">
              Escolha sua trilha
            </h2>
            <p className="prose-text">
              O conceito é o mesmo. Muda o projeto e o que o teste confere. A escolha fica salva neste navegador.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {tracks.map((item) => {
              const on = track === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setTrack(item.id)}
                  // cada trilha é uma tecla: a escolhida fica afundada
                  className="key key--flat flex-col items-stretch justify-start gap-2 rounded-xl text-left font-normal [--key-px:1rem] [--key-py:1rem] sm:[--key-px:1.25rem] sm:[--key-py:1.25rem]"
                >
                  <span className="flex items-center justify-between font-mono text-xs">
                    <span className="text-ctp-subtext-0">{item.name}</span>
                    <span className={on ? 'text-ctp-accent' : 'text-ctp-meta'}>{on ? '✓ trilha atual' : 'escolher'}</span>
                  </span>
                  <span className="block text-lg font-semibold text-ctp-text">{item.title}</span>
                  <span className="block text-[15px] leading-relaxed text-ctp-subtext-1">{item.text}</span>
                </button>
              );
            })}
          </div>
        </section>

        <Section
          id="conceito"
          number="01"
          label="conceito"
          title="O que é Integração Contínua"
          intro="Validar automaticamente cada commit em um servidor limpo, antes que ele se torne problema de outra pessoa."
        >
          <ol className="grid gap-3 sm:grid-cols-4">
            {PIPELINE.map(([name, text], i) => (
              <li key={name} className="space-y-1 rounded-xl border border-ctp-surface-0 p-4">
                <span className="font-mono text-xs text-ctp-accent">0{i + 1}</span>
                <p className="font-semibold text-ctp-text">{name}</p>
                <p className="text-sm leading-snug text-ctp-subtext-0">{text}</p>
              </li>
            ))}
          </ol>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-ctp-text">Seis palavras que se encaixam</h3>
            <dl className="divide-y divide-ctp-surface-0 border-y border-ctp-surface-0">
              {WORDS.map(([word, text]) => (
                <div key={word} className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-6">
                  <dt className="w-24 shrink-0 font-mono text-sm text-ctp-accent">{word}</dt>
                  <dd className="text-[15px] text-ctp-subtext-1">{text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Section>

        <Section id="projeto" number="02" label="antes" title="O projeto sem CI" intro={t.projetoIntro}>
          <div className="space-y-4">
            <CodeBlock name="estrutura" lang="tree" code={t.tree} />
            {t.files.map(([name, lang, code], i) => (
              <CodeBlock
                key={name}
                name={name}
                lang={lang}
                code={code}
                copy={{ id: `f${i}`, copied, onCopy: copy }}
                after={
                  i === t.files.length - 1 ? (
                    <pre className="border-t border-ctp-surface-0 px-4 py-3 font-mono text-[13px]">
                      <span className="text-ctp-red">{t.demoOut}</span>
                    </pre>
                  ) : undefined
                }
              />
            ))}
            <p className="rounded-lg border-l-2 border-ctp-red/70 bg-ctp-red/5 px-4 py-3 text-[15px] text-ctp-text">{t.bugNote}</p>
          </div>
        </Section>

        <Section id="testes" number="03" label="testes" title={t.testesTitulo} intro={t.testesIntro}>
          <div className="space-y-4">
            {t.tests.map(([name, lang, code], i) => (
              <CodeBlock key={name} name={name} lang={lang} code={code} copy={{ id: `t${i}`, copied, onCopy: copy }} />
            ))}
            <Toggle open={showOut} onClick={() => setShowOut((v) => !v)}>
              {showOut ? 'Esconder a saída do terminal' : 'Mostrar a saída do terminal'}
            </Toggle>
            {showOut && (
              <pre className="overflow-x-auto rounded-xl border border-ctp-surface-0 bg-ctp-mantle px-4 py-3 font-mono text-[13px] leading-6">
                {t.out.split('\n').map((line, i) => (
                  <span key={i} className="block">
                    <Line text={line} lang="out" />
                  </span>
                ))}
              </pre>
            )}
          </div>
          <dl className="divide-y divide-ctp-surface-0 border-y border-ctp-surface-0">
            {t.anatomia.map(({ k, d }) => (
              <div key={k} className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-6">
                <dt className="w-24 shrink-0 font-mono text-sm text-ctp-accent">{k}</dt>
                <dd className="text-[15px] text-ctp-subtext-1">{d}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section
          id="workflow"
          number="04"
          label="depois"
          title="O pipeline inteiro, linha a linha"
          intro="Toque em qualquer linha para ver o que ela faz."
        >
          <WorkflowFile key={t.id} t={t} copied={copied} onCopy={copy} />
          <CheckSimulation t={t} />
        </Section>

        <Section
          id="roteiro"
          number="05"
          label="prática"
          title="Roteiro passo a passo"
          intro="Marque cada passo quando terminar; o progresso fica salvo. Travou? Abra Mostrar como faz para ver o porquê de cada comando e o que deve aparecer na tela."
        >
          <Practice t={t} copied={copied} onCopy={copy} />
        </Section>

        <Section id="alem" number="06" label="para ir além" title="O que mais cabe no pipeline">
          <div className="space-y-3">
            <ul className="divide-y divide-ctp-surface-0 overflow-hidden rounded-xl border border-ctp-surface-0">
              {t.alem.map(([name, cmd, text], i) => (
                <li key={name} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="sm:w-56 sm:shrink-0">
                    <p className="font-medium text-ctp-text">{name}</p>
                    <p className="text-sm text-ctp-subtext-0">{text}</p>
                  </div>
                  <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md bg-ctp-mantle px-3 py-1.5">
                    <code className="flex-1 overflow-x-auto font-mono text-[13px] whitespace-pre text-ctp-text">{cmd}</code>
                    <CopyButton id={`a${i}`} text={cmd} copied={copied} onCopy={copy} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      </main>

      <footer className="border-t border-ctp-surface-0">
        <div className="mx-auto flex max-w-[52rem] flex-wrap items-center justify-between gap-3 px-5 py-8 text-sm text-ctp-subtext-0 sm:px-8">
          <span>Minicurso CI com GitHub Actions · Otávio Kessler Ustra</span>
          <span className="flex gap-4">
            {LINKS.map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" className="transition-colors hover:text-ctp-text">
                {label}
              </a>
            ))}
          </span>
        </div>
      </footer>
    </>
  );
}

export default App;
