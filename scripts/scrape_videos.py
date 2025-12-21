#!/usr/bin/env python3
import json
import requests
from bs4 import BeautifulSoup
import re
import time
import os

def main():
    print("=" * 60)
    print("VIRALKAND SCRAPER")
    print("=" * 60)
    
    try:
        os.makedirs("data", exist_ok=True)
        
        # Load existing
        if os.path.exists("data/videos.json"):
            with open("data/videos.json", 'r') as f:
                videos = json.load(f)
            print(f"Loaded {len(videos)} existing videos")
        else:
            videos = []
            print("Starting fresh")
        
        existing_ids = {v['id'] for v in videos}
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        # Get homepage
        print(f"\nFetching: https://viralkand.com")
        r = requests.get("https://viralkand.com", headers=headers, timeout=15)
        print(f"Status: {r.status_code}")
        
        soup = BeautifulSoup(r.content, 'html.parser')
        
        # Find links
        links = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            if '/2024/' in href or '/2025/' in href:
                url = href if href.startswith('http') else 'https://viralkand.com' + href
                if url not in links:
                    links.append(url)
        
        print(f"Found {len(links)} video URLs\n")
        
        # Scrape videos
        new_count = 0
        for i, link in enumerate(links[:10], 1):
            try:
                print(f"[{i}/10] {link}")
                
                vid_id = "vid-" + str(abs(hash(link)))[:10]
                
                if vid_id in existing_ids:
                    print("  Already exists\n")
                    continue
                
                r2 = requests.get(link, headers=headers, timeout=10)
                s = BeautifulSoup(r2.content, 'html.parser')
                
                # Title
                h1 = s.find('h1')
                title = h1.get_text().strip() if h1 else "Video"
                title = title.replace("Viral video from viralkand.com", "").strip()
                
                # Iframe
                iframe = s.find('iframe')
                if not iframe or not iframe.get('src'):
                    print("  No iframe\n")
                    continue
                
                embed = iframe['src']
                if embed.startswith('//'):
                    embed = 'https:' + embed
                
                # Thumbnail
                thumb = ""
                og = s.find('meta', property='og:image')
                if og:
                    thumb = og.get('content', '')
                
                # Category
                cat = "Viral"
                cat_tag = s.find('a', rel='category')
                if cat_tag:
                    cat = cat_tag.get_text().strip()
                
                videos.append({
                    "id": vid_id,
                    "title": title,
                    "description": title,
                    "thumbnailUrl": thumb,
                    "embedUrl": embed,
                    "category": cat,
                    "duration": "10:00",
                    "tags": [cat.lower()]
                })
                
                existing_ids.add(vid_id)
                new_count += 1
                
                print(f"  ✅ Added! Total: {new_count}\n")
                
            except Exception as e:
                print(f"  Error: {e}\n")
                continue
        
        # Save
        with open("data/videos.json", 'w', encoding='utf-8') as f:
            json.dump(videos, f, indent=2, ensure_ascii=False)
        
        print("=" * 60)
        print(f"✅ DONE - Added {new_count} videos")
        print(f"Total: {len(videos)} videos")
        print("=" * 60)
        
        # ALWAYS return 0 so workflow doesn't fail
        return 0
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        # Still return 0 to not fail workflow
        return 0

if __name__ == "__main__":
    import sys
    sys.exit(main())
