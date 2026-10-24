from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User
from app.models.audit import AuditLog
from app.schemas.user import (
    UserCreate, UserLogin, UserProfileUpdate, UserPasswordUpdate, UserPasswordResetRequest, UserOut, Token
)
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
        
    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        email=user_in.email,
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        role=user_in.role or "engineer",
        department=user_in.department or "Site Reliability Engineering"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Audit log
    audit = AuditLog(
        action="USER_REGISTERED",
        target_type="USER",
        target_id=str(user.id),
        user_email=user.email,
        details={"role": user.role}
    )
    db.add(audit)
    db.commit()
    
    token = create_access_token(subject=user.email, role=user.role)
    return Token(access_token=token, token_type="bearer", user=user)

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive account.")
        
    token = create_access_token(subject=user.email, role=user.role)
    
    audit = AuditLog(
        action="LOGIN_SUCCESS",
        target_type="USER",
        target_id=str(user.id),
        user_email=user.email,
        details={"client": "web"}
    )
    db.add(audit)
    db.commit()
    
    return Token(access_token=token, token_type="bearer", user=user)

@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserOut)
def update_profile(
    profile_in: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if profile_in.full_name is not None:
        current_user.full_name = profile_in.full_name
    if profile_in.department is not None:
        current_user.department = profile_in.department
    if profile_in.notification_email is not None:
        current_user.notification_email = profile_in.notification_email
    if profile_in.notification_slack is not None:
        current_user.notification_slack = profile_in.notification_slack
    if profile_in.notification_sms is not None:
        current_user.notification_sms = profile_in.notification_sms
    if profile_in.sound_alerts is not None:
        current_user.sound_alerts = profile_in.sound_alerts
    if profile_in.auto_refresh_enabled is not None:
        current_user.auto_refresh_enabled = profile_in.auto_refresh_enabled
        
    db.commit()
    db.refresh(current_user)
    
    audit = AuditLog(
        action="PROFILE_UPDATED",
        target_type="USER",
        target_id=str(current_user.id),
        user_email=current_user.email,
        details={"updated_fields": list(profile_in.model_dump(exclude_unset=True).keys())}
    )
    db.add(audit)
    db.commit()
    
    return current_user

@router.post("/change-password")
def change_password(
    pwd_in: UserPasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(pwd_in.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password verification failed."
        )
    current_user.hashed_password = get_password_hash(pwd_in.new_password)
    db.commit()
    
    audit = AuditLog(
        action="PASSWORD_CHANGED",
        target_type="USER",
        target_id=str(current_user.id),
        user_email=current_user.email,
        details={}
    )
    db.add(audit)
    db.commit()
    
    return {"status": "success", "message": "Password updated successfully."}

@router.post("/reset-password")
def request_password_reset(reset_in: UserPasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == reset_in.email).first()
    # Always return a non-revealing response to protect against user enumeration
    if user:
        audit = AuditLog(
            action="PASSWORD_RESET_REQUESTED",
            target_type="USER",
            target_id=str(user.id),
            user_email=user.email,
            details={"email": reset_in.email}
        )
        db.add(audit)
        db.commit()
        
    return {
        "status": "success",
        "message": f"If an account exists for {reset_in.email}, instructions have been routed to configured infrastructure."
    }
