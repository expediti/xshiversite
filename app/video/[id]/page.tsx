'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function VideoPage() {
  const params = useParams();
  const id = params.id as string;
  const [video, setVideo] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/videos.json')
      .then(r => r.json())
      .then(data => {
        const found = data.find((v: any) => v.id === id);
        if (found) {
          setVideo(found);
          const others = data.filter((v: any) => v.id !== id);
          const shuffled = others.sort(() => 0.5 - Math.random());
          setSuggestions(shuffled.slice(0, 6));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!video) return <div className="error">Video not found</div>;

  return (
    <main className="container">
      <Link href="/" className="back-btn">← Back to Home</Link>
      
      <h1>{video.title}</h1>
      
      <div className="video-player">
        <iframe 
          src={video.embedUrl} 
          width="100%" 
          height="500"
          frameBorder="0"
          allowFullScreen
          title={video.title}
        />
      </div>

      <div className="video-info">
        <span>⏱️ {video.duration}</span>
        <span>📁 {video.category}</span>
        <span>👁️ {video.views || 0} views</span>
      </div>

      {video.tags && (
        <div className="tags">
          {video.tags.map((tag: string) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}

      <h2>More Videos</h2>
      <div className="suggestions">
        {suggestions.map(v => (
          <Link key={v.id} href={`/video/${v.id}`} className="suggestion-card">
            <img src={v.thumbnailUrl || '/placeholder.jpg'} alt={v.title} />
            <h4>{v.title}</h4>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .container { max-width: 1000px; margin: 0 auto; padding: 20px; }
        .back-btn { display: inline-block; margin-bottom: 20px; color: #0070f3; text-decoration: none; }
        .video-player { margin: 20px 0; }
        .video-player iframe { border-radius: 8px; width: 100%; }
        .video-info { display: flex; gap: 20px; margin: 20px 0; font-size: 14px; }
        .tags { margin: 20px 0; }
        .tag { background: #f0f0f0; padding: 5px 10px; border-radius: 5px; margin-right: 10px; font-size: 12px; }
        .suggestions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 20px; }
        .suggestion-card { text-decoration: none; color: inherit; }
        .suggestion-card img { width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: 5px; }
        .suggestion-card h4 { margin: 10px 0; font-size: 14px; }
        .loading, .error { text-align: center; padding: 50px; }
      `}</style>
    </main>
  );
}
