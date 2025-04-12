# Etapa 1: construir o frontend
FROM node:20 AS builder
WORKDIR /app
COPY frontend ./frontend
WORKDIR /app/frontend
RUN npm install && npm run build

# Etapa 2: rodar FastAPI e servir frontend
FROM python:3.11-slim
WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y build-essential

# Copiar backend
COPY backend ./backend

# Copiar frontend compilado
COPY --from=builder /app/frontend/dist ./frontend/build

# Instalar dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Expor a porta
EXPOSE 8000

# Rodar o FastAPI
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
