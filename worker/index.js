const jsonHeaders = {
  'cache-control': 'no-store',
  'content-type': 'application/json; charset=utf-8',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/health') {
      return new Response(
        JSON.stringify({
          ok: true,
          service: 'the-system-sites-compatibility',
          aiConfigured: Boolean(env.OPENAI_API_KEY),
        }),
        { headers: jsonHeaders },
      );
    }

    return env.ASSETS.fetch(request);
  },
};
