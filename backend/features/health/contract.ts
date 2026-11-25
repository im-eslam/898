export type HealthResponse = { ok: true; database: "up" };

export type HealthRoutes = {
  "GET /api/health": { response: HealthResponse; errors: "UNAVAILABLE" };
};
