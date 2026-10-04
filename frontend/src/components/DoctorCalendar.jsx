import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, FileText, IndianRupee, Mail, Phone, Video, X } from 'lucide-react';
import Badge from './Badge.jsx';

const START_HOUR = 8;
const END_HOUR = 20;
const HOUR_HEIGHT = 64;
const SLOT_MINUTES = 30;
const VIEWS = [['day', 'Day'], ['week', 'Week'], ['month', 'Month']];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const toKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const fromKey = (key) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (date, days) => { const next = new Date(date); next.setDate(next.getDate() + days); return next; };
const startOfWeek = (date) => addDays(date, -date.getDay());
const sameDay = (a, b) => toKey(a) === toKey(b);
const toMinutes = (time = '00:00') => { const [h, m] = time.split(':').map(Number); return h * 60 + (m || 0); };

function formatTime(time) {
  const minutes = toMinutes(time);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${((h + 11) % 12) + 1}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h < 12 ? 'AM' : 'PM'}`;
}

function endTime(time) {
  const minutes = toMinutes(time) + SLOT_MINUTES;
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

const tone = (appointment) => (
  appointment.appointmentStatus === 'cancelled' || appointment.paymentStatus === 'failed'
    ? 'cancelled'
    : appointment.paymentStatus === 'paid' ? 'confirmed' : 'pending'
);

function monthGrid(cursor) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function MiniCalendar({ cursor, selected, onPick, eventDays }) {
  const [month, setMonth] = useState(new Date(cursor.getFullYear(), cursor.getMonth(), 1));
  useEffect(() => { setMonth(new Date(cursor.getFullYear(), cursor.getMonth(), 1)); }, [cursor]);
  const today = new Date();

  return (
    <div className="mini-cal">
      <div className="mini-cal-head">
        <strong>{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</strong>
        <div>
          <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month"><ChevronLeft size={16} /></button>
          <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month"><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="mini-cal-grid">
        {WEEKDAYS.map((day) => <span key={day} className="mini-cal-dow">{day[0]}</span>)}
        {monthGrid(month).map((day) => (
          <button
            key={toKey(day)}
            type="button"
            onClick={() => onPick(day)}
            className={[
              day.getMonth() !== month.getMonth() && 'muted',
              sameDay(day, today) && 'today',
              sameDay(day, selected) && 'selected',
              eventDays.has(toKey(day)) && 'has-events'
            ].filter(Boolean).join(' ')}
          >
            {day.getDate()}
          </button>
        ))}
      </div>
    </div>
  );
}

function EventDetails({ appointment, onClose }) {
  const date = fromKey(appointment.date);
  return (
    <motion.aside
      className="cal-details"
      initial={{ opacity: 0, x: 24, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
    >
      <div className="cal-details-head">
        <span className={`cal-dot ${tone(appointment)}`} />
        <button type="button" className="cal-icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
      </div>
      <h3>{appointment.patientName}</h3>
      <p className="cal-details-when">
        {date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
        <br />
        {formatTime(appointment.time)} – {formatTime(endTime(appointment.time))}
      </p>
      <div className="cal-details-badges">
        <Badge value={appointment.appointmentStatus} />
        <Badge value={appointment.paymentStatus} />
      </div>
      <ul className="cal-details-list">
        <li><Mail size={16} /> {appointment.patientEmail}</li>
        <li><Phone size={16} /> {appointment.patientPhone || 'Not provided'}</li>
        <li><IndianRupee size={16} /> {appointment.amount ? `₹${appointment.amount}` : 'N/A'}</li>
        {appointment.receiptNumber && <li><FileText size={16} /> {appointment.receiptNumber}</li>}
      </ul>
      <div className="cal-details-actions">
        {appointment.meetingLink && appointment.paymentStatus === 'paid' && (
          <a className="btn btn-primary btn-sm-modern" href={appointment.meetingLink} target="_blank" rel="noreferrer"><Video size={15} /> Join meeting</a>
        )}
        <Link className="btn btn-ghost-modern btn-sm-modern" to={`/doctor/appointments/${appointment._id}/prescription`}>
          <FileText size={15} /> {appointment.prescription?.updatedAt ? 'Edit prescription' : 'Add prescription'}
        </Link>
      </div>
    </motion.aside>
  );
}

function TimeGrid({ days, eventsByDay, now, onSelect, selectedId }) {
  const scrollRef = useRef(null);
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, index) => START_HOUR + index);
  const nowOffset = ((now.getHours() * 60 + now.getMinutes()) - START_HOUR * 60) / 60 * HOUR_HEIGHT;
  const nowVisible = nowOffset >= 0 && nowOffset <= (END_HOUR - START_HOUR) * HOUR_HEIGHT;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = Math.max(0, (nowVisible ? nowOffset : HOUR_HEIGHT) - 120);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="cal-time" style={{ '--cols': days.length }}>
      <div className="cal-time-head">
        <span className="cal-gutter-head">GMT{now.getTimezoneOffset() <= 0 ? '+' : '-'}{Math.abs(now.getTimezoneOffset() / 60)}</span>
        {days.map((day) => (
          <div key={toKey(day)} className={`cal-day-head ${sameDay(day, now) ? 'today' : ''}`}>
            <small>{WEEKDAYS[day.getDay()]}</small>
            <strong>{day.getDate()}</strong>
          </div>
        ))}
      </div>

      <div className="cal-time-body" ref={scrollRef}>
        <div className="cal-time-inner" style={{ height: (END_HOUR - START_HOUR) * HOUR_HEIGHT }}>
          <div className="cal-gutter">
            {hours.map((hour) => <span key={hour} style={{ top: (hour - START_HOUR) * HOUR_HEIGHT }}>{hour === START_HOUR ? '' : formatTime(`${hour}:00`)}</span>)}
          </div>
          {days.map((day) => {
            const events = eventsByDay.get(toKey(day)) || [];
            const groups = events.reduce((map, event) => map.set(event.time, [...(map.get(event.time) || []), event]), new Map());
            return (
              <div key={toKey(day)} className={`cal-col ${sameDay(day, now) ? 'today' : ''}`}>
                {hours.map((hour) => <span key={hour} className="cal-hour-line" style={{ top: (hour - START_HOUR) * HOUR_HEIGHT }} />)}
                {[...groups.values()].flatMap((group) => group.map((event, index) => {
                  const top = (toMinutes(event.time) - START_HOUR * 60) / 60 * HOUR_HEIGHT;
                  const height = SLOT_MINUTES / 60 * HOUR_HEIGHT - 3;
                  return (
                    <motion.button
                      key={event._id}
                      type="button"
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02, zIndex: 5 }}
                      className={`cal-event ${tone(event)} ${selectedId === event._id ? 'selected' : ''}`}
                      style={{ top: Math.max(0, top), height, left: `calc(${(index / group.length) * 100}% + 2px)`, width: `calc(${100 / group.length}% - 6px)` }}
                      onClick={() => onSelect(event)}
                    >
                      <strong>{event.patientName}</strong>
                      <span>{formatTime(event.time)}</span>
                    </motion.button>
                  );
                }))}
                {sameDay(day, now) && nowVisible && <span className="cal-now" style={{ top: nowOffset }} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MonthGrid({ cursor, eventsByDay, now, onSelect, onOpenDay }) {
  return (
    <div className="cal-month">
      {WEEKDAYS.map((day) => <div key={day} className="cal-month-dow">{day}</div>)}
      {monthGrid(cursor).map((day) => {
        const events = eventsByDay.get(toKey(day)) || [];
        return (
          <div key={toKey(day)} className={`cal-month-cell ${day.getMonth() !== cursor.getMonth() ? 'muted' : ''}`}>
            <button type="button" className={`cal-month-date ${sameDay(day, now) ? 'today' : ''}`} onClick={() => onOpenDay(day)}>{day.getDate()}</button>
            {events.slice(0, 3).map((event) => (
              <button key={event._id} type="button" className={`cal-chip ${tone(event)}`} onClick={() => onSelect(event)}>
                <i />{formatTime(event.time)} <b>{event.patientName}</b>
              </button>
            ))}
            {events.length > 3 && <button type="button" className="cal-more" onClick={() => onOpenDay(day)}>+{events.length - 3} more</button>}
          </div>
        );
      })}
    </div>
  );
}

export default function DoctorCalendar({ appointments }) {
  const now = useNow();
  const [view, setView] = useState('week');
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState(null);
  const [direction, setDirection] = useState(0);

  const eventsByDay = useMemo(() => {
    const map = new Map();
    [...appointments]
      .sort((a, b) => toMinutes(a.time) - toMinutes(b.time))
      .forEach((appointment) => {
        if (!appointment.date) return;
        map.set(appointment.date, [...(map.get(appointment.date) || []), appointment]);
      });
    return map;
  }, [appointments]);

  const eventDays = useMemo(() => new Set(eventsByDay.keys()), [eventsByDay]);
  const days = view === 'day' ? [cursor] : Array.from({ length: 7 }, (_, index) => addDays(startOfWeek(cursor), index));

  const title = view === 'month'
    ? cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : view === 'day'
      ? cursor.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      : (() => {
        const [first, last] = [days[0], days[6]];
        const sameMonth = first.getMonth() === last.getMonth();
        return sameMonth
          ? `${first.toLocaleDateString(undefined, { month: 'long' })} ${first.getDate()} – ${last.getDate()}, ${last.getFullYear()}`
          : `${first.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${last.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
      })();

  function shift(step) {
    setDirection(step);
    setCursor((current) => {
      if (view === 'month') return new Date(current.getFullYear(), current.getMonth() + step, 1);
      return addDays(current, view === 'week' ? step * 7 : step);
    });
  }

  function goTo(day, nextView) {
    setDirection(day > cursor ? 1 : -1);
    setCursor(day);
    if (nextView) setView(nextView);
  }

  useEffect(() => {
    function onKey(event) {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;
      if (event.key === 'ArrowLeft') shift(-1);
      if (event.key === 'ArrowRight') shift(1);
      if (event.key.toLowerCase() === 't') goTo(new Date());
      if (event.key.toLowerCase() === 'd') setView('day');
      if (event.key.toLowerCase() === 'w') setView('week');
      if (event.key.toLowerCase() === 'm') setView('month');
      if (event.key === 'Escape') setSelected(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const todayEvents = eventsByDay.get(toKey(now)) || [];
  const upcoming = todayEvents.filter((event) => toMinutes(event.time) + SLOT_MINUTES >= now.getHours() * 60 + now.getMinutes() && tone(event) !== 'cancelled');
  const counts = appointments.reduce((acc, appointment) => ({ ...acc, [tone(appointment)]: (acc[tone(appointment)] || 0) + 1 }), {});

  return (
    <div className="cal-shell">
      <aside className="cal-side">
        <MiniCalendar cursor={cursor} selected={cursor} onPick={(day) => goTo(day, view === 'month' ? 'day' : view)} eventDays={eventDays} />

        <div className="cal-side-block">
          <span className="cal-side-title">Calendars</span>
          <div className="cal-legend"><i className="confirmed" /> Confirmed <em>{counts.confirmed || 0}</em></div>
          <div className="cal-legend"><i className="pending" /> Awaiting payment <em>{counts.pending || 0}</em></div>
          <div className="cal-legend"><i className="cancelled" /> Cancelled / failed <em>{counts.cancelled || 0}</em></div>
        </div>

        <div className="cal-side-block">
          <span className="cal-side-title">Up next today</span>
          {upcoming.length ? upcoming.slice(0, 4).map((event) => (
            <button key={event._id} type="button" className="cal-upnext" onClick={() => { goTo(fromKey(event.date)); setSelected(event); }}>
              <span className={`cal-dot ${tone(event)}`} />
              <span><strong>{event.patientName}</strong><small><Clock3 size={12} /> {formatTime(event.time)}</small></span>
            </button>
          )) : <p className="cal-empty"><CalendarDays size={16} /> Nothing else today</p>}
        </div>
      </aside>

      <section className="cal-main">
        <header className="cal-toolbar">
          <button type="button" className="btn btn-ghost-modern btn-sm-modern" onClick={() => goTo(new Date())}>Today</button>
          <div className="cal-nav">
            <button type="button" className="cal-icon-btn" onClick={() => shift(-1)} aria-label="Previous"><ChevronLeft size={20} /></button>
            <button type="button" className="cal-icon-btn" onClick={() => shift(1)} aria-label="Next"><ChevronRight size={20} /></button>
          </div>
          <h3 className="cal-title">{title}</h3>
          <div className="cal-views" role="tablist">
            {VIEWS.map(([value, label]) => (
              <button key={value} type="button" role="tab" aria-selected={view === value} className={view === value ? 'active' : ''} onClick={() => setView(value)}>
                {view === value && <motion.span layoutId="cal-view-pill" className="cal-view-pill" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
                <span>{label}</span>
              </button>
            ))}
          </div>
        </header>

        <div className="cal-stage">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={`${view}-${view === 'month' ? `${cursor.getFullYear()}-${cursor.getMonth()}` : toKey(days[0])}`}
              className="cal-pane"
              custom={direction}
              initial={{ opacity: 0, x: direction * 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -30 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {view === 'month'
                ? <MonthGrid cursor={cursor} eventsByDay={eventsByDay} now={now} onSelect={setSelected} onOpenDay={(day) => goTo(day, 'day')} />
                : <TimeGrid days={days} eventsByDay={eventsByDay} now={now} onSelect={setSelected} selectedId={selected?._id} />}
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {selected && <EventDetails key={selected._id} appointment={selected} onClose={() => setSelected(null)} />}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
