import { defineConfig } from "@playwright/test";
export default defineConfig({
    use: {
        baseURL: 'http://uat.swivl.tech',
    },
});