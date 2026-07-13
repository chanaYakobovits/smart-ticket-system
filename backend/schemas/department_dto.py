from pydantic import BaseModel

class DepartmentDTO(BaseModel):
    id: int
    department_name: str

    class Config:
        from_attributes = True

