from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas
from ..core.dependencies import get_current_business

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("/", response_model=List[schemas.InventoryItemResponse])
def get_inventory_items(
    db: Session = Depends(get_db),
    current_business: models.Business = Depends(get_current_business)
):
    return db.query(models.InventoryItem).filter(
        models.InventoryItem.business_id == current_business.id
    ).order_by(models.InventoryItem.id.desc()).all()

@router.post("/", response_model=schemas.InventoryItemResponse)
def create_inventory_item(
    data: schemas.InventoryItemCreate,
    db: Session = Depends(get_db),
    current_business: models.Business = Depends(get_current_business)
):
    item = models.InventoryItem(
        business_id=current_business.id,
        name=data.name.strip(),
        category=data.category,
        quantity=data.quantity,
        unit=data.unit,
        min_stock=data.min_stock,
        price=data.price,
        supplier=data.supplier.strip() if data.supplier else None
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put("/{id}", response_model=schemas.InventoryItemResponse)
def update_inventory_item(
    id: int,
    data: schemas.InventoryItemUpdate,
    db: Session = Depends(get_db),
    current_business: models.Business = Depends(get_current_business)
):
    item = db.query(models.InventoryItem).filter(
        models.InventoryItem.id == id,
        models.InventoryItem.business_id == current_business.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")

    if data.name is not None:
        item.name = data.name.strip()
    if data.category is not None:
        item.category = data.category
    if data.quantity is not None:
        item.quantity = data.quantity
    if data.unit is not None:
        item.unit = data.unit
    if data.min_stock is not None:
        item.min_stock = data.min_stock
    if data.price is not None:
        item.price = data.price
    if data.supplier is not None:
        item.supplier = data.supplier.strip() if data.supplier else None

    db.commit()
    db.refresh(item)
    return item

@router.delete("/{id}")
def delete_inventory_item(
    id: int,
    db: Session = Depends(get_db),
    current_business: models.Business = Depends(get_current_business)
):
    item = db.query(models.InventoryItem).filter(
        models.InventoryItem.id == id,
        models.InventoryItem.business_id == current_business.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")

    db.delete(item)
    db.commit()
    return {"message": "Inventory item deleted successfully"}
