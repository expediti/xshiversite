import Link from 'next/link';

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    thumbnailUrl: string;
    duration: string;
    views?: number;
    category?: string;
  };
}

export default function VideoCard({ video }: VideoCardProps) {
  return (
    <Link href={`/video/${video.id}`} className="video-card">
      <div className="thumbnail-wrapper">
        <img 
          src={video.thumbnailUrl || '/placeholder.jpg'} 
          alt={video.title}
          loading="lazy"
        />
        {video.duration && (
          <span className="duration">{video.duration}</span>
        )}
      </div>
      <div className="video-info">
        <h3>{video.title}</h3>
        {video.views !== undefined && (
          <span className="views">👁️ {video.views} views</span>
        )}
      </div>

      <style jsx>{`
        .video-card {
          display: block;
          text-decoration: none;
          color: inherit;
          border-radius: 8px;
          overflow: hidden;
          transition: transform 0.2s;
        }
        
        .video-card:hover {
          transform: translateY(-4px);
        }
        
        .thumbnail-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background: #f0f0f0;
        }
        
        .thumbnail-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .duration {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .video-info {
          padding: 12px 8px;
        }
        
        .video-info h3 {
          margin: 0 0 6px 0;
          font-size: 14px;
          font-weight: 600;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .views {
          font-size: 12px;
          color: #666;
        }
      `}</style>
    </Link>
  );
}
