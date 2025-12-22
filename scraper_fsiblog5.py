# scraper_fsiblog5.py - NO API, raw requests
import requests
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime
import time
import os

def scrape_fsiblog5(page_num):
    """Raw scraping fsiblog5"""
    
    if page_num == 1:
        url = "https://www.fsiblog5.com/"
    else:
        url = f"https://www.fsiblog5.com/page/{page_num}/"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.fsiblog5.com/',
    }
    
    try:
        print(f"Fetching page {page_num}...")
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            print(f"  Failed: {response.status_code}")
            return []
        
        soup = BeautifulSoup(response.content, 'html.parser')
        videos = []
        
        articles = soup.find_all('article', class_='post')
        if not articles:
            articles = soup.find_all('article')
        if not articles:
            articles = soup.find_all('div', class_='post')
        
        print(f"  Found {len(articles)} articles")
        
        for article in articles:
            link = article.find('a', href=True)
            if not link:
                continue
            
            href = link.get('href', '').strip()
            if not href or '/tag/' in href or '/category/' in href:
                continue
            
            if not href.startswith('http'):
                href = 'https://www.fsiblog5.com' + href
            
            title_el = article.find('h2', class_='entry-title') or article.find('h2') or article.find('h3')
            title = title_el.get_text(strip=True) if title_el else 'Video'
            title = title.replace('\n', ' ').strip()[:150]
            
            img = article.find('img')
            thumb = ''
            if img:
                thumb = img.get('src', '') or img.get('data-src', '')
            
            if href and title and title != 'Video':
                video_id = f"fsi-{hash(href) % 1000000}"
                videos.append({
                    'id': video_id,
                    'title': title,
                    'description': 'Video from fsiblog5',
                    'category': 'FSI',
                    'duration': '00:00',
                    'embedUrl': href,
                    'thumbnailUrl': thumb,
                    'tags': ['fsiblog5', 'desi'],
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
        videos = scrape_fsiblog5(page)
        all_videos.extend(videos)
        time.sleep(3)
    
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
