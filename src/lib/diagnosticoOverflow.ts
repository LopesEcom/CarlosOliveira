/**
 * Diagnóstico de rolagem lateral, para rodar no aparelho onde o problema
 * acontece.
 *
 * Como usar: abra qualquer página do site com `?overflow` no fim da URL.
 * Ex.: https://seusite.com/?overflow
 *
 * Um painel aparece no topo listando os elementos que passam da largura da
 * tela, e cada um deles fica com contorno vermelho na página. Tire um print
 * e mande.
 *
 * Este arquivo só é baixado quando o parâmetro está presente: o import é
 * dinâmico, então vira um chunk separado e não pesa para quem visita.
 */
export function diagnosticarOverflow() {
  const vw = document.documentElement.clientWidth

  type Culpado = {
    seletor: string
    passaEm: number
    largura: number
    posicao: string
    contidoPor: string
  }

  const culpados: Culpado[] = []

  for (const el of Array.from(document.querySelectorAll<HTMLElement>('body *'))) {
    const b = el.getBoundingClientRect()
    if (b.width === 0 || b.height === 0) continue

    const passa = b.right + window.scrollX - vw
    if (passa <= 1) continue

    // Quem, se alguém, está clipando este elemento?
    let contidoPor = '(ninguém)'
    let p = el.parentElement
    while (p) {
      const ox = getComputedStyle(p).overflowX
      if (['auto', 'scroll', 'hidden', 'clip'].includes(ox)) {
        contidoPor = `${p.tagName.toLowerCase()} (overflow-x: ${ox})`
        break
      }
      p = p.parentElement
    }

    const classe = (el.className || '').toString().trim().split(/\s+/).slice(0, 3).join('.')
    culpados.push({
      seletor: el.tagName.toLowerCase() + (classe ? '.' + classe : ''),
      passaEm: Math.round(passa),
      largura: Math.round(b.width),
      posicao: getComputedStyle(el).position,
      contidoPor,
    })

    if (contidoPor === '(ninguém)') {
      el.style.outline = '3px solid red'
      el.style.outlineOffset = '-3px'
    }
  }

  culpados.sort((a, b) => b.passaEm - a.passaEm)
  const semContencao = culpados.filter((c) => c.contidoPor === '(ninguém)')

  const painel = document.createElement('div')
  painel.style.cssText = [
    'position:fixed', 'inset:0 0 auto 0', 'z-index:99999',
    'background:#111', 'color:#fff', 'font:12px/1.5 monospace',
    'padding:12px', 'max-height:60vh', 'overflow:auto',
    'white-space:pre-wrap', 'word-break:break-word',
  ].join(';')

  const linhas = [
    `viewport ............. ${vw}px`,
    `html.scrollWidth ..... ${document.documentElement.scrollWidth}px`,
    `body.scrollWidth ..... ${document.body.scrollWidth}px`,
    `html overflow-x ...... ${getComputedStyle(document.documentElement).overflowX}`,
    `rola de lado? ........ ${(() => {
      const antes = window.scrollX
      window.scrollTo(9999, window.scrollY)
      const conseguiu = window.scrollX
      window.scrollTo(antes, window.scrollY)
      return conseguiu > 0 ? `SIM (chegou a ${conseguiu}px)` : 'não'
    })()}`,
    '',
    `passam da largura: ${culpados.length}`,
    `sem contenção: ${semContencao.length}`,
    '',
    ...(semContencao.length
      ? semContencao
          .slice(0, 10)
          .map((c) => `x ${c.seletor}\n  passa ${c.passaEm}px | largura ${c.largura}px | ${c.posicao}`)
      : ['nenhum elemento fora de contenção']),
  ]

  painel.textContent = linhas.join('\n')

  const fechar = document.createElement('button')
  fechar.textContent = 'fechar'
  fechar.style.cssText = 'position:sticky;top:0;float:right;background:#fff;color:#111;border:0;padding:4px 10px;font:12px monospace'
  fechar.onclick = () => painel.remove()
  painel.prepend(fechar)

  document.body.appendChild(painel)
}
