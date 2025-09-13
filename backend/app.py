from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from router.router import router
from db.database import init_db


app = FastAPI(
    title='Menu API',
)

@app.on_event('startup')
def on_startup(): init_db()


app.add_middleware(
    CORSMiddleware
)

app.include_router(router)



