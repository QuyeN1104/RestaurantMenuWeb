from pydantic import BaseModel, Field
from typing import List, Optional

class ItemCreate(BaseModel):
    name:str
    cost:float

class ItemRead(ItemCreate):
    id:int
    class Config:
        from_attributes = True

# update
class ItemUpdate(BaseModel):
    name:Optional[str] = None
    cost:Optional[float] = None

class CategoryCreate(BaseModel):
    name:str

class CategoryRead(CategoryCreate):
    id: int
    foods: List[ItemRead]
    class Config:
        from_attributes = True

#New 
class CategoryUpdate(BaseModel):
    name:Optional[str] = None



