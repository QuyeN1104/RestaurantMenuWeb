from fastapi import APIRouter, Depends, HTTPException, status, Path, Response
from sqlalchemy.orm import Session, selectinload
from db.database import get_db, SessionLocal
from models.model import Category, Food
from schemas.schema import *

router = APIRouter(prefix='/api')


@router.get('/health')
def health():
    return {'status':'ok'}


# add a category into menu
@router.post('/categories/add', response_model=CategoryRead, status_code=201)
def add_category(payload:CategoryCreate, db:Session = Depends(get_db)):
    #pre-check for duplicate name
    existing = db.query(Category).filter(Category.name==payload.name).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='Category name is already exists')
    
    category = Category(name=payload.name)
    db.add(category); db.commit(); db.refresh(category)
    return category


# show all categories in menu
@router.get('/categories/show', response_model=List[CategoryRead], status_code=200)
def show_categories(db:Session = Depends(get_db)):
    return db.query(Category).options(selectinload(Category.foods)).all()


@router.delete('/categories/{category_id}')
def delete_category(
    db:Session = Depends(get_db),
    category_id:int = Path(...),
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail='Category not found')
    
    try:
        db.query(Food).filter(Food.category_id == category_id).delete(synchronize_session=False)
        db.delete(category)
        db.commit()
        return Response(status_code=204)
    except:
        db.rollback()
        raise HTTPException(status_code=500, detail='Error while deleting that category')



# -----Food--------
@router.post('/categories/{category_id}/foods', response_model=ItemRead, status_code=201)
def add_food(
    payload: ItemCreate,
    category_id:int = Path(...),
    db:Session = Depends(get_db)
):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=400, detail='Not found category')
    
    food = Food(name=payload.name, cost=payload.cost, category_id=cat.id)
    db.add(food)
    db.commit()
    db.refresh(food)
    return food

