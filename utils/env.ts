import urls from '../testdata/urls.json';

export function getEnvconfig(env: string) {
    if (!urls[env]) {
        throw new Error(`Environment ${env} is not defined in urls.json`);
    }
    return urls[env];
}