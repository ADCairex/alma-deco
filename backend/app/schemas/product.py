from pydantic import BaseModel, model_validator


class Product(BaseModel):
    id: str
    name: str
    price: float
    currency: str
    image_url: str
    images: list[str] = []
    description: str
    category: str
    stock: int


class ProductCreate(BaseModel):
    id: str
    name: str
    price: float
    currency: str = "EUR"
    image_url: str = ""
    images: list[str] = []
    description: str
    category: str
    stock: int

    @model_validator(mode="after")
    def sync_images(self) -> "ProductCreate":
        if self.images and not self.image_url:
            self.image_url = self.images[0]
        elif self.image_url and not self.images:
            self.images = [self.image_url]
        return self


class ProductUpdate(BaseModel):
    name: str | None = None
    price: float | None = None
    currency: str | None = None
    image_url: str | None = None
    images: list[str] | None = None
    description: str | None = None
    category: str | None = None
    stock: int | None = None

    @model_validator(mode="after")
    def sync_images(self) -> "ProductUpdate":
        if self.images is not None and not self.image_url:
            self.image_url = self.images[0] if self.images else self.image_url
        elif self.image_url is not None and self.images is None:
            self.images = [self.image_url]
        return self
