import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiArrowLeft, FiEdit2, FiTrash2, FiPlus, FiMail, FiPhone, FiAlertTriangle } from 'react-icons/fi';
import { workspaceAPI } from '../../lib/workspaceApi';

type Contact = {
  id: string;
  name: string;
  email: string;
  phone?: string;
};

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function ContactsApp() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [storeItemId, setStoreItemId] = useState<number | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await workspaceAPI.getItems('contacts', 'list');
        const list = res.data as Array<{ id: number; data: any }>;
        if (list.length > 0) {
          setStoreItemId(list[0].id);
          setContacts(list[0].data as Contact[]);
        }
      } catch {}
    })();
  }, []);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [editing, setEditing] = useState<Contact | null>(null);

  const addContact = () => {
    if (!newName.trim() || !newEmail.trim()) return;
    setContacts(prev => [...prev, { id: uuid(), name: newName.trim(), email: newEmail.trim(), phone: newPhone.trim() }]);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
  };
  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };
  const startEdit = (contact: Contact) => {
    setEditing({ ...contact });
  };
  const saveEdit = () => {
    if (!editing) return;
    setContacts(prev => prev.map(c => c.id === editing.id ? editing : c));
    setEditing(null);
  };

  useEffect(() => {
    (async () => {
      try {
        if (storeItemId) {
          await workspaceAPI.updateItem(storeItemId, contacts);
        } else {
          const res = await workspaceAPI.createOrUpdateItem({ app_name: 'contacts', item_key: 'list', data: contacts });
          setStoreItemId(res.data.id);
        }
      } catch {}
      try {
        localStorage.setItem('contacts_list', JSON.stringify(contacts));
      } catch {}
    })();
  }, [contacts, storeItemId]);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Top Header Bar */}
      <div className="bg-teal-500 text-white px-2 sm:px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          <div className="flex items-center gap-2">
            <img 
              src="/box-white.svg" 
              alt="CITRICLOUD" 
              className="h-7 sm:h-8 w-auto rounded-lg"
            />
            <div className="flex flex-col">
              <span className="text-white font-semibold text-xs sm:text-sm" style={{ fontFamily: "'Source Code Pro', monospace" }}>CITRICLOUD.com</span>
              <span className="text-white/80 text-[8px] sm:text-[9px] tracking-wide" style={{ fontFamily: "'Source Code Pro', monospace" }}>Enterprise Cloud Platform</span>
            </div>
            <span className="text-white font-semibold text-sm">Contacts</span>
          </div>
          <div className="hidden lg:flex items-center text-sm text-white/90 px-3 py-1 bg-white/10 rounded">
            <FiUsers className="w-4 h-4 mr-1.5" />
            <span>{contacts.length} contacts</span>
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
          {/* Add/Edit Contact */}
          <form onSubmit={e => { e.preventDefault(); editing ? saveEdit() : addContact(); }} className="flex flex-col gap-3 mb-4 sm:mb-6">
            <input
              type="text"
              value={editing ? editing.name : newName}
              onChange={e => editing ? setEditing({ ...editing, name: e.target.value }) : setNewName(e.target.value)}
              placeholder="Name"
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="email"
              value={editing ? editing.email : newEmail}
              onChange={e => editing ? setEditing({ ...editing, email: e.target.value }) : setNewEmail(e.target.value)}
              placeholder="Email"
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              value={editing ? editing.phone || '' : newPhone}
              onChange={e => editing ? setEditing({ ...editing, phone: e.target.value }) : setNewPhone(e.target.value)}
              placeholder="Phone (optional)"
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="flex gap-2">
              <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-colors">
                <FiPlus className="w-4 h-4" />
                {editing ? 'Save' : 'Add Contact'}
              </button>
              {editing && (
                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">Cancel</button>
              )}
            </div>
          </form>
          {/* Contacts List */}
          <div className="space-y-2">
            {contacts.length === 0 ? (
              <div className="text-center py-16">
                <FiUsers className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No contacts yet. Add one above to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {contacts.map(contact => (
                  <div key={contact.id} className="group bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-500 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{contact.name}</h3>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(contact)} className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors" title="Edit">
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => { if (window.confirm('Delete this contact?')) deleteContact(contact.id); }} className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors" title="Delete">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <FiMail className="w-3.5 h-3.5" />
                        <span>{contact.email}</span>
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FiPhone className="w-3.5 h-3.5" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
