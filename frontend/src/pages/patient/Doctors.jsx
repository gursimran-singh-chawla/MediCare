import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, Clock3, Search, SearchX, ShieldCheck, SlidersHorizontal, X, Zap } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout.jsx';
import DoctorCard from '../../components/DoctorCard.jsx';
import { api } from '../../api/client.js';
import { useApp } from '../../context/AppContext.jsx';

const specialties = [
  ['', 'All specialties'],
  ['cardiologist', 'Cardiology'],
  ['pulmonologist', 'Pulmonology'],
  ['dermatologist', 'Dermatology'],
  ['dentist', 'Dentistry'],
  ['neurologist', 'Neurology'],
  ['orthopedic', 'Orthopedics'],
  ['general', 'General Physician']
];

const sorts = [
  ['recommended', 'Recommended'],
  ['rating', 'Top rated'],
  ['price-asc', 'Fee: low to high'],
  ['price-desc', 'Fee: high to low'],
  ['experience', 'Most experienced']
];

const experienceLevels = [[0, 'Any'], [5, '5+ yrs'], [10, '10+ yrs'], [15, '15+ yrs']];
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function matchesSpecialty(doctor, value) {
  if (!value) return true;
  const actual = (doctor.specialization || '').toLowerCase();
  return value === 'general' ? actual.includes('general') || actual.includes('physician') : actual.includes(value);
}

function SkeletonCard() {
  return (
    <div className="doc-card skeleton">
      <div className="doc-card-media shimmer" />
      <div className="doc-card-body">
        <span className="sk-line w80 shimmer" />
        <span className="sk-line w60 shimmer" />
        <span className="sk-line w40 shimmer" />
        <span className="sk-line w100 shimmer" />
      </div>
    </div>
  );
}

