# INT-05, FR-SL-15: FastAPI application. Health check, lessons, and the sign library.
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

from api.routes.access import router as access_router
from api.routes.certificates import router as certificates_router
from api.routes.documents import router as documents_router
from api.routes.examples import router as examples_router
from api.routes.glossary import router as glossary_router
from api.routes.jobs import router as jobs_router
from api.routes.lessons import router as lessons_router
from api.routes.lexicon import router as lexicon_router
from api.routes.packs import router as packs_router
from api.routes.phrases import router as phrases_router
from api.routes.progress import router as progress_router
from api.routes.ask import router as ask_router
from api.routes.sign import router as sign_router
from api.routes.stats import router as stats_router
from api.routes.webhooks import router as webhooks_router

ROOT = Path(__file__).resolve().parents[1]


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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "HEAD", "OPTIONS"],
    allow_headers=["*"],
)
app.include_router(lessons_router)
app.include_router(lexicon_router)
app.include_router(phrases_router)
app.include_router(glossary_router)
app.include_router(examples_router)
app.include_router(sign_router)
app.include_router(ask_router)
app.include_router(stats_router)
app.include_router(jobs_router)
app.include_router(documents_router)
app.include_router(certificates_router)
app.include_router(progress_router)
app.include_router(webhooks_router)
app.include_router(packs_router)
app.include_router(access_router)


@app.api_route("/api/v1/health", methods=["GET", "HEAD"])
def health():
    return {"status": "ok"}


def _mount_static():
    """One-container hosting: /module, /demo, /savanna, /pages (Range-capable FileResponse)."""
    pairs = (
        ("/module", ROOT / "module"),
        ("/demo", ROOT / "demo"),
        ("/savanna", ROOT / "savanna"),
        # Same path local nginx used for the Savanna learner homepage.
        ("/pages", ROOT / "savanna" / "pages"),
    )
    for url, path in pairs:
        if path.is_dir():
            app.mount(url, StaticFiles(directory=str(path), html=True), name=url.strip("/").replace("/", "_") or "root")


@app.get("/")
def site_home():
    index = ROOT / "demo" / "index.html"
    if index.is_file():
        return FileResponse(index)
    return RedirectResponse("/demo/")


_mount_static()
