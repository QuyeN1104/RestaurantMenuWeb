from fastapi import APIRouter, Path
from db.database import get_db, SessionLocal
from schemas.schema import Item, CategoryCreate

router = APIRouter(prefix='/api')


@router.get('/health')
def health():
    return {'status':'ok'}

@router.post('/category/add')
def add_category(category:CategoryCreate, db:):
    pass