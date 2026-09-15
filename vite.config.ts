import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Проект публикуется в подпапке GitHub Pages: https://rerank.github.io/caclDmgOldenEra/
  // Без этого на Pages отвалятся ассеты. В dev адрес тоже будет с префиксом.
  base: '/caclDmgOldenEra/',
})
