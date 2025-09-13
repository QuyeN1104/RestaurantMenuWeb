from pydantic import BaseModel
from typing import List

class Item(BaseModel):
    name:str
    cost:float

class CategoryCreate(BaseModel):
    name:str




