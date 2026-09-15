import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Глобальный слой стилей: токены и сброс. Стили компонентов импортируют
// сами компоненты — по файлу на компонент, рядом с ним.
import './styles/variables.css'
import './styles/base.css'

import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
