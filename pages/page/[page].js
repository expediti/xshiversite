import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function PageNumber() {
  const router = useRouter();
  const { page } = router.query;
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (page) {
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
        .catch(err => {
          console.error('Error loading videos:', err);
          setLoading(false);
        });
    }
  }, [page]);

  if (loading) return <div>Loading...</div>;

  const pageNum = parseInt(page);
  const totalVideos = 899; // Update this dynamically
  const totalPages = Math.ceil(totalVideos / 20);

  return (
    <>
      <Head>
        <title>Page {page} - XShiver Videos</title>
        <meta name="description" content={`Browse videos on page ${page}`} />
        <link rel="canonical" href={`https://xshiver.site/page/${page}`} />
      </Head>

      <div className="container">
        <h1>Page {page}</h1>
        
        <div className="video-grid">
          {videos.map(video => (
            <a key={video.id} href={`/video/${video.id}`} className="video-card">
              <img 
                src={video.thumbnailUrl || '/placeholder.jpg'} 
                alt={video.title}
                loading="lazy"
              />
              <h3>{video.title}</h3>
              <span>{video.duration}</span>
            </a>
          ))}
        </div>

        <nav className="pagination">
          {pageNum > 1 && (
            <a href={`/page/${pageNum - 1}`} className="btn">← Previous</a>
          )}
          <span>Page {pageNum} of {totalPages}</span>
          {pageNum < totalPages && (
            <a href={`/page/${pageNum + 1}`} className="btn">Next →</a>
          )}
        </nav>
      </div>

      <style jsx>{`
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .video-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
        .video-card { text-decoration: none; color: inherit; }
        .video-card img { width: 100%; border-radius: 8px; }
        .pagination { margin-top: 40px; text-align: center; }
        .btn { margin: 0 10px; padding: 10px 20px; background: #0070f3; color: white; text-decoration: none; border-radius: 5px; }
      `}</style>
    </>
  );
}
