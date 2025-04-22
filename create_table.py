# create_tables.py

from backend.database import engine
from backend.models import Base

print("Criando tabelas no banco de dados Render...")

Base.metadata.create_all(bind=engine)

print("Tabelas criadas com sucesso!")
