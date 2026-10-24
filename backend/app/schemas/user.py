from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = "Ops Lead"
    role: Optional[str] = "engineer"
    department: Optional[str] = "Site Reliability Engineering"
    notification_email: Optional[bool] = True
    notification_slack: Optional[bool] = True
    notification_sms: Optional[bool] = False
    sound_alerts: Optional[bool] = True
    auto_refresh_enabled: Optional[bool] = True

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    role: Optional[str] = "engineer"
    department: Optional[str] = "Site Reliability Engineering"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)

class UserPasswordResetRequest(BaseModel):
    email: EmailStr

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    notification_email: Optional[bool] = None
    notification_slack: Optional[bool] = None
    notification_sms: Optional[bool] = None
    sound_alerts: Optional[bool] = None
    auto_refresh_enabled: Optional[bool] = None

class UserOut(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None
