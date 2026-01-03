/**
 * Web Profile Tickets Implementation Reference
 * Based on Mobile App: mobile-app/src/screens/ProfileSheet.tsx
 * 
 * This file shows the exact structure and API calls needed
 * to sync tickets between web and mobile apps
 */

// ============================================================
// 1. API CLIENT FUNCTIONS (for web/lib/api.ts or similar)
// ============================================================

export const profileAPI = {
  getTickets: async () => {
    try {
      console.log('[API] Fetching tickets from /erp/tickets');
      const response = await api.get('/erp/tickets');
      console.log('[API] Tickets response:', response.data);
      return response.data?.items || response.data;
    } catch (error: any) {
      console.log('[API] /erp/tickets failed, trying alternative endpoints');
      
      try {
        console.log('[API] Trying /support/tickets');
        const response = await api.get('/support/tickets');
        console.log('[API] Support tickets response:', response.data);
        return response.data?.items || response.data;
      } catch (e1) {
        try {
          console.log('[API] Trying /auth/profile/tickets');
          const response = await api.get('/auth/profile/tickets');
          console.log('[API] Profile tickets response:', response.data);
          return response.data?.items || response.data;
        } catch (e2) {
          console.log('[API] All ticket endpoints failed');
          return [];
        }
      }
    }
  },

  createTicket: async (subject: string, description: string, priority?: string) => {
    try {
      // Validate subject length
      if (subject.trim().length < 5) {
        throw new Error('Subject must be at least 5 characters long');
      }
      if (!description.trim()) {
        throw new Error('Description is required');
      }

      console.log('[API] Creating ticket on /erp/tickets');
      const response = await api.post('/erp/tickets', { 
        subject, 
        description, 
        priority: priority || 'medium'
      });
      console.log('[API] Ticket created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('[API] /erp/tickets creation failed, trying alternative endpoints');
      
      try {
        console.log('[API] Trying /support/tickets');
        const response = await api.post('/support/tickets', { 
          subject, 
          description, 
          priority: priority || 'medium'
        });
        console.log('[API] Ticket created on /support/tickets');
        return response.data;
      } catch (e1) {
        try {
          console.log('[API] Trying /auth/profile/tickets');
          const response = await api.post('/auth/profile/tickets', { 
            subject, 
            description, 
            priority: priority || 'medium'
          });
          console.log('[API] Ticket created on /auth/profile/tickets');
          return response.data;
        } catch (e2) {
          console.log('[API] All ticket creation endpoints failed');
          throw error; // Throw original error
        }
      }
    }
  },
};

// ============================================================
// 2. REACT COMPONENT STRUCTURE (for Profile.tsx tickets tab)
// ============================================================

/*
import { useState, useEffect } from 'react';
import { profileAPI } from '@/lib/api';

export function TicketsTab() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Fetch tickets when tab loads
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await profileAPI.getTickets();
      setTickets(Array.isArray(data) ? data : data?.items || []);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    setCreateError(null);

    if (!subject.trim() || !description.trim()) {
      setCreateError('Please fill in both subject and description');
      return;
    }

    try {
      setIsCreating(true);
      await profileAPI.createTicket(subject, description, priority);
      
      // Reset form
      setSubject('');
      setDescription('');
      setPriority('medium');
      setShowCreateForm(false);
      
      // Refresh tickets list
      await fetchTickets();
      
      // Show success message
      alert('Ticket created successfully');
    } catch (error: any) {
      const message = error.message || 'Failed to create ticket';
      setCreateError(message);
      console.error('Ticket creation error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Support Tickets</h3>
        <p className="text-sm text-gray-500 mb-4">
          View and manage your support tickets. Responses from our team will appear here.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin">Loading...</div>
        </div>
      ) : tickets.length > 0 ? (
        // DATATABLE
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => {
                const statusColor = {
                  open: 'blue',
                  closed: 'gray',
                  pending: 'amber',
                  resolved: 'green',
                }[ticket.status] || 'blue';

                const priorityColor = {
                  high: 'red',
                  medium: 'amber',
                  low: 'green',
                }[ticket.priority] || 'gray';

                return (
                  <tr key={ticket.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">#{ticket.id}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{ticket.subject}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded bg-${priorityColor}-100 text-${priorityColor}-700`}>
                        {ticket.priority || 'medium'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded bg-${statusColor}-100 text-${statusColor}-700`}>
                        {ticket.status || 'open'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No tickets yet. Create your first support ticket below.</p>
      )}

      {/* CREATE TICKET BUTTON */}
      <button
        onClick={() => setShowCreateForm(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
      >
        + Create New Ticket
      </button>

      {/* CREATE TICKET MODAL/DIALOG */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Create Support Ticket</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Describe your issue briefly (min 5 chars)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p as any)}
                      className={`px-3 py-2 rounded-lg font-semibold text-sm ${
                        priority === p
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed information about your issue"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Error message */}
              {createError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                  {createError}
                </div>
              )}
            </div>

            {/* Modal Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTicket}
                disabled={isCreating}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {isCreating ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
*/

// ============================================================
// 3. TAILWIND CSS CLASSES FOR STYLING
// ============================================================

/*
Priority Colors:
- high: bg-red-100 text-red-700 (Red)
- medium: bg-amber-100 text-amber-700 (Orange)
- low: bg-green-100 text-green-700 (Green)

Status Colors:
- open: bg-blue-100 text-blue-700 (Blue)
- closed: bg-gray-100 text-gray-700 (Gray)
- pending: bg-amber-100 text-amber-700 (Orange)
- resolved: bg-green-100 text-green-700 (Green)
*/

// ============================================================
// 4. MIGRATION CHECKLIST
// ============================================================

/*
STEPS TO IMPLEMENT IN WEB APP:

1. API Integration
   ✓ Copy getTickets() function from this file
   ✓ Copy createTicket() function from this file
   ✓ Add to web/lib/api.ts or similar

2. Component Creation
   ✓ Create new component or update existing Profile.tsx
   ✓ Add TicketsTab component
   ✓ Implement datatable with columns: ID, Subject, Priority, Status, Date
   ✓ Implement create ticket modal

3. State Management
   ✓ useState for tickets array
   ✓ useState for loading states
   ✓ useState for form inputs (subject, description, priority)
   ✓ useState for error messages

4. Hook Effects
   ✓ useEffect to fetch tickets on tab load
   ✓ Auto-refresh after ticket creation
   ✓ Proper error handling

5. Styling
   ✓ Match mobile app colors and layout
   ✓ Use Tailwind classes (or equivalent)
   ✓ Responsive design for mobile/tablet/desktop

6. Testing
   ✓ Create ticket from web - verify appears on mobile
   ✓ Create ticket from mobile - verify appears on web
   ✓ Test subject validation (< 5 chars error)
   ✓ Test description required validation
   ✓ Test priority selection
   ✓ Test error states

7. Backend Issues (notify backend team)
   ✓ /erp/tickets GET returning 500 error
   ✓ /erp/tickets POST may have same issue
   ✓ Consider using /auth/profile/tickets endpoints as primary

*/
