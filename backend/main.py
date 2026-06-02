from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
import models, schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)
app = FastAPI(title="Inventory & Order Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root(): return {"message": "Welcome to Inventory API"}

@app.post("/products/", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    if db.query(models.Product).filter(models.Product.sku == product.sku).first():
        raise HTTPException(status_code=400, detail="SKU registered")
    new_product = models.Product(**product.dict())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@app.get("/products/", response_model=list[schemas.Product])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Product).offset(skip).limit(limit).all()

@app.post("/customers/", response_model=schemas.Customer)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    if db.query(models.Customer).filter(models.Customer.email == customer.email).first():
        raise HTTPException(status_code=400, detail="Email registered")
    new_customer = models.Customer(**customer.dict())
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return new_customer

@app.get("/customers/", response_model=list[schemas.Customer])
def read_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Customer).offset(skip).limit(limit).all()

@app.post("/orders/", response_model=schemas.Order)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == order.customer_id).first()
    if not customer: raise HTTPException(status_code=404, detail="Customer not found")
    product = db.query(models.Product).filter(models.Product.id == order.product_id).with_for_update().first()
    if not product: raise HTTPException(status_code=404, detail="Product not found")
    if product.stock < order.quantity: raise HTTPException(status_code=400, detail="Insufficient stock")
    
    product.stock -= order.quantity
    new_order = models.Order(**order.dict(), status="Completed")
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order

@app.get("/orders/", response_model=list[schemas.Order])
def read_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Order).offset(skip).limit(limit).all()
