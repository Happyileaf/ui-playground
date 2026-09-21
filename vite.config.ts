import { cpSync } from 'node:fs';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

/**
 * 纯原生案例目录清单
 * 案例内部使用非 module 的经典 script 以保证 file:// 双击可用，
 * Vite 无法将其打包进产物，必须以静态文件形式随构建输出分发
 */
const STANDALONE_CASE_DIRS = ['effects', 'components', 'pages'];

/**
 * 构建后将案例目录原样复制进 dist
 * 案例不作为 Rollup 入口、不经 Vite 改写，保证产物与源码逐字节一致，
 * 下载后双击 index.html 仍可 100% 离线运行
 */
function copyStandaloneCases(): Plugin {
  return {
    name: 'copy-standalone-cases',
    apply: 'build',
    closeBundle() {
      for (const caseDir of STANDALONE_CASE_DIRS) {
        cpSync(
          path.resolve(import.meta.dirname, caseDir),
          path.resolve(import.meta.dirname, 'dist', caseDir),
          { recursive: true },
        );
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), copyStandaloneCases()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
