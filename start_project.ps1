Write-Host "Initializing Database..."
Get-Content backend\src\db\schema.sql | mysql -u root -pAcpc@2025
Write-Host "Database Initialized."

Write-Host "Starting Backend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm install; npm run dev"

Write-Host "Starting ML Server..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ml; pip install -r requirements.txt; python src/api_server.py"

Write-Host "Starting Frontend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm install; npm run dev"
