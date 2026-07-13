from pydantic import BaseModel


class UserTypeDTO(BaseModel):
    id: int
    description: str

    class Config:
        from_attributes = True