
# Start the FastAPI app in the foreground
# Using 'exec' ensures that App Runner can cleanly shut down the server when needed
echo "🚀 Starting FastAPI server..."
exec uvicorn main:app --host 0.0.0.0 --port 8000