import { useState } from 'react';
import { Search, AlertCircle, ExternalLink } from 'lucide-react';
import schemes from '../../data/schemes';

export default function SchemesPage() {
  const [query, setQuery] = useState('');
  const filtered = schemes.filter(s => !query || s.name.toLowerCase().includes(query.toLowerCase()) || s.description.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Healthcare Schemes</h1>
        <p>Government healthcare schemes and coverage information.</p>
      </div>
      <div className="search-header mb-6">
        <div className="search-bar-large">
          <Search size={20} className="search-icon" />
          <input type="text" placeholder="Search schemes..." value={query} onChange={e => setQuery(e.target.value)} className="input" style={{ paddingLeft: '48px' }} />
        </div>
      </div>
      <div className="disclaimer mb-6">
        <AlertCircle size={18} style={{ flexShrink: 0 }} />
        <span>Eligibility and coverage must be verified with the hospital or authorized government source. Information shown is for reference only.</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filtered.map(scheme => (
          <div key={scheme.id} className="card">
            <h4 className="mb-2">{scheme.name}</h4>
            <p className="text-secondary text-sm mb-3">{scheme.description}</p>
            <div className="flex gap-2 flex-wrap mb-3">
              <span className="badge badge-success">Coverage: {scheme.coverage}</span>
            </div>
            <div className="mb-3">
              <div className="text-sm font-semibold mb-1">Eligibility:</div>
              <ul style={{ paddingLeft: '20px', fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                {scheme.eligibility.map((e, i) => <li key={i} style={{ marginBottom: '4px' }}>{e}</li>)}
              </ul>
            </div>
            <div className="flex gap-2 flex-wrap">
              {scheme.treatments_covered.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
