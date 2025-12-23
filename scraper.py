import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import time

def scrape_desibf(max_pages=5):
    base_url = "https://desibf.com/page/{}"
    all_videos = []
    
    print(f'Starting DesiBF scrape (max {max_pages} pages)...')
    
    for page in range(1, max_pages + 1):
        url = base_url.format(page)
        print(f'\nScraping page {page}: {url}')
        
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            articles = soup.find_all('article') or soup.find_all('div', class_='post')
            
            print(f'   Found {len(articles)} articles')
            
            for article in articles:
                try:
                    title_elem = article.find('h2') or article.find('h3') or article.find('a')
                    title = title_elem.get_text(strip=True) if title_elem else 'Untitled'
                    
                    link_elem = article.find('a', href=True)
                    link = link_elem['href'] if link_elem else ''
                    
                    img_elem = article.find('img', src=True)
                    thumbnail = img_elem['src'] if img_elem else ''
                    
                    video_id = f'desibf-{link.split("/")[-2] if "/" in link else title.lower().replace(" ", "-")}'
                    
                    video_data = {
                        'id': video_id,
                        'title': title,
                        'description': 'Video from desibf',
                        'category': 'Desibf',
                        'duration': '00:00',
                        'embedUrl': link,
                        'thumbnailUrl': thumbnail,
                        'tags': ['desibf', 'desi', 'video'],
                        'uploadedAt': datetime.now().isoformat() + 'Z',
                        'views': 0
                    }
                    
                    all_videos.append(video_data)
                    print(f'   OK: {title[:50]}')
                    
                except Exception as e:
                    print(f'   Error parsing article: {e}')
                    continue
            
            time.sleep(2)
            
        except Exception as e:
            print(f'   Error on page {page}: {e}')
            continue
    
    all_videos.reverse()
    
    print(f'\nScraped {len(all_videos)} total videos from {max_pages} pages')
    return all_videos

def save_videos(videos):
    try:
        try:
            with open('data/videos.json', 'r', encoding='utf-8') as f:
                existing = json.load(f)
        except FileNotFoundError:
            existing = []
        
        existing_ids = {v['id'] for v in existing}
        
        new_videos = [v for v in videos if v['id'] not in existing_ids]
        
        combined = new_videos + existing
        
        with open('data/videos.json', 'w', encoding='utf-8') as f:
            json.dump(combined, f, indent=2, ensure_ascii=False)
        
        print(f'\nSaved! {len(new_videos)} new, {len(existing)} existing = {len(combined)} total')
        
    except Exception as e:
        print(f'Error saving: {e}')

if __name__ == '__main__':
    videos = scrape_desibf(max_pages=5)
    
    if videos:
        save_videos(videos)
        print('\nDone!')
    else:
        print('\nNo videos scraped')
