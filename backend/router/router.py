from fastapi import APIRouter, Path
from db.database import get_db, db_menu
from schemas.schema import Category, Item

router = APIRouter(prefix='/api')


@router.get('/list')
def get_list():
    return get_db()


@router.post('/category')
def add_category(category: str):
    get_db()[category] = []
    
