from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add engine root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from engine.tools.context_manager import ContextManager

app = FastAPI(title="Black Box Engine API")

# Allow CORS for local React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/status")
def get_status():
    # Helper to get context health
    health = ContextManager.check_health(1000) # Mock value for now
    return {
        "status": "online",
        "context_health": health,
        "current_task": "Building GUI"
    }

@app.get("/tasks")
def get_tasks():
    # Read task.md
    task_path = os.path.expanduser("~/.gemini/antigravity/brain/6aed30c3-56d2-4d13-aa87-098ca08eaf51/task.md")
    if os.path.exists(task_path):
        with open(task_path, "r") as f:
            content = f.read()
        return {"content": content}
    return {"content": "Task file not found."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
