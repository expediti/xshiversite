'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PageNumber() {
  const params = useParams();
  const page = params.page as string;
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/videos.json')
      .then(r => r.json())
      .then(data => {
        const perPage = 20;
        const pageNum = parseInt(page);
        const start = (pageNum - 1) * perPage;
        const end = start + perPage;
        setVideos(data.slice(start, end));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page]);

  if (loading) return <div className="loading">Loading...</div>;

  const pageNum = parseInt(page);
  const totalPages = 45; // 899 videos / 20 = ~45 pages

  return (
    <main className="container">
      <h1>Page {page}</h1>
      
      <div className="video-grid">
        {videos.map(video => (
          <Link key={video.id} href={`/video/${video.id}`} className="video-card">
            <img 
              src={video.thumbnailUrl || '/placeholder.jpg'} 
              alt={video.title}
              loading="lazy"
            />
            <h3>{video.title}</h3>
            <span className="duration">{video.duration}</span>
          </Link>
        ))}
      </div>

      <nav className="pagination">
        {pageNum > 1 && (
          <Link href={`/page/${pageNum - 1}`} className="btn">← Previous</Link>
        )}
        <span className="page-info">Page {pageNum} of {totalPages}</span>
        {pageNum < totalPages && (
          <Link href={`/page/${pageNum + 1}`} className="btn">Next →</Link>
        )}
      </nav>

      <style jsx>{`
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .video-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
        .video-card { text-decoration: none; color: inherit; display: block; }
        .video-card img { width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: 8px; }
        .video-card h3 { margin: 10px 0 5px; font-size: 14px; }
        .duration { font-size: 12px; color: #666; }
        .pagination { display: flex; justify-content: center; align-items: center; gap: 20px; margin: 40px 0; }
        .btn { padding: 10px 20px; background: #0070f3; color: white; text-decoration: none; border-radius: 5px; }
        .page-info { font-weight: 500; }
        .loading { text-align: center; padding: 50px; }
      `}</style>
    </main>
  );
}
