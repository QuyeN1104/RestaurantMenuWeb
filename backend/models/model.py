from sqlalchemy import Column, Float, String, Integer
from sqlalchemy.orm import relationship

from db.database import Base

class Category(Base):
    __tablename__ = 'categories'

    name = Column(String, primary_key=True, index=True)

    foods = relationship('Food', back_populates='category')

class Food(Base):
    __tablename__ = 'foods'
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, index=True)
    cost = Column(Float, nullable=False)
    category = Column(String, ForeignKey='categories.name')

    category = relationship('Category', back_populates='foods')

