import {checkLanguage} from './language.js';
export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path === '/api/language-review') return checkLanguage(request, env);
    if (path === '/api/language-status') return Response.json({available: Boolean(env.MISTRAL_API_KEY)}, {headers: {'Cache-Control': 'no-store'}});
    if (path === '/') return env.ASSETS.fetch(new URL('/index.html', request.url));
    return env.ASSETS.fetch(request);
  }
};
