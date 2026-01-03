import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiArrowLeft, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { RichTextEditor } from '../../components/RichTextEditor';

import { bookingsAPI } from '../../lib/bookingsApi';

type Booking = {
  id: number;
  title: string;
  description?: string;
  start_time: string; // ISO string
  end_time: string; // ISO string
  location?: string;
};
export default function BookingsApp() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [newTime, setNewTime] = useState('09:00');
  const [newNotes, setNewNotes] = useState('');
  const [editing, setEditing] = useState<{ id: number; title: string; date: string; time: string; notes?: string } | null>(null);

  // Fetch bookings on mount
  useEffect(() => {
    bookingsAPI.getBookings().then(res => {
      setBookings(res.data);
    });
  }, []);


  const addBooking = async () => {
    if (!newTitle.trim() || !newDate || !newTime) return;
    const start_time = new Date(`${newDate}T${newTime}`).toISOString();
    const end_time = new Date(`${newDate}T${newTime}`).toISOString(); // You may want to allow end time
    const res = await bookingsAPI.createBooking({
      title: newTitle.trim(),
      description: newNotes,
      start_time,
      end_time,
    });
    setBookings(prev => [...prev, res.data]);
    setNewTitle('');
    setNewDate(new Date().toISOString().slice(0, 10));
    setNewTime('09:00');
    setNewNotes('');
  };
  const deleteBooking = async (id: number) => {
    await bookingsAPI.deleteBooking(id);
    setBookings(prev => prev.filter(b => b.id !== id));
  };
  const startEdit = (booking: Booking) => {
    const date = booking.start_time.slice(0, 10);
    const time = new Date(booking.start_time).toISOString().slice(11, 16);
    setEditing({ id: booking.id, title: booking.title, date, time, notes: booking.description });
  };
  const saveEdit = async () => {
    if (!editing) return;
    const start_time = new Date(`${editing.date}T${editing.time}`).toISOString();
    const end_time = start_time;
    const res = await bookingsAPI.updateBooking(editing.id, {
      title: editing.title,
      start_time,
      end_time,
      description: editing.notes || ''
    });
    setBookings(prev => prev.map(b => b.id === editing.id ? res.data : b));
    setEditing(null);
  };
  // Group by date (using start_time)
  function groupBy<T>(arr: T[], key: (item: T) => string) {
    return arr.reduce((acc, item) => {
      const k = key(item);
      if (!acc[k]) acc[k] = [];
      acc[k].push(item);
      return acc;
    }, {} as Record<string, T[]>);
  }
  const grouped = groupBy(bookings, b => b.start_time.slice(0, 10));
  const sortedDates = Object.keys(grouped).sort();
  const upcomingCount = bookings.filter(b => new Date(b.start_time) >= new Date()).length;

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Top Header Bar */}
      <div className="bg-orange-600 text-white px-2 sm:px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          <div className="flex items-center gap-2">
            <>
              <img src="/lightmode.svg?v=8" alt="CITRICLOUD Bookings" className="h-3 sm:h-4 w-auto hidden" />
              <img src="/darkmode.svg?v=8" alt="CITRICLOUD Bookings" className="h-3 sm:h-4 w-auto" />
            </>
            <span className="text-white font-semibold text-sm">Bookings</span>
          </div>
          <div className="hidden lg:flex items-center text-sm text-white/90 px-3 py-1 bg-white/10 rounded">
            <FiCalendar className="w-4 h-4 mr-1.5" />
            <span>{upcomingCount} upcoming</span>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden sm:block">
          </div>
          <button 
            onClick={() => navigate('/workspace')}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 hover:bg-white/10 rounded transition-colors"
            title="Go back to Workspace"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Back</span>
          </button>
        </div>
      </div>


      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="mb-6">
            <form onSubmit={e => { e.preventDefault(); editing ? saveEdit() : addBooking(); }} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={editing ? editing.title : newTitle}
                onChange={e => editing ? setEditing({ ...editing, title: e.target.value }) : setNewTitle(e.target.value)}
                placeholder="Booking title"
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-600"
                required
              />
              <input
                type="date"
                value={editing ? editing.date : newDate}
                onChange={e => editing ? setEditing({ ...editing, date: e.target.value }) : setNewDate(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-600"
                required
              />
              <input
                type="time"
                value={editing ? editing.time : newTime}
                onChange={e => editing ? setEditing({ ...editing, time: e.target.value }) : setNewTime(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-600"
                required
              />
              <div className="md:col-span-2">
                <RichTextEditor
                  value={editing ? editing.notes || '' : newNotes}
                  onChange={value => editing ? setEditing({ ...editing, notes: value }) : setNewNotes(value)}
                  placeholder="Notes (optional)"
                  minHeight="120px"
                  compact={true}
                />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors">
                  <FiPlus className="w-4 h-4" />
                  {editing ? 'Save' : 'Add booking'}
                </button>
                {editing && (
                  <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">Cancel</button>
                )}
              </div>
            </form>
          </div>
          <div className="space-y-6">
            {sortedDates.length === 0 ? (
              <div className="text-center py-12"><p className="text-sm text-gray-500 dark:text-gray-400">No bookings yet. Add one above to get started.</p></div>
            ) : (
              sortedDates.map(date => (
                <div key={date}>
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <span>{new Date(date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">({grouped[date].length})</span>
                  </div>
                  <div className="space-y-1">
                    {grouped[date].map(booking => (
                      <div key={booking.id} className="group px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{new Date(booking.start_time).toISOString().slice(11,16)}</span>
                          <span className="flex-1 text-sm text-gray-900 dark:text-white">{booking.title}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(booking)} className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors" title="Edit">
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => { if (window.confirm('Delete this booking?')) deleteBooking(booking.id); }} className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors" title="Delete">
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {booking.description && (
                          <div 
                            className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-20 prose prose-sm dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: booking.description }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
