# scraper.py
import requests
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime
import time
import os

SCRAPER_API_KEY = '512bf9b26d582f99b50ae92297c7fb7b'

def scrape_viralkand(page_num):
    url = f"https://viralkand.com/page/{page_num}/" if page_num > 1 else "https://viralkand.com/"
    
    # Route through ScraperAPI to bypass bot detection
    api_url = f"http://api.scraperapi.com?api_key={SCRAPER_API_KEY}&url={url}"
    
    try:
        print(f"Fetching page {page_num} via ScraperAPI...")
        response = requests.get(api_url, timeout=60)
        
        if response.status_code != 200:
            print(f"Failed: {response.status_code}")
            return []
        
        soup = BeautifulSoup(response.content, 'html.parser')
        videos = []
        
        # Find all article posts
        articles = soup.find_all('article', class_='post')
        print(f"Found {len(articles)} articles on page {page_num}")
        
        for article in articles:
            link = article.find('a')
            if not link:
                continue
                
            href = link.get('href', '')
            
            # Get title
            title_tag = article.find('h2', class_='entry-title')
            if title_tag:
                title = title_tag.get_text(strip=True)
                title = re.sub(r'Viral video from viralkand\.com', '', title).strip()
            else:
                continue
            
            # Get thumbnail
            img = article.find('img')
            thumb = img['src'] if img and 'src' in img.attrs else ''
            
            # Get category
            cat_link = article.find('a', rel='category')
            category = cat_link.get_text(strip=True) if cat_link else 'Viral'
            
            if href and title:
                video_id = href.rstrip('/').split('/')[-1]
                videos.append({
                    'id': f'vid-{video_id}',
                    'title': title[:150],
                    'description': 'Viral video from viralkand.com',
                    'category': category,
                    'duration': '00:00',
                    'embedUrl': href,
                    'thumbnailUrl': thumb,
                    'tags': ['viralkand', 'viral'],
                    'uploadedAt': datetime.utcnow().isoformat() + 'Z',
                    'views': 0
                })
        
        return videos
        
    except Exception as e:
        print(f"Error scraping page {page_num}: {e}")
        return []

def main():
    all_videos = []
    
    # Scrape 10 pages
    for page in range(1, 11):
        videos = scrape_viralkand(page)
        all_videos.extend(videos)
        time.sleep(1)  # Small delay between pages
    
    # Load existing videos
    try:
        with open('data/videos.json', 'r') as f:
            existing = json.load(f)
    except:
        existing = []
    
    # Dedupe by id
    existing_ids = {v['id'] for v in existing}
    new_videos = [v for v in all_videos if v['id'] not in existing_ids]
    
    combined = existing + new_videos
    
    # Save to file
    os.makedirs('data', exist_ok=True)
    with open('data/videos.json', 'w') as f:
        json.dump(combined, f, indent=2)
    
    print(f"\n✅ Scraped {len(new_videos)} new videos from 10 pages")
    print(f"✅ Total videos in database: {len(combined)}")

if __name__ == '__main__':
    main()
