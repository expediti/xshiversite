# scraper_desikahani2.py - FIXED TITLE EXTRACTION
import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import time
import os

def get_video_posts(page_num):
    """Get post URLs from listing"""
    if page_num == 1:
        url = "https://www.desikahani2.net/videos/"
    else:
        url = f"https://www.desikahani2.net/videos/?page={page_num}"
    
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        if response.status_code != 200:
            return []
        
        soup = BeautifulSoup(response.content, 'html.parser')
        posts = []
        
        items = soup.select('div.item')
        
        for item in items:
            link = item.find('a', href=True)
            if not link:
                continue
            
            href = link.get('href', '').strip()
            if not href:
                continue
            
            if not href.startswith('http'):
                href = 'https://www.desikahani2.net' + href
            
            # Get title - try multiple ways
            title = link.get('title', '').strip()
            if not title or len(title) < 3:
                h3 = item.find('h3')
                if h3:
                    title = h3.get_text(strip=True)
            if not title or len(title) < 3:
                # Get from link text
                title = link.get_text(strip=True)
            
            # Clean title
            title = title.replace('\n', ' ').strip()
            
            # Get thumbnail
            img = item.find('img')
            thumb = ''
            if img:
                thumb = img.get('data-src', '') or img.get('src', '')
            
            if href and title and len(title) > 3:
                posts.append({'url': href, 'title': title, 'thumb': thumb})
        
        print(f"  Found {len(posts)} posts")
        return posts
        
    except Exception as e:
        print(f"  Error: {e}")
        return []

def extract_video_url(post_url):
    """Extract video embed from post page"""
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    
    try:
        response = requests.get(post_url, headers=headers, timeout=30)
        if response.status_code != 200:
            return None
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Try iframe
        iframe = soup.find('iframe', src=True)
        if iframe:
            src = iframe.get('src')
            if src and 'http' in src:
                return src
        
        # Try video tag
        video = soup.find('video')
        if video:
            source = video.find('source', src=True)
            if source:
                return source.get('src')
        
        # Fallback to post URL
        return post_url
        
    except:
        return None

def scrape_desikahani2(page_num):
    posts = get_video_posts(page_num)
    videos = []
    
    for idx, post in enumerate(posts[:10]):
        print(f"    {idx+1}/10: {post['title'][:50]}")
        
        embed_url = extract_video_url(post['url'])
        
        if not embed_url:
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
        time.sleep(1)
    
    return videos

def main():
    all_videos = []
    
    print("🔍 Starting Desikahani2 scraper...")
    for page in range(1, 3):
        print(f"\n📄 Page {page}")
        videos = scrape_desikahani2(page)
        all_videos.extend(videos)
        print(f"  ✅ {len(videos)} videos")
        time.sleep(2)
    
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
    
    print(f"\n✅ Total: {len(new_videos)} new, {len(combined)} total")

if __name__ == '__main__':
    main()
