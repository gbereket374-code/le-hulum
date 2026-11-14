# INT-05: FastAPI application. Health check until the lesson routes are connected.
from fastapi import FastAPI

app = FastAPI(
    title="LE HULUM",
    version="0.0.0",
    docs_url="/api/docs",
    redoc_url=None,
    openapi_url="/api/openapi.json",
)


@app.api_route("/api/v1/health", methods=["GET", "HEAD"])
def health():
    return {"status": "ok"}
