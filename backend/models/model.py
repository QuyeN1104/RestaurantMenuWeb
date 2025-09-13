from sqlalchemy import Column, Float, String, Integer, ForeignKey
from sqlalchemy.orm import relationship

from db.database import Base

class Category(Base):
    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, unique=True, index=True, nullable=False)

    foods = relationship('Food', back_populates='category', cascade='all,delete-orphan')



class Food(Base):
    __tablename__ = 'foods'
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, unique=True, index=True)
    cost = Column(Float, nullable=False)
    category_id = Column(Integer, ForeignKey('categories.id', ondelete='CASCADE'), nullable=False, index=True)

    category = relationship('Category', back_populates='foods')

