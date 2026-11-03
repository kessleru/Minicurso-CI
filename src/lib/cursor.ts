/**
 * Cursores no estilo Figma, bem arredondados: a seta de sempre e a mãozinha de pegar
 * (aberta e fechada). Duas cores fixas, uma para o tema claro e outra para os escuros:
 * no claro, grafite com contorno branco; nos escuros, branco suave com contorno escuro.
 *
 * Do jeito que os guias recomendam (MDN): PNG com versão 2× para telas retina via
 * image-set(), ponto de clique definido e um cursor do sistema de reserva. O desenho é
 * um SVG, rasterizado aqui em PNG (o Safari não aceita SVG em cursor). É um cursor
 * nativo: não atrasa, porque quem desenha é o sistema.
 */
const SIZE = 24; // tamanho na tela; o desenho é feito numa grade de 32 e reduzido

// Cores fixas (não seguem o destaque): o mesmo par do Figma, ajustado à paleta Catppuccin.
const LIGHT = { fill: '#4c4f69', line: '#ffffff' }; // text do Latte
const DARK = { fill: '#eef0fb', line: '#11111b' }; // quase branco e o crust do Mocha

// Seta: triângulo com a traseira côncava e curva; os cantos saem redondos do traço.
const ARROW = 'M7 6 25.5 13.2 18.6 15.6Q15.9 16.5 15 19.2L12.8 26Z';
const FINGERS_OPEN =
  'M11 16V7.5M14.5 15V5.8M18 15.5V7M21.3 16.5V9.8M8.6 19.5 6 15.8';
const FINGERS_CLOSED =
  'M11 15V11.5M14.5 14.5V10.3M18 14.8V11M21.3 16V12.5M9 18.5 7.6 16.4';

type Colors = typeof LIGHT;

function svg(body: string) {
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${SIZE}' height='${SIZE}' viewBox='0 0 32 32'><filter id='s' x='-30%' y='-30%' width='160%' height='160%'><feDropShadow dx='0' dy='1.2' stdDeviation='1.1' flood-color='black' flood-opacity='0.28'/></filter><g filter='url(#s)' stroke-linejoin='round' stroke-linecap='round'>${body}</g></svg>`;
}

function arrow({ fill, line }: Colors) {
  return svg(
    `<path d='${ARROW}' fill='${line}' stroke='${line}' stroke-width='8'/><path d='${ARROW}' fill='${fill}' stroke='${fill}' stroke-width='3.6'/>`
  );
}

function hand({ fill, line }: Colors, fingers: string) {
  const palm = (color: string, w: number) =>
    `<rect x='8.5' y='13' width='14.5' height='12' rx='5.5' fill='${color}' stroke='${color}' stroke-width='${w}'/>`;
  return svg(
    `<path d='${fingers}' fill='none' stroke='${line}' stroke-width='6.8'/>${palm(line, 3.4)}<path d='${fingers}' fill='none' stroke='${fill}' stroke-width='3.4'/>${palm(fill, 0)}`
  );
}

async function rasterize(source: string, scale: number) {
  const img = new Image();
  img.src = `data:image/svg+xml,${encodeURIComponent(source)}`;
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE * scale;
  canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
}

/** Qual forma de image-set() o navegador entende no cursor (o Safari antigo só a com prefixo). */
function imageSetName() {
  const test = (fn: string) =>
    CSS.supports('cursor', `${fn}(url("a.png") 1x) 0 0, auto`);
  if (test('image-set')) return 'image-set';
  if (test('-webkit-image-set')) return '-webkit-image-set';
  return null;
}

async function cursorValue(source: string, hotspot: string, fallback: string) {
  const [x1, x2] = await Promise.all([
    rasterize(source, 1),
    rasterize(source, 2),
  ]);
  const set = imageSetName();
  const image = set
    ? `${set}(url("${x1}") 1x, url("${x2}") 2x)`
    : `url("${x1}")`;
  return `${image} ${hotspot}, ${fallback}`;
}

function luminance(color: string) {
  const hex = color.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(hex)) return 0;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

let painted = '';

/** Pinta os cursores para o tema atual (só refaz quando ele passa de claro para escuro ou o contrário). */
async function paint() {
  const root = document.documentElement;
  const css = getComputedStyle(root);
  const base = css.getPropertyValue('--ctp-base').trim();
  const text = css.getPropertyValue('--ctp-text').trim();
  if (!base || !text) return;
  const mode = luminance(base) > luminance(text) ? 'light' : 'dark';
  if (mode === painted) return;
  painted = mode;

  try {
    const colors = mode === 'light' ? LIGHT : DARK;
    const [arrowCursor, grab, grabbing] = await Promise.all([
      cursorValue(arrow(colors), '3 2', 'auto'),
      cursorValue(hand(colors, FINGERS_OPEN), '12 12', 'grab'),
      cursorValue(hand(colors, FINGERS_CLOSED), '12 12', 'grabbing'),
    ]);
    if (painted !== mode) return; // o tema mudou de novo no meio do caminho
    root.style.setProperty('--cursor-arrow', arrowCursor);
    root.style.setProperty('--cursor-grab', grab);
    root.style.setProperty('--cursor-grabbing', grabbing);
    root.setAttribute('data-cursor', '');
  } catch {
    // sem canvas ou sem decodificar a imagem: ficam os cursores do sistema
    painted = '';
  }
}

/**
 * Liga os cursores e os mantém em dia: o tema muda atributos do <html>
 * (data-theme, data-simple e o style), então basta observar ali.
 */
export function startCursor() {
  if (typeof window === 'undefined') return;
  if (!window.matchMedia('(pointer: fine)').matches) return;

  paint();
  new MutationObserver(() => void paint()).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'data-simple', 'style'],
  });
}
