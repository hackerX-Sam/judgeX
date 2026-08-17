$ErrorActionPreference = "Stop"

$baseDir = "c:\Users\samir\OneDrive\Desktop\major and minor projects\online coding judge\JudgeX"
Set-Location $baseDir

Write-Host "Initializing Frontend (Vite + React + TS)..."
# Create a temp vite project
npx -y create-vite@latest temp-frontend --template react-ts

# Copy contents (including hidden files)
Get-ChildItem -Path .\temp-frontend -Force | Copy-Item -Destination .\frontend -Recurse -Force

# Clean up temp directory
Remove-Item -Path .\temp-frontend -Recurse -Force

# Install frontend dependencies
Set-Location "$baseDir\frontend"
Write-Host "Installing frontend dependencies..."
npm install
npm install react-router-dom @reduxjs/toolkit react-redux axios lucide-react clsx

Write-Host "Initializing Backend..."
Set-Location "$baseDir\backend"
npm init -y
npm install express cors dotenv helmet morgan prisma @prisma/client jsonwebtoken bcryptjs
npm install --save-dev typescript @types/node @types/express @types/cors @types/jsonwebtoken @types/bcryptjs ts-node nodemon

Write-Host "Initializing Worker..."
Set-Location "$baseDir\worker"
npm init -y
npm install ioredis bullmq dockerode dotenv
npm install --save-dev typescript @types/node @types/dockerode ts-node

Write-Host "Project Setup Complete!"
