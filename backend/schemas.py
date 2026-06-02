from pydantic import BaseModel, EmailStr
from typing import List, Optional
import datetime

class ProductBase(BaseModel):
    name: str
    sku: str
    price: float
    stock: int

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    class Config:
        orm_mode = True

class CustomerBase(BaseModel):
    name: str
    email: EmailStr

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int
    class Config:
        orm_mode = True

class OrderBase(BaseModel):
    customer_id: int
    product_id: int
    quantity: int

class OrderCreate(OrderBase):
    pass

class Order(OrderBase):
    id: int
    order_date: datetime.datetime
    status: str
    class Config:
        orm_mode = True
