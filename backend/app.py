from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from router.router import router

app = FastAPI(
    title='Menu API',
)

# app.add_middleware(
#     CORSMiddleware
# )

app.include_router(router)

