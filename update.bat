@echo off
cd C:\Users\Amit\Downloads\xshiverbot\xshiver222

echo Syncing with GitHub...
git stash
git pull origin main --rebase
git stash pop

echo Running scraper...
python scraper_viral.py

echo Pushing to GitHub...
git add data/videos.json
git commit -m "Update videos [skip ci]"
git push origin main

echo.
echo Done! Videos updated on GitHub.
pause
