import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import compressPlugin from 'vite-plugin-compression'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 根据当前工作目录中的 `mode` 加载 .env 文件
  // 设置第三个参数为 '' 来加载所有环境变量，而不管是否有 `VITE_` 前缀。
  const env = loadEnv(mode, process.cwd(), 'VITE')
 
  return {
    base: env.VITE_BASE,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
      extensions: ['.js', '.json', 'jsx', '.vue', '.ts'] // 使用路径别名时想要省略的后缀名，可以自己 增减
    },
    root: process.cwd(),
    assetsInclude: ['./src/assets'],
    plugins: [vue(), vueJsx({}), compressPlugin()],
    define: {
      __APP_ENV__: env.APP_ENV
    },
    build: {
      chunkSizeWarningLimit: 1000
    },
    server: {
      proxy: {
        // 代理所有以 /v1 开头的请求到后端服务器
        '/api': {
          target: 'http://localhost:8888/', // 后端服务器的地址
          changeOrigin: true, // 是否更改请求的源头
          secure: false, // 如果是https接口，需要配置这个参数
          // 可选：重写路径（如果需要）
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  }
})
