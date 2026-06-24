import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api.js';
import PageTransition from '../components/PageTransition.jsx';

export default function StaticPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/public/pages/${slug}`).then(r => setPage(r.data)).catch(() => setPage(null)).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" /></div>;

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-16 max-w-4xl mx-auto px-4">
        {page ? (
          <div className="card neon-border">
            <h1 className="font-orbitron font-bold text-3xl neon-text mb-6">{page.title}</h1>
            <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: page.content }} />
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📄</p>
            <h2 className="text-2xl font-orbitron text-gray-400">Page not found</h2>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
