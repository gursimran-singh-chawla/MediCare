import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Briefcase, CalendarDays, Star } from 'lucide-react';
import { doctorImage } from '../utils/doctorImage.js';

const WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DoctorCard({ doctor }) {
  const days = new Set((doctor.availableDays || []).map((day) => day.slice(0, 3).toLowerCase()));

  return (
    <article className="doc-card">
      <Link to={`/book/${doctor._id}`} className="doc-card-media" aria-label={`View Dr. ${doctor.name}`}>
        <img src={doctorImage(doctor)} alt={`Dr. ${doctor.name}`} loading="lazy" />
        <span className="doc-card-verified"><BadgeCheck size={14} /> Verified</span>
        <span className="doc-card-rating">
          {doctor.rating?.count
            ? <><Star size={12} fill="currentColor" /> {doctor.rating.average.toFixed(1)} <small>({doctor.rating.count})</small></>
            : 'New'}
        </span>
        <span className="doc-card-specialty">{doctor.specialization}</span>
      </Link>
      <div className="doc-card-body">
        <h3>Dr. {doctor.name}</h3>
        <p className="doc-card-degree">{doctor.degree}</p>

        <div className="doc-card-stats">
          <div><Briefcase size={15} /><span><strong>{doctor.experience}+ yrs</strong><small>Experience</small></span></div>
          <div><CalendarDays size={15} /><span><strong>{days.size || '—'} days</strong><small>Per week</small></span></div>
        </div>

        <div className="doc-card-week" aria-label="Available days">
          {WEEK.map((day) => (
            <span key={day} className={days.has(day.slice(0, 3).toLowerCase()) ? 'on' : ''} title={day}>{day[0]}</span>
          ))}
        </div>

        <div className="doc-card-foot">
          <div className="doc-card-fee"><small>Consultation</small><strong>₹{doctor.price}<em>/min</em></strong></div>
          <Link className="btn btn-primary btn-sm-modern" to={`/book/${doctor._id}`}>Book <ArrowRight size={15} className="cta-arrow" /></Link>
        </div>
      </div>
    </article>
  );
}
