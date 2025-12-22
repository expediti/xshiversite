# scraper_desikahani2.py - CORRECT 2-STEP SCRAPING
import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import time
import os

def get_video_posts(page_num):
    """Step 1: Get post URLs from listing page"""
    if page_num == 1:
        url = "https://www.desikahani2.net/videos/"
    else:
        url = f"https://www.desikahani2.net/videos/?page={page_num}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        if response.status_code != 200:
            print(f"  Failed to load page {page_num}: {response.status_code}")
            return []
        
        soup = BeautifulSoup(response.content, 'html.parser')
        posts = []
        
        # Find all video items/cards
        items = soup.select('div.item') or soup.select('article')
        
        for item in items:
            link = item.find('a', href=True)
            if not link:
                continue
            
            href = link.get('href', '').strip()
            if not href or href == '#':
                continue
            
            # Make absolute URL
            if not href.startswith('http'):
                href = 'https://www.desikahani2.net' + (href if href.startswith('/') else '/' + href)
            
            # Get title from card
            title_el = item.find('h3') or item.find('h2')
            title = title_el.get_text(strip=True) if title_el else 'Video'
            
            # Get thumbnail from card
            img = item.find('img')
            thumb = ''
            if img:
                thumb = img.get('data-src') or img.get('src', '')
            
            posts.append({
                'url': href,
                'title': title,
                'thumb': thumb
            })
        
        print(f"  Found {len(posts)} posts on page {page_num}")
        return posts
        
    except Exception as e:
        print(f"  Error: {e}")
        return []

def extract_video_url(post_url):
    """Step 2: Visit post page and extract actual video embed URL"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.desikahani2.net/'
    }
    
    try:
        response = requests.get(post_url, headers=headers, timeout=30)
        if response.status_code != 200:
            return None
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Try iframe first (most common)
        iframe = soup.find('iframe', src=True)
        if iframe:
            embed_url = iframe.get('src')
            if embed_url and 'http' in embed_url:
                return embed_url
        
        # Try video tag
        video = soup.find('video')
        if video:
            source = video.find('source', src=True)
            if source:
                return source.get('src')
        
        # Fallback: return post URL itself
        return post_url
        
    except Exception as e:
        return None

def scrape_desikahani2(page_num):
    """Main scraping function"""
    posts = get_video_posts(page_num)
    videos = []
    
    for idx, post in enumerate(posts[:10]):  # Limit to 10 per page to avoid timeout
        print(f"    Processing post {idx+1}/{len(posts[:10])}: {post['title'][:40]}")
        
        # Extract actual video URL
        embed_url = extract_video_url(post['url'])
        
        if not embed_url:
            print(f"      ❌ No video URL found")
            continue
        
        video_id = f"dk-{abs(hash(embed_url)) % 1000000}"
        videos.append({
            'id': video_id,
            'title': post['title'][:150],
            'description': 'Desi video from desikahani2',
            'category': 'Desi',
            'duration': '00:00',
            'embedUrl': embed_url,
            'thumbnailUrl': post['thumb'],
            'tags': ['desikahani2'],
            'uploadedAt': datetime.utcnow().isoformat() + 'Z',
            'views': 0
        })
        
        time.sleep(1)  # Polite delay between requests
    
    return videos

def main():
    all_videos = []
    
    print("🔍 Starting Desikahani2 scraper...")
    for page in range(1, 3):  # 2 pages
        print(f"\n📄 Page {page}")
        videos = scrape_desikahani2(page)
        all_videos.extend(videos)
        print(f"  ✅ Extracted {len(videos)} videos from page {page}")
        time.sleep(2)
    
    # Load existing
    try:
        with open('data/videos.json', 'r') as f:
            existing = json.load(f)
    except:
        existing = []
    
    # Dedupe by embedUrl
    existing_urls = {v.get('embedUrl') for v in existing}
    new_videos = [v for v in all_videos if v['embedUrl'] not in existing_urls]
    
    combined = existing + new_videos
    
    os.makedirs('data', exist_ok=True)
    with open('data/videos.json', 'w') as f:
        json.dump(combined, f, indent=2)
    
    print(f"\n✅ Total scraped: {len(new_videos)} new videos")
    print(f"✅ Database total: {len(combined)} videos")

if __name__ == '__main__':
    main()
