import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import { erpAPI } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFileText, FiClock, FiCheckCircle, FiAlertCircle, FiX, FiUser, FiEdit2 } from 'react-icons/fi';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface Ticket {
  id: number;
  ticket_number: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at?: string;
  closed_at?: string;
  assigned_to?: number;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

const STATUS_COLORS = {
  open: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  in_progress: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  waiting_response: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  resolved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  closed: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300',
};

const PRIORITY_COLORS = {
  low: 'text-gray-500',
  medium: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-500',
};

export default function CRMTickets() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingPriority, setEditingPriority] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPriority, setNewPriority] = useState('');

  const { data: ticketsData, isLoading, refetch } = useQuery({
    queryKey: ['crm-tickets', page, selectedStatus],
    queryFn: async () => {
      try {
        const params: any = { page, page_size: 20 };
        if (selectedStatus !== 'all') {
          params.status_filter = selectedStatus;
        }
        const response = await erpAPI.getTickets(params);
        return response.data;
      } catch (error) {
        console.error('Error fetching tickets:', error);
        return { items: [], total: 0 };
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ ticketId, data }: { ticketId: number; data: any }) => {
      const response = await erpAPI.updateTicket(ticketId, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Ticket updated successfully');
      refetch();
      queryClient.invalidateQueries({ queryKey: ['user-tickets'] }); // Sync with My Profile
      setEditingStatus(false);
      setEditingPriority(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to update ticket');
    },
  });

  const tickets = ticketsData?.items || [];
  const totalPages = Math.ceil((ticketsData?.total || 0) / 20);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <FiAlertCircle className="w-4 h-4" />;
      case 'in_progress':
        return <FiClock className="w-4 h-4" />;
      case 'resolved':
      case 'closed':
        return <FiCheckCircle className="w-4 h-4" />;
      default:
        return <FiFileText className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleUpdateStatus = (ticketId: number, status: string) => {
    updateTicketMutation.mutate({ ticketId, data: { status } });
  };

  const handleUpdatePriority = (ticketId: number, priority: string) => {
    updateTicketMutation.mutate({ ticketId, data: { priority } });
  };

  const openTicketDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.status);
    setNewPriority(ticket.priority);
  };

  return (
    <DashboardLayout
      title="Support Tickets"
      breadcrumb={<div className="text-xs text-gray-500">CRM / Tickets</div>}
    >
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Support Tickets</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage customer support requests</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {['all', 'open', 'in_progress', 'waiting_response', 'resolved', 'closed'].map((status) => (
          <button
            key={status}
            onClick={() => {
              setSelectedStatus(status);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              selectedStatus === status
                ? 'bg-blue-500 text-white'
                : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
            }`}
          >
            {status.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="spinner"></div>
        </div>
      ) : tickets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 rounded-2xl text-center"
        >
          <FiFileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No tickets found</p>
        </motion.div>
      ) : (
        <>
          <div className="space-y-4">
            {tickets.map((ticket: Ticket, index: number) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-6 rounded-xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                        #{ticket.ticket_number}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium ${STATUS_COLORS[ticket.status as keyof typeof STATUS_COLORS]}`}>
                        {getStatusIcon(ticket.status)}
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className={`text-xs font-medium ${PRIORITY_COLORS[ticket.priority as keyof typeof PRIORITY_COLORS]}`}>
                        {ticket.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                      {ticket.subject}
                    </h3>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {ticket.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      {ticket.user && (
                        <span>By: {ticket.user.username}</span>
                      )}
                      <span>Created: {formatDate(ticket.created_at)}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => openTicketDetails(ticket)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Ticket Detail Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setSelectedTicket(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                      #{selectedTicket.ticket_number}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium ${STATUS_COLORS[selectedTicket.status as keyof typeof STATUS_COLORS]}`}>
                      {getStatusIcon(selectedTicket.status)}
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {selectedTicket.subject}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Ticket Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                    <div className="mt-1 flex items-center gap-2">
                      {editingStatus ? (
                        <>
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="waiting_response">Waiting Response</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                          <button
                            onClick={() => {
                              handleUpdateStatus(selectedTicket.id, newStatus);
                              setSelectedTicket({ ...selectedTicket, status: newStatus });
                            }}
                            className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingStatus(false);
                              setNewStatus(selectedTicket.status);
                            }}
                            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <span className={`flex-1 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${STATUS_COLORS[selectedTicket.status as keyof typeof STATUS_COLORS]}`}>
                            {getStatusIcon(selectedTicket.status)}
                            {selectedTicket.status.replace('_', ' ')}
                          </span>
                          <button
                            onClick={() => setEditingStatus(true)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</label>
                    <div className="mt-1 flex items-center gap-2">
                      {editingPriority ? (
                        <>
                          <select
                            value={newPriority}
                            onChange={(e) => setNewPriority(e.target.value)}
                            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                          <button
                            onClick={() => {
                              handleUpdatePriority(selectedTicket.id, newPriority);
                              setSelectedTicket({ ...selectedTicket, priority: newPriority });
                            }}
                            className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingPriority(false);
                              setNewPriority(selectedTicket.priority);
                            }}
                            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <span className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${PRIORITY_COLORS[selectedTicket.priority as keyof typeof PRIORITY_COLORS]}`}>
                            {selectedTicket.priority.toUpperCase()}
                          </span>
                          <button
                            onClick={() => setEditingPriority(true)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {selectedTicket.user && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted By</label>
                      <div className="mt-1 flex items-center gap-2">
                        <FiUser className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-800 dark:text-gray-200">{selectedTicket.user.username}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">({selectedTicket.user.email})</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</label>
                    <div className="mt-1 text-gray-800 dark:text-gray-200">
                      {formatDate(selectedTicket.created_at)}
                    </div>
                  </div>

                  {selectedTicket.updated_at && selectedTicket.updated_at !== selectedTicket.created_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</label>
                      <div className="mt-1 text-gray-800 dark:text-gray-200">
                        {formatDate(selectedTicket.updated_at)}
                      </div>
                    </div>
                  )}

                  {selectedTicket.closed_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Closed</label>
                      <div className="mt-1 text-gray-800 dark:text-gray-200">
                        {formatDate(selectedTicket.closed_at)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">Description</label>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {selectedTicket.description}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {selectedTicket.status !== 'in_progress' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedTicket.id, 'in_progress')}
                      disabled={updateTicketMutation.isPending}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      Mark In Progress
                    </button>
                  )}
                  {selectedTicket.status !== 'resolved' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedTicket.id, 'resolved')}
                      disabled={updateTicketMutation.isPending}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {selectedTicket.status !== 'closed' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedTicket.id, 'closed')}
                      disabled={updateTicketMutation.isPending}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                      Close Ticket
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
