import subprocess
import os

print("Setting up local Maven Home inside workspace...")
workspace_path = "/Users/pankajkumar/Desktop/PROJECT/resume-1/medinexa"
local_m2 = os.path.join(workspace_path, "velocura-backend", ".m2")
os.makedirs(local_m2, exist_ok=True)

# Set environment variable to redirect Maven download/cache inside workspace
env = os.environ.copy()
env["MAVEN_USER_HOME"] = local_m2
env["HOME"] = workspace_path

print("Starting VeloCura Backend Server with local Maven wrapper and local repository...")
os.chdir(os.path.join(workspace_path, "velocura-backend"))

local_repo = os.path.join(local_m2, "repository")
subprocess.run([
    "./mvnw", 
    f"-Dmaven.repo.local={local_repo}", 
    "spring-boot:run"
], env=env)
