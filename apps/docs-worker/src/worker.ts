type AssetsBinding = {
  fetch: (request: Request) => Promise<Response> | Response;
};

type WorkerHandler<TEnv> = {
  fetch: (request: Request, env: TEnv) => Promise<Response> | Response;
};

interface Env {
  ASSETS: AssetsBinding;
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/worker-health") {
      return Response.json({ status: "ok", app: "patchbay-ui-docs" });
    }

    return env.ASSETS.fetch(request);
  },
} satisfies WorkerHandler<Env>;
