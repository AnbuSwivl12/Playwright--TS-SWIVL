import { defineConfig } from '@playwright/test';
export default defineConfig({
    use: {
        baseURL: 'http://staging.swivl.tech',
    },
});