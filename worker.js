// Starwarts：把 /sbapi/... 的请求转发给 Supabase（让被浏览器插件拦截的设备也能连上数据库）
// 网页文件（index.html、teacher.html）照常由 Cloudflare 提供。
const SUPABASE = 'https://rxnaklyaiquqlmjymzkk.supabase.co';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/sbapi/rest/v1/')) {
      if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
      const target = (env.SUPABASE_TARGET || SUPABASE) + url.pathname.slice('/sbapi'.length) + url.search;
      const headers = new Headers();
      for (const h of ['apikey', 'authorization', 'content-type', 'accept', 'accept-profile', 'content-profile', 'prefer', 'x-client-info'])
        if (request.headers.get(h)) headers.set(h, request.headers.get(h));
      const resp = await fetch(target, {
        method: request.method, headers,
        body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer()
      });
      const out = new Headers(resp.headers);
      out.delete('set-cookie');
      return new Response(resp.body, { status: resp.status, headers: out });
    }
    return env.ASSETS.fetch(request);
  }
};
