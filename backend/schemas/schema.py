from pydantic import BaseModel, Field
from typing import List

class ItemCreate(BaseModel):
    name:str
    cost:float

class ItemRead(ItemCreate):
    id:int
    class Config:
        from_attributes = True


class CategoryCreate(BaseModel):
    name:str

class CategoryRead(CategoryCreate):
    id: int
    foods: List[ItemRead]
    class Config:
        from_attributes = True




