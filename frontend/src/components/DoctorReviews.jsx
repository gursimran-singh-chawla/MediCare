import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageSquareText, Pencil, Star, Trash2 } from 'lucide-react';
import { Stars, StarInput } from './StarRating.jsx';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';

const PAGE = 5;

function timeAgo(value) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [unit, size] of units) {
    const amount = Math.floor(seconds / size);
    if (amount >= 1) return `${amount} ${unit}${amount > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

const initials = (name = '') => name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

function ReviewForm({ doctorId, existing, onSaved, onCancel }) {
  const { setAlert } = useApp();
  const [rating, setRating] = useState(existing?.rating || 0);
  const [comment, setComment] = useState(existing?.comment || '');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!rating) { setAlert({ type: 'error', message: 'Please choose a star rating.' }); return; }
    setBusy(true);
    try {
      const data = await api(`/api/doctors/${doctorId}/reviews`, { method: 'POST', body: { rating, comment } });
      setAlert({ type: 'success', message: data.message });
      onSaved();
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.form className="review-form" onSubmit={submit} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
      <strong>{existing ? 'Edit your review' : 'How was your consultation?'}</strong>
      <StarInput value={rating} onChange={setRating} />
      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Share what went well or what could be better…"
        rows={4}
        maxLength={1000}
        required
        minLength={3}
      />
      <div className="review-form-foot">
        <small>{comment.length}/1000</small>
        <div>
          {onCancel && <button type="button" className="btn btn-ghost-modern btn-sm-modern" onClick={onCancel}>Cancel</button>}
          <button type="submit" className="btn btn-primary btn-sm-modern" disabled={busy}>{busy ? <span className="spinner" /> : existing ? 'Update review' : 'Post review'}</button>
        </div>
      </div>
    </motion.form>
  );
}

export default function DoctorReviews({ doctorId, readOnly = false, onSummary }) {
  const location = useLocation();
  const { session, setAlert } = useApp();
  const [data, setData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [visible, setVisible] = useState(PAGE);

  const load = useCallback(() => api(`/api/doctors/${doctorId}/reviews`)
    .then((result) => { setData(result); onSummary?.(result.summary); })
    .catch((error) => setAlert({ type: 'error', message: error.message })), [doctorId, onSummary, setAlert]);

  useEffect(() => { load(); }, [load]);

  async function remove() {
    if (!window.confirm('Delete your review?')) return;
    try {
      const result = await api(`/api/doctors/${doctorId}/reviews`, { method: 'DELETE' });
      setAlert({ type: 'success', message: result.message });
      setEditing(false);
      load();
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  }

  if (!data) return <div className="reviews-card card-modern"><span className="sk-line w40 shimmer" /><span className="sk-line w80 shimmer" /><span className="sk-line w60 shimmer" /></div>;

  const { summary, reviews, myReview, canReview } = data;
  const others = reviews.filter((review) => review._id !== myReview?._id);
  const isPatient = Boolean(session?.user);

  let action = null;
  if (!readOnly) {
    if (myReview && !editing) action = null;
    else if (canReview) action = <ReviewForm key={myReview?._id || 'new'} doctorId={doctorId} existing={editing ? myReview : null} onSaved={() => { setEditing(false); load(); }} onCancel={editing ? () => setEditing(false) : null} />;
    else if (isPatient) action = <p className="review-note"><MessageSquareText size={16} /> You can rate this doctor after a paid appointment with them.</p>;
    else action = <p className="review-note"><MessageSquareText size={16} /> <span><Link to="/login" state={{ from: `${location.pathname}#reviews` }}>Log in</Link> as a patient to rate this doctor after your consultation.</span></p>;
  }

  return (
    <section className="reviews-card card-modern" id="reviews">
      <div className="reviews-head">
        <h2>Patient reviews</h2>
        <span className="muted">{summary.count ? `${summary.count} review${summary.count > 1 ? 's' : ''}` : 'No reviews yet'}</span>
      </div>

      <div className="reviews-layout">
        <div className="reviews-summary">
          <div className="reviews-score">
            <strong>{summary.count ? summary.average.toFixed(1) : '–'}</strong>
            <Stars value={summary.average} size={20} />
            <small>Based on {summary.count} review{summary.count === 1 ? '' : 's'}</small>
          </div>
          <div className="reviews-bars">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = summary.distribution[star] || 0;
              const percent = summary.count ? (count / summary.count) * 100 : 0;
              return (
                <div key={star} className="reviews-bar">
                  <span>{star} <Star size={12} fill="currentColor" /></span>
                  <div><motion.i initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 0.8, delay: (5 - star) * 0.06, ease: [0.22, 1, 0.36, 1] }} /></div>
                  <em>{count}</em>
                </div>
              );
            })}
          </div>
        </div>

        <div className="reviews-feed">
          <AnimatePresence mode="wait">{action}</AnimatePresence>

          {myReview && !editing && (
            <motion.article className="review mine" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <span className="review-avatar">{initials(myReview.patientName)}</span>
              <div className="review-body">
                <div className="review-top">
                  <strong>Your review</strong>
                  <small>{timeAgo(myReview.updatedAt)}</small>
                </div>
                <Stars value={myReview.rating} size={14} />
                <p>{myReview.comment}</p>
                {!readOnly && (
                  <div className="review-actions">
                    <button type="button" className="link-btn" onClick={() => setEditing(true)}><Pencil size={13} /> Edit</button>
                    <button type="button" className="link-btn danger" onClick={remove}><Trash2 size={13} /> Delete</button>
                  </div>
                )}
              </div>
            </motion.article>
          )}

          {others.length === 0 && !myReview && <p className="review-empty">Be the first to share your experience.</p>}

          <AnimatePresence initial={false}>
            {others.slice(0, visible).map((review, index) => (
              <motion.article key={review._id} className="review" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index, 5) * 0.04 }}>
                <span className="review-avatar">{initials(review.patientName)}</span>
                <div className="review-body">
                  <div className="review-top">
                    <strong>{review.patientName}</strong>
                    <small>{timeAgo(review.updatedAt || review.createdAt)}</small>
                  </div>
                  <Stars value={review.rating} size={14} />
                  <p>{review.comment}</p>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>

          {others.length > visible && (
            <button type="button" className="btn btn-ghost-modern btn-sm-modern reviews-more" onClick={() => setVisible((count) => count + PAGE)}>
              Show more reviews ({others.length - visible})
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
