from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from .. import models, database
from ..core.dependencies import get_current_business
import shutil, os

router = APIRouter(prefix="/measurements", tags=["Measurements"])
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/")
def get_measurements(db: Session = Depends(database.get_db), current_business: models.Business = Depends(get_current_business)):
    return db.query(models.Measurement).filter(models.Measurement.business_id == current_business.id).all()

@router.post("/")
def create_measurement(
    customer_id:   int   = Form(...),
    garment_type:  str   = Form(...),
    gender:        str   = Form(None),
    chest:         float = Form(None),
    waist:         float = Form(None),
    hips:          float = Form(None),
    shoulder:      float = Form(None),
    sleeve:        float = Form(None),
    inseam:        float = Form(None),
    neck:          float = Form(None),
    bust:          float = Form(None),
    hip:           float = Form(None),
    armhole:       float = Form(None),
    sleeve_length: float = Form(None),
    sleeve_round:  float = Form(None),
    length:        float = Form(None),
    neck_depth:    float = Form(None),
    neck_width:    float = Form(None),
    collar:        float = Form(None),
    thigh:         float = Form(None),
    knee:          float = Form(None),
    ankle:         float = Form(None),
    bottom_width:  float = Form(None),
    rise:          float = Form(None),
    flare:         float = Form(None),
    upper_chest:   float = Form(None),
    under_bust:    float = Form(None),
    calf:          float = Form(None),
    notes:         str   = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(database.get_db),
    current_business: models.Business = Depends(get_current_business)
):
    image_path = None
    if file:
        file_location = f"{UPLOAD_DIR}/{file.filename}"
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        image_path = file_location

    m = models.Measurement(
        customer_id=customer_id, garment_type=garment_type, gender=gender,
        chest=chest, waist=waist, hips=hips, shoulder=shoulder,
        sleeve=sleeve, inseam=inseam, neck=neck,
        bust=bust, hip=hip, armhole=armhole,
        sleeve_length=sleeve_length, sleeve_round=sleeve_round,
        length=length, neck_depth=neck_depth, neck_width=neck_width,
        collar=collar, thigh=thigh, knee=knee, ankle=ankle,
        bottom_width=bottom_width, rise=rise, flare=flare,
        upper_chest=upper_chest, under_bust=under_bust, calf=calf,
        notes=notes, image=image_path, business_id=current_business.id
    )
    db.add(m)
    db.commit()
    db.refresh(m)
    return m

@router.put("/{id}")
def update_measurement(
    id:            int,
    customer_id:   int   = Form(...),
    garment_type:  str   = Form(...),
    gender:        str   = Form(None),
    chest:         float = Form(None),
    waist:         float = Form(None),
    hips:          float = Form(None),
    shoulder:      float = Form(None),
    sleeve:        float = Form(None),
    inseam:        float = Form(None),
    neck:          float = Form(None),
    bust:          float = Form(None),
    hip:           float = Form(None),
    armhole:       float = Form(None),
    sleeve_length: float = Form(None),
    sleeve_round:  float = Form(None),
    length:        float = Form(None),
    neck_depth:    float = Form(None),
    neck_width:    float = Form(None),
    collar:        float = Form(None),
    thigh:         float = Form(None),
    knee:          float = Form(None),
    ankle:         float = Form(None),
    bottom_width:  float = Form(None),
    rise:          float = Form(None),
    flare:         float = Form(None),
    upper_chest:   float = Form(None),
    under_bust:    float = Form(None),
    calf:          float = Form(None),
    notes:         str   = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(database.get_db),
    current_business: models.Business = Depends(get_current_business)
):
    m = db.query(models.Measurement).filter(models.Measurement.id == id, models.Measurement.business_id == current_business.id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Measurement not found")

    m.customer_id = customer_id
    m.garment_type = garment_type
    m.gender = gender
    m.chest = chest;   m.waist = waist;  m.hips = hips
    m.shoulder = shoulder; m.sleeve = sleeve; m.inseam = inseam; m.neck = neck
    m.bust = bust;     m.hip = hip;      m.armhole = armhole
    m.sleeve_length = sleeve_length;     m.sleeve_round = sleeve_round
    m.length = length; m.neck_depth = neck_depth; m.neck_width = neck_width
    m.collar = collar; m.thigh = thigh;  m.knee = knee
    m.ankle = ankle;   m.bottom_width = bottom_width
    m.rise = rise;     m.flare = flare;  m.notes = notes
    m.upper_chest = upper_chest; m.under_bust = under_bust; m.calf = calf

    if file:
        file_location = f"uploads/{file.filename}"
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        m.image = file_location

    db.commit()
    db.refresh(m)
    return m

@router.delete("/{id}")
def delete_measurement(
    id: int,
    db: Session = Depends(database.get_db),
    current_business: models.Business = Depends(get_current_business)
):
    m = db.query(models.Measurement).filter(
        models.Measurement.id == id,
        models.Measurement.business_id == current_business.id
    ).first()
    if not m:
        raise HTTPException(status_code=404, detail="Measurement not found")

    db.delete(m)
    db.commit()
    return {"message": "Measurement deleted successfully"}