# INT-05, FR-SL-15: FastAPI application. Health check, lessons, and the sign library.
from contextlib import asynccontextmanager

from fastapi import FastAPI

from api.routes.examples import router as examples_router
from api.routes.glossary import router as glossary_router
from api.routes.lessons import router as lessons_router
from api.routes.lexicon import router as lexicon_router
from api.routes.phrases import router as phrases_router
from api.routes.sign import router as sign_router


@asynccontextmanager
async def lifespan(_app):
    from api.db import get_engine
    from api.library import rules
    from api.seed import seed_if_empty
    get_engine()
    rules()
    seed_if_empty()
    yield


app = FastAPI(
    title="LE HULUM",
    version="0.0.0",
    docs_url="/api/docs",
    redoc_url=None,
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)
app.include_router(lessons_router)
app.include_router(lexicon_router)
app.include_router(phrases_router)
app.include_router(glossary_router)
app.include_router(examples_router)
app.include_router(sign_router)


@app.api_route("/api/v1/health", methods=["GET", "HEAD"])
def health():
    return {"status": "ok"}
