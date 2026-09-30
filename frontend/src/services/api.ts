import {
  SimulationConfig,
  SimulationResponse,
  MonteCarloRequest,
  MonteCarloResponse,
} from '../types/simulation';

const API_BASE = 'http://127.0.0.1:8000';

export async function checkBackendHealth(): Promise<{ status: string; service: string }> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`Health check failed with ${res.status}`);
    return await res.json();
  } catch (err) {
    // Also try relative /api in case Vite proxy is used
    try {
      const resProxy = await fetch('/api/health', { signal: AbortSignal.timeout(2000) });
      if (resProxy.ok) return await resProxy.json();
    } catch {}
    throw err;
  }
}

export async function runSimulationApi(config: SimulationConfig): Promise<SimulationResponse> {
  const urls = [`${API_BASE}/simulate`, `/api/simulate`];
  let lastError: any = null;

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        return await res.json();
      }
      const errText = await res.text();
      lastError = new Error(`Simulation failed (${res.status}): ${errText}`);
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError || new Error('Could not connect to simulation API backend.');
}

export async function runMonteCarloApi(req: MonteCarloRequest): Promise<MonteCarloResponse> {
  const urls = [`${API_BASE}/monte-carlo`, `/api/monte-carlo`];
  let lastError: any = null;

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
      if (res.ok) {
        return await res.json();
      }
      const errText = await res.text();
      lastError = new Error(`Monte Carlo failed (${res.status}): ${errText}`);
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError || new Error('Could not connect to Monte Carlo backend.');
}

export async function getSimulationByIdApi(id: string): Promise<SimulationResponse> {
  const urls = [`${API_BASE}/simulation/${id}`, `/api/simulation/${id}`];
  let lastError: any = null;

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError || new Error(`Simulation ${id} not found.`);
}
