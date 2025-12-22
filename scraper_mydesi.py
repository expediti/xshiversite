# scraper_mydesi.py
import requests
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime
import time
import os

SCRAPER_API_KEY = '512bf9b26d582f99b50ae92297c7fb7b'

def scrape_mydesi(page_num):
    """Scrape mydesi.click"""
    
    if page_num == 1:
        url = "https://mydesi.click/"
    else:
        url = f"https://mydesi.click/page/{page_num}/"
    
    api_url = f"http://api.scraperapi.com?api_key={SCRAPER_API_KEY}&url={url}"
    
    try:
        print(f"Fetching page {page_num}...")
        response = requests.get(api_url, timeout=60)
        
        if response.status_code != 200:
            print(f"  Failed: {response.status_code}")
            return []
        
        soup = BeautifulSoup(response.content, 'html.parser')
        videos = []
        
        # mydesi.click uses <article> or <div class="post-item">
        articles = soup.find_all('article') or soup.find_all('div', class_='post')
        print(f"  Found {len(articles)} articles")
        
        for article in articles:
            link = article.find('a', href=True)
            if not link:
                continue
            
            href = link.get('href', '').strip()
            if not href or href.startswith('#') or '/category/' in href or '/tag/' in href:
                continue
            
            # Get title
            title_el = article.find('h1') or article.find('h2') or article.find('h3')
            title = title_el.get_text(strip=True) if title_el else link.get('title', 'Video')
            title = title.replace('\n', ' ').strip()
            
            # Get thumbnail
            img = article.find('img')
            thumb = ''
            if img:
                thumb = img.get('src', '') or img.get('data-src', '') or img.get('data-lazy-src', '')
            
            if href and title and title != 'Video':
                video_id = re.sub(r'[^a-z0-9-]', '', title.lower())[:40]
                videos.append({
                    'id': f'vid-{video_id}-{page_num}',
                    'title': title[:150],
                    'description': 'Video from mydesi.click',
                    'category': 'Desi',
                    'duration': '00:00',
                    'embedUrl': href,
                    'thumbnailUrl': thumb,
                    'tags': ['mydesi', 'desi'],
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
    
    for page in range(1, 4):  # 3 pages
        videos = scrape_mydesi(page)
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
    
    print(f"\n✅ Scraped {len(new_videos)} new videos")
    print(f"✅ Total: {len(combined)}")

if __name__ == '__main__':
    main()
