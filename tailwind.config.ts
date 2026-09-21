import type { Config } from 'tailwindcss'

/**
 * Design System — Carlos Oliveira, escultor entalhador
 * Paleta tirada da madeira: nogueira escura, cerne claro e um cinza quente.
 * Sem cor de acento: quem dá cor ao site são as fotos das peças.
 * Todos os valores abaixo apontam para as CSS variables declaradas em
 * src/index.css, que é a fonte única de verdade dos tokens.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      /**
       * O placeholder `<alpha-value>` é obrigatório: é ele que permite
       * `text-tinta/70`, `bg-creme/95` etc. Por isso as variáveis guardam
       * o trio de canais, e não o hex.
       */
      colors: {
        tinta: 'rgb(var(--tinta-rgb) / <alpha-value>)',
        branco: 'rgb(var(--branco-rgb) / <alpha-value>)',
        creme: 'rgb(var(--creme-rgb) / <alpha-value>)',
        cinza: 'rgb(var(--cinza-rgb) / <alpha-value>)',
        borda: 'rgb(var(--borda-rgb) / <alpha-value>)',
        'borda-sutil': 'rgb(var(--borda-sutil-rgb) / <alpha-value>)',
        sucesso: 'rgb(var(--sucesso-rgb) / <alpha-value>)',
        erro: 'rgb(var(--erro-rgb) / <alpha-value>)',
      },

      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-corpo)'],
      },

      fontSize: {
        h1: ['var(--fs-h1)', { lineHeight: '1.1', letterSpacing: '0.06em' }],
        h2: ['var(--fs-h2)', { lineHeight: '1.15', letterSpacing: '0.08em' }],
        h3: ['var(--fs-h3)', { lineHeight: '1.2', letterSpacing: '0.1em' }],
        h4: ['var(--fs-h4)', { lineHeight: '1.3', letterSpacing: '0.12em' }],
        h5: ['var(--fs-h5)', { lineHeight: '1.4', letterSpacing: '0.14em' }],
        h6: ['var(--fs-h6)', { lineHeight: '1.4', letterSpacing: '0.18em' }],
      },

      letterSpacing: {
        largo: '0.18em',
        'largo-lg': '0.24em',
      },

      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        none: 'none',
      },

      borderRadius: {
        // Cantos retos são a regra da marca. `rounded` continua existindo
        // apenas para o raro caso de um elemento circular (avatar, badge).
        none: '0',
        DEFAULT: '0',
      },

      maxWidth: {
        conteudo: 'var(--largura-conteudo)',
      },

      spacing: {
        secao: 'var(--espaco-secao)',
      },

      transitionDuration: {
        DEFAULT: '300ms',
      },

      transitionTimingFunction: {
        suave: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config
