import os
import time
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import ENVIRONMENT
from api.db import init_db
from api.routers import auth, chat, settings

# --- 1. Setup Structured Logging ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
# Updated the logger name to reflect the new project
logger = logging.getLogger("Meridian_Support_Engine")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"🚀 Starting Meridian backend in [{ENVIRONMENT.upper()}] mode...")
    init_db()
    yield
    logger.info("🛑 Shutting down server...")

# Updated the FastAPI app title
app = FastAPI(title="Meridian Support Engine", lifespan=lifespan)

@app.get("/")
async def root_health_check():
    # Updated the root endpoint response
    return {"status": "ok", "message": "Meridian Support Engine is running!"}

# --- 2. Observability Middleware ---
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.perf_counter()
    try:
        response = await call_next(request)
        process_time = time.perf_counter() - start_time
        logger.info(f"Method: {request.method} | Path: {request.url.path} | Status: {response.status_code} | Latency: {process_time:.4f}s")
        response.headers["X-Process-Time"] = str(process_time)
        return response
    except Exception as e:
        process_time = time.perf_counter() - start_time
        logger.error(f"Method: {request.method} | Path: {request.url.path} | Status: 500 | Latency: {process_time:.4f}s | Error: {str(e)}", exc_info=True)
        raise

app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"], 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(settings.router)
app.include_router(chat.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)