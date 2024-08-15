import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Length': '1000000'
    }
  }
});
