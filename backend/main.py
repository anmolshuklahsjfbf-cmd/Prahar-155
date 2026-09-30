import uvicorn
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.models.schemas import (
    SimulationConfig,
    SimulationResponse,
    MonteCarloRequest,
    MonteCarloResponse
)
from app.simulation.engine import engine

app = FastAPI(
    title="Precision Guidance & Smart Fuze – Simulation Platform API",
    description="Academic / SIH Engineering Simulation API for Guided-Flight Vehicle Dynamics, Sensor Simulation, State Estimation, and Trajectory Correction.",
    version="1.0.0"
)

# Enable CORS for local Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Precision Guidance & Smart Fuze Simulation Backend",
        "mode": "Simulation-Only / Academic",
        "version": "1.0.0"
    }

@app.post("/simulate", response_model=SimulationResponse)
def run_simulation_endpoint(config: SimulationConfig):
    try:
        result = engine.run_simulation(config)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Simulation computation error: {str(e)}"
        )

@app.post("/monte-carlo", response_model=MonteCarloResponse)
def run_monte_carlo_endpoint(req: MonteCarloRequest):
    try:
        result = engine.run_monte_carlo(req)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Monte Carlo computation error: {str(e)}"
        )

@app.get("/simulation/{sim_id}", response_model=SimulationResponse)
def get_simulation_endpoint(sim_id: str):
    if sim_id in engine.cached_simulations:
        return engine.cached_simulations[sim_id]
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Simulation ID '{sim_id}' not found."
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
