# scraper_desikahani2.py - Desikahani2 Scraper
import requests
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime
import time
import os

SCRAPER_API_KEY = '512bf9b26d582f99b50ae92297c7fb7b'

def scrape_desikahani2(page_num):
    """Scrape desikahani2.net"""
    
    if page_num == 1:
        url = "https://www.desikahani2.net/videos/"
    else:
        url = f"https://www.desikahani2.net/videos/?page={page_num}"
    
    api_url = f"http://api.scraperapi.com?api_key={SCRAPER_API_KEY}&url={url}"
    
    try:
        print(f"Fetching page {page_num}...")
        response = requests.get(api_url, timeout=60)
        
        if response.status_code != 200:
            print(f"  Failed: {response.status_code}")
            return []
        
        soup = BeautifulSoup(response.content, 'html.parser')
        videos = []
        
        items = soup.find_all('div', class_='item')
        print(f"  Found {len(items)} video items")
        
        for item in items:
            link = item.find('a', href=True)
            if not link:
                continue
            
            href = link.get('href', '').strip()
            if not href or href.startswith('#'):
                continue
            
            title_el = item.find('h3') or item.find('h2') or item.find('a')
            title = title_el.get_text(strip=True) if title_el else 'No Title'
            title = title.replace('\n', ' ').strip()
            
            img = item.find('img')
            thumb = ''
            if img:
                thumb = img.get('src', '') or img.get('data-src', '') or img.get('data-original', '')
            
            if href and title and title != 'No Title':
                video_id = re.sub(r'[^a-z0-9-]', '', title.lower())[:40]
                videos.append({
                    'id': f'vid-{video_id}',
                    'title': title[:150],
                    'description': 'Desi sex video from desikahani2',
                    'category': 'Desi',
                    'duration': '00:00',
                    'embedUrl': href,
                    'thumbnailUrl': thumb,
                    'tags': ['desikahani2', 'desi', 'sex'],
                    'uploadedAt': datetime.utcnow().isoformat() + 'Z',
                    'views': 0
                })
        
        print(f"  ✅ Extracted {len(videos)} videos")
        return videos
        
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return []

def main():
    all_videos = []
    
    for page in range(1, 6):
        videos = scrape_desikahani2(page)
        all_videos.extend(videos)
        time.sleep(2)
    
    try:
        with open('data/videos.json', 'r') as f:
            existing = json.load(f)
    except:
        existing = []
    
    existing_ids = {v['id'] for v in existing}
    new_videos = [v for v in all_videos if v['id'] not in existing_ids]
    
    combined = existing + new_videos
    
    os.makedirs('data', exist_ok=True)
    with open('data/videos.json', 'w') as f:
        json.dump(combined, f, indent=2)
    
    print(f"\n✅ Scraped {len(new_videos)} new videos from 5 pages")
    print(f"✅ Total videos: {len(combined)}")

if __name__ == '__main__':
    main()
