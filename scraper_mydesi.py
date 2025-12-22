# scraper_mydesi.py - MYDESI.CLICK SCRAPER
import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import time
import os
import re

def get_posts(page_num=1):
    """Get video posts from mydesi.click"""
    url = f"https://mydesi.click/" if page_num == 1 else f"https://mydesi.click/page/{page_num}/"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        if response.status_code != 200:
            print(f"  Failed: {response.status_code}")
            return []
        
        soup = BeautifulSoup(response.content, 'html.parser')
        posts = []
        
        # Try multiple selectors - mydesi.click uses different structures
        articles = soup.find_all('article') or soup.find_all('div', class_='post')
        
        for article in articles:
            # Find post link
            link = article.find('a', href=True)
            if not link:
                link = article.find('a')
            
            if not link:
                continue
            
            href = link.get('href', '').strip()
            if not href or '/tag/' in href or '/category/' in href or '#' in href:
                continue
            
            # Get title
            h2 = article.find(['h2', 'h3', 'h1'])
            title = h2.get_text(strip=True) if h2 else link.get('title', 'Video')
            title = title.replace('\n', ' ').strip()[:150]
            
            # Get thumbnail
            img = article.find('img')
            thumb = ''
            if img:
                thumb = img.get('data-src', '') or img.get('src', '') or img.get('data-lazy-src', '')
            
            if href and title and len(title) > 3:
                posts.append({'url': href, 'title': title, 'thumb': thumb})
        
        print(f"  Found {len(posts)} posts")
        return posts
        
    except Exception as e:
        print(f"  Error: {e}")
        return []

def extract_video_player(post_url):
    """Extract video player URL from post"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://mydesi.click/'
    }
    
    try:
        response = requests.get(post_url, headers=headers, timeout=30)
        if response.status_code != 200:
            return None
        
        soup = BeautifulSoup(response.content, 'html.parser')
        html_content = str(response.content)
        
        # Video player domains
        video_domains = [
            'streamtape', 'dood', 'mixdrop', 'streamlare', 'vidoza',
            'upstream', 'voe', 'filemoon', 'fembed', 'streamsb',
            'videovard', 'streamwish', 'mp4upload', 'sendvid'
        ]
        
        # Method 1: Find iframe with video player
        iframes = soup.find_all('iframe')
        
        for iframe in iframes:
            src = iframe.get('src', '').strip()
            
            if not src or not src.startswith('http'):
                continue
            
            # Skip ads and tracking
            skip_keywords = ['doubleclick', 'ads', 'adserver', 'banner', 'track', 'analytics', 'pixel']
            if any(kw in src.lower() for kw in skip_keywords):
                continue
            
            # Accept video players
            if any(vd in src.lower() for vd in video_domains):
                return src
        
        # Method 2: Search HTML for video URLs
        # Look for direct video player URLs
        patterns = [
            r'https?://(?:' + '|'.join(video_domains) + r')[^\s"\'<>]*',
            r'"url"\s*:\s*"([^"]+(?:mp4|m3u8)[^"]*)"',
            r'"src"\s*:\s*"([^"]+(?:mp4|m3u8)[^"]*)"',
            r'src=[\'"](https?://[^\s\'\"<>]+?)[\'\"]'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, html_content, re.IGNORECASE)
            if matches:
                for url in matches:
                    if url.startswith('http') and any(vd in url.lower() for vd in video_domains):
                        return url
        
        return None
        
    except Exception as e:
        return None

def main():
    print("🔍 Scraping MYDESI.CLICK")
    
    all_videos = []
    
    # Scrape multiple pages
    for page in range(1, 4):
        print(f"\n📄 Page {page}")
        posts = get_posts(page)
        
        if not posts:
            break
        
        for idx, post in enumerate(posts[:8]):
            print(f"   {idx+1}/{len(posts)}: {post['title'][:45]}...")
            
            # Extract real video player
            player_url = extract_video_player(post['url'])
            
            if not player_url:
                print(f"      ❌ No player found")
                continue
            
            print(f"      ✅ Player extracted")
            
            video_id = f"mydesi-{abs(hash(player_url)) % 1000000}"
            
            all_videos.append({
                'id': video_id,
                'title': post['title'],
                'description': 'MyDesi video',
                'category': 'MyDesi',
                'duration': '00:00',
                'embedUrl': player_url,
                'thumbnailUrl': post['thumb'],
                'tags': ['mydesi', 'desi'],
                'uploadedAt': datetime.utcnow().isoformat() + 'Z',
                'views': 0
            })
            
            time.sleep(1)
        
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
    
    # Save
    os.makedirs('data', exist_ok=True)
    with open('data/videos.json', 'w') as f:
        json.dump(combined, f, indent=2)
    
    print(f"\n✅ Scraped: {len(new_videos)} new videos")
    print(f"✅ Total: {len(combined)}")

if __name__ == '__main__':
    main()
