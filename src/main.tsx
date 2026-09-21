import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App.tsx'
import './index.css'

/**
 * As tags de SEO do index.html existem para os robôs que NÃO executam
 * JavaScript (preview de link do WhatsApp, Facebook). A partir daqui quem
 * manda é o <Seo>, que gera as tags por rota.
 *
 * Sem esta limpeza o documento fica com duas <meta name="description"> — e a
 * estática, por vir primeiro, é a que o Google considera, anulando as
 * descrições de cada página.
 */
document.querySelectorAll('[data-seo-estatico]').forEach((tag) => tag.remove())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

/**
 * Diagnóstico de rolagem lateral, ligado por `?overflow` na URL.
 *
 * Existe porque o problema aparece no aparelho da cliente e não se reproduz
 * em teste aqui. Com o parâmetro, um painel mostra na própria tela quais
 * elementos passam da largura.
 *
 * O import é dinâmico de propósito: vira um chunk separado e não é baixado
 * por quem visita o site normalmente.
 */
if (new URLSearchParams(location.search).has('overflow')) {
  import('./lib/diagnosticoOverflow')
    .then(({ diagnosticarOverflow }) => setTimeout(diagnosticarOverflow, 1500))
    .catch(() => {})
}
