import type { ReactNode } from 'react'

import EstruturaSite from '../../components/EstruturaSite'

/** Todas as páginas do site público. Ver EstruturaSite. */
export default function LayoutSite({ children }: { children: ReactNode }) {
  return <EstruturaSite>{children}</EstruturaSite>
}
