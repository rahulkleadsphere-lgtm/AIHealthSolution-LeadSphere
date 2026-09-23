import bcrypt
import uuid
from sqlalchemy.orm import Session
from ..models.user_model import User

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_user(db: Session, name: str, email: str, password: str):
    hashed = hash_password(password)
    new_user = User(
        id=str(uuid.uuid4()),
        name=name,
        email=email.lower(),
        hashed_password=hashed,
        role="user"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email.lower()).first()

def get_user_by_id(db: Session, user_id: str):
    return db.query(User).filter(User.id == user_id).first()
