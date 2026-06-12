# Create the local SIFOS database (run once)
# Replace YOUR_PASSWORD with your PostgreSQL password

$env:PGPASSWORD = "YOUR_PASSWORD"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -c "CREATE DATABASE sifos;"
