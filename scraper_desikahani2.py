# scraper_desikahani2.py - NO API, raw requests
import requests
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime
import time
import os

def scrape_desikahani2(page_num):
    """Raw scraping - no API"""
    
    if page_num == 1:
        url = "https://www.desikahani2.net/videos/"
    else:
        url = f"https://www.desikahani2.net/videos/?page={page_num}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.desikahani2.net/',
    }
    
    try:
        print(f"Fetching page {page_num}...")
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            print(f"  Failed: {response.status_code}")
            return []
        
        soup = BeautifulSoup(response.content, 'html.parser')
        videos = []
        
        # Find video items
        items = soup.find_all('div', class_='item')
        if not items:
            items = soup.find_all('article')
        if not items:
            items = soup.find_all('div', class_='post')
        
        print(f"  Found {len(items)} items")
        
        for item in items:
            link = item.find('a', href=True)
            if not link:
                continue
            
            href = link.get('href', '').strip()
            if not href or href.startswith('#'):
                continue
            
            # Make absolute URL
            if not href.startswith('http'):
                href = 'https://www.desikahani2.net' + href
            
            # Title
            title_el = item.find('h3') or item.find('h2') or item.find('h1')
            title = title_el.get_text(strip=True) if title_el else 'Video'
            title = title.replace('\n', ' ').strip()[:150]
            
            # Thumbnail
            img = item.find('img')
            thumb = ''
            if img:
                thumb = img.get('src', '') or img.get('data-src', '') or img.get('data-original', '')
            
            if href and title and title != 'Video':
                video_id = f"dk-{hash(href) % 1000000}"
                videos.append({
                    'id': video_id,
                    'title': title,
                    'description': 'Desi video from desikahani2',
                    'category': 'Desi',
                    'duration': '00:00',
                    'embedUrl': href,
                    'thumbnailUrl': thumb,
                    'tags': ['desikahani2', 'desi'],
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
        time.sleep(3)  # Be polite
    
    try:
        with open('data/videos.json', 'r') as f:
            existing = json.load(f)
    except:
        existing = []
    
    existing_urls = {v['embedUrl'] for v in existing}
    new_videos = [v for v in all_videos if v['embedUrl'] not in existing_urls]
    
    combined = existing + new_videos
    
    os.makedirs('data', exist_ok=True)
    with open('data/videos.json', 'w') as f:
        json.dump(combined, f, indent=2)
    
    print(f"\n✅ Scraped {len(new_videos)} new videos")
    print(f"✅ Total: {len(combined)}")

if __name__ == '__main__':
    main()
