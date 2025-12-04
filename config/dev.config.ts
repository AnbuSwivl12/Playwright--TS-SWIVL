import { defineConfig } from '@playwright/test';

export default defineConfig  ({
    use: {
        baseURL: 'http://develop.swivl.tech',
        credentials: {
            email: process.env.DEVELOP_USER_EMAIL || '',
            password: process.env.DEVELOP_USER_PASSWORD || '',
        },
    },
});
    