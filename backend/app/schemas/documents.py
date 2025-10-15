from pydantic import BaseModel


class DocumentItem(BaseModel):
    id: str
    title: str
    required: bool = False


class DocumentsPayload(BaseModel):
    version: int
    items: list[DocumentItem]
