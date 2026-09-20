import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          fireworks: path.resolve(__dirname, 'effects/fireworks/index.html'),
          magneticButton: path.resolve(__dirname, 'effects/magnetic-button/index.html'),
          particleText: path.resolve(__dirname, 'effects/particle-text/index.html'),
          liquidButton: path.resolve(__dirname, 'effects/liquid-button/index.html'),
          cursorFollow: path.resolve(__dirname, 'effects/cursor-follow/index.html'),
          buttonComponent: path.resolve(__dirname, 'components/button/index.html'),
          cardComponent: path.resolve(__dirname, 'components/card/index.html'),
          modalComponent: path.resolve(__dirname, 'components/modal/index.html'),
          tooltipComponent: path.resolve(__dirname, 'components/tooltip/index.html'),
          navigationComponent: path.resolve(__dirname, 'components/navigation/index.html'),
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
