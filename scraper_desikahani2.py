# scraper_desikahani2.py - FIXED VERSION
import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import time
import os

def scrape_desikahani2(page_num):
    if page_num == 1:
        url = "https://www.desikahani2.net/videos/"
    else:
        url = f"https://www.desikahani2.net/videos/?page={page_num}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
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
        
        # Try multiple selectors
        items = soup.select('div.item') or soup.select('article') or soup.select('.post')
        print(f"  Found {len(items)} items")
        
        for idx, item in enumerate(items[:5]):  # Debug first 5
            # Try all possible link locations
            link = (item.find('a', class_='video-link') or 
                   item.find('a', href=True) or 
                   item.select_one('a[href*="video"]'))
            
            if not link:
                print(f"    Item {idx}: No link found")
                continue
            
            href = link.get('href', '').strip()
            if not href or href == '#':
                print(f"    Item {idx}: Empty href")
                continue
            
            # Make absolute
            if not href.startswith('http'):
                href = 'https://www.desikahani2.net' + (href if href.startswith('/') else '/' + href)
            
            # Get title - try all methods
            title = (link.get('title') or 
                    (item.find('h3') or item.find('h2') or item.find('h1') or {}).get_text(strip=True) or
                    link.get_text(strip=True))
            
            title = title.replace('\n', ' ').strip()[:150]
            
            # Thumbnail
            img = item.find('img')
            thumb = ''
            if img:
                thumb = img.get('data-src') or img.get('src') or img.get('data-original', '')
            
            print(f"    Item {idx}: title='{title[:30]}', href={href[:40]}")
            
            if href and title and len(title) > 3:
                video_id = f"dk-{abs(hash(href)) % 1000000}"
                videos.append({
                    'id': video_id,
                    'title': title,
                    'description': 'Desi video from desikahani2',
                    'category': 'Desi',
                    'duration': '00:00',
                    'embedUrl': href,
                    'thumbnailUrl': thumb,
                    'tags': ['desikahani2'],
                    'uploadedAt': datetime.utcnow().isoformat() + 'Z',
                    'views': 0
                })
        
        print(f"  ✅ Extracted {len(videos)} videos")
        return videos
        
    except Exception as e:
        print(f"  ❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return []

def main():
    all_videos = []
    
    for page in range(1, 3):  # Just 2 pages for testing
        videos = scrape_desikahani2(page)
        all_videos.extend(videos)
        time.sleep(3)
    
    try:
        with open('data/videos.json', 'r') as f:
            existing = json.load(f)
    except:
        existing = []
    
    existing_urls = {v.get('embedUrl') for v in existing}
    new_videos = [v for v in all_videos if v['embedUrl'] not in existing_urls]
    
    combined = existing + new_videos
    
    os.makedirs('data', exist_ok=True)
    with open('data/videos.json', 'w') as f:
        json.dump(combined, f, indent=2)
    
    print(f"\n✅ Scraped {len(new_videos)} new videos")
    print(f"✅ Total: {len(combined)}")

if __name__ == '__main__':
    main()