export default function Doctors() {
  const { setAlert } = useApp();
  const [doctors, setDoctors] = useState(null);
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [sort, setSort] = useState('recommended');
  const [maxFee, setMaxFee] = useState(null);
  const [minExperience, setMinExperience] = useState(0);
  const [day, setDay] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    api('/api/doctors')
      .then((data) => setDoctors(data.doctors))
      .catch((error) => { setDoctors([]); setAlert({ type: 'error', message: error.message }); });
  }, [setAlert]);

  const feeCeiling = useMemo(() => Math.max(100, ...(doctors || []).map((doctor) => Number(doctor.price) || 0)), [doctors]);
  const feeLimit = maxFee ?? feeCeiling;

  const counts = useMemo(() => Object.fromEntries(
    specialties.map(([value]) => [value, (doctors || []).filter((doctor) => matchesSpecialty(doctor, value)).length])
  ), [doctors]);

  const filtered = useMemo(() => {
    const list = (doctors || []).filter((doctor) => {
      const search = `${doctor.name} ${doctor.specialization} ${doctor.degree}`.toLowerCase();
      const days = (doctor.availableDays || []).map((item) => item.slice(0, 3).toLowerCase());
      return (!query || search.includes(query.toLowerCase()))
        && matchesSpecialty(doctor, specialty)
        && Number(doctor.price) <= feeLimit
        && Number(doctor.experience) >= minExperience
        && (!day || days.includes(day.toLowerCase()));
    });
    if (sort === 'price-asc') return [...list].sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === 'price-desc') return [...list].sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === 'experience') return [...list].sort((a, b) => Number(b.experience) - Number(a.experience));
    if (sort === 'rating') return [...list].sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0) || (b.rating?.count || 0) - (a.rating?.count || 0));
    return [...list].sort((a, b) => (b.rating?.average || 0) * Math.log2(2 + (b.rating?.count || 0)) - (a.rating?.average || 0) * Math.log2(2 + (a.rating?.count || 0)));
  }, [doctors, query, specialty, feeLimit, minExperience, day, sort]);

  const activeFilters = [
    specialty && { key: 'specialty', label: specialties.find(([value]) => value === specialty)?.[1], clear: () => setSpecialty('') },
    maxFee !== null && maxFee < feeCeiling && { key: 'fee', label: `Up to ₹${maxFee}/min`, clear: () => setMaxFee(null) },
    minExperience > 0 && { key: 'exp', label: `${minExperience}+ yrs experience`, clear: () => setMinExperience(0) },
    day && { key: 'day', label: `Available ${day}`, clear: () => setDay('') },
    query && { key: 'query', label: `“${query}”`, clear: () => setQuery('') }
  ].filter(Boolean);

  const clearAll = () => { setQuery(''); setSpecialty(''); setMaxFee(null); setMinExperience(0); setDay(''); };

  return (
    <PublicLayout>
      <section className="find-hero">
        <div className="page-container">
          <motion.div className="find-hero-copy" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="eyebrow">Find a doctor</span>
            <h1>Book a verified specialist in minutes.</h1>
            <p>Transparent per-minute fees, real availability and instant confirmation.</p>
          </motion.div>

          <motion.div className="search-bar" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Search size={20} className="search-icon" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Search doctors, specialties or degrees" />
            {query && <button type="button" className="search-clear" onClick={() => setQuery('')} aria-label="Clear search"><X size={16} /></button>}
            <div className="search-sort">
              <SlidersHorizontal size={16} />
              <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort doctors">
                {sorts.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
          </motion.div>

          <motion.ul className="find-trust" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
            <li><BadgeCheck size={16} /> Admin-verified doctors</li>
            <li><Zap size={16} /> Instant booking</li>
            <li><ShieldCheck size={16} /> Secure payments</li>
            <li><Clock3 size={16} /> Pay per minute</li>
          </motion.ul>
        </div>
      </section>

      <section className="page-container find-layout">
        <aside className={`filters-panel ${filtersOpen ? 'open' : ''}`}>
          <div className="filters-head">
            <strong>Filters</strong>
            {activeFilters.length > 0 && <button type="button" className="link-btn" onClick={clearAll}>Reset</button>}
            <button type="button" className="filters-close" onClick={() => setFiltersOpen(false)} aria-label="Close filters"><X size={18} /></button>
          </div>

          <div className="filter-group">
            <span className="filter-label">Specialty</span>
            <div className="spec-list">
              {specialties.map(([value, label]) => (
                <button key={value || 'all'} type="button" className={`spec-item ${specialty === value ? 'active' : ''}`} onClick={() => setSpecialty(value)}>
                  {specialty === value && <motion.span layoutId="spec-active" className="spec-active" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                  <span>{label}</span>
                  <em>{doctors ? counts[value] : '–'}</em>
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-label">Max fee <b>₹{feeLimit}/min</b></span>
            <input
              className="range"
              type="range"
              min={0}
              max={feeCeiling}
              step={5}
              value={feeLimit}
              onChange={(event) => setMaxFee(Number(event.target.value))}
              style={{ '--fill': `${(feeLimit / feeCeiling) * 100}%` }}
            />
            <div className="range-scale"><small>₹0</small><small>₹{feeCeiling}</small></div>
          </div>

          <div className="filter-group">
            <span className="filter-label">Experience</span>
            <div className="seg">
              {experienceLevels.map(([value, label]) => (
                <button key={value} type="button" className={minExperience === value ? 'active' : ''} onClick={() => setMinExperience(value)}>{label}</button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-label">Available on</span>
            <div className="day-picker">
              {weekDays.map((item) => (
                <button key={item} type="button" className={day === item ? 'active' : ''} onClick={() => setDay(day === item ? '' : item)}>{item}</button>
              ))}
            </div>
          </div>

          <button type="button" className="btn btn-primary filters-apply" onClick={() => setFiltersOpen(false)}>
            Show {filtered.length} doctor{filtered.length === 1 ? '' : 's'}
          </button>
        </aside>
        {filtersOpen && <div className="filters-backdrop" onClick={() => setFiltersOpen(false)} />}

        <div className="find-results">
          <div className="results-head">
            <div>
              <strong>{doctors ? `${filtered.length} doctor${filtered.length === 1 ? '' : 's'} available` : 'Loading doctors…'}</strong>
              <small>Showing verified specialists</small>
            </div>
            <button type="button" className="btn btn-ghost-modern filters-toggle" onClick={() => setFiltersOpen(true)}>
              <SlidersHorizontal size={16} /> Filters{activeFilters.length ? ` (${activeFilters.length})` : ''}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {activeFilters.length > 0 && (
              <motion.div className="active-filters" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                {activeFilters.map((filter) => (
                  <button key={filter.key} type="button" className="active-filter" onClick={filter.clear}>{filter.label} <X size={13} /></button>
                ))}
                <button type="button" className="link-btn" onClick={clearAll}>Clear all</button>
              </motion.div>
            )}
          </AnimatePresence>

          {!doctors ? (
            <div className="doctor-grid">{Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)}</div>
          ) : filtered.length ? (
            <motion.div layout className="doctor-grid">
              <AnimatePresence mode="popLayout">
                {filtered.map((doctor, index) => (
                  <motion.div
                    key={doctor._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 14 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
                  >
                    <DoctorCard doctor={doctor} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div className="empty-modern" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <span className="empty-icon"><SearchX size={28} /></span>
              <h3>No doctors match your filters</h3>
              <p>Try widening the fee range or picking another specialty.</p>
              <button type="button" className="btn btn-ghost-modern" onClick={clearAll}>Reset filters</button>
            </motion.div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
