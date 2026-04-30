# Use the official uv image to get the binary
FROM ghcr.io/astral-sh/uv:latest AS uv_bin

# Now start your actual python image
FROM python:3.12-slim

# Copy the uv binary from the uv image
COPY --from=uv_bin /uv /uvx /bin/

# Set the working directory
WORKDIR /app

# Enable bytecode compilation for faster startup
ENV UV_COMPILE_BYTECODE=1

# Copy only the dependency files first (for better caching)
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen --no-install-project --no-dev

# Copy the rest of the application
COPY . .

# Place the virtualenv created by uv sync on the PATH
ENV PATH="/app/.venv/bin:$PATH"


# Expose the port
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]