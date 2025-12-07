import React, { useState, useEffect } from 'react';
import { EmergencyContact } from '../types';

interface Props {
  contact: EmergencyContact;
  onSave: (contact: EmergencyContact) => void;
}

export const EmergencyContactForm: React.FC<Props> = ({ contact, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState<EmergencyContact>(contact);

  // Sync prop changes to internal state if they happen externally
  useEffect(() => {
    setFormState(contact);
  }, [contact]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formState);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
        <div className="flex justify-between items-start mb-4">
            <h2 className="text-sm uppercase tracking-wider text-slate-500 font-bold">Emergency Contact</h2>
            <button 
                onClick={() => setIsEditing(true)}
                className="text-xs text-blue-400 hover:text-blue-300 underline"
            >
                Edit Details
            </button>
        </div>
        {contact.name ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <span className="block text-xs text-slate-500">Name</span>
                    <span className="font-medium text-slate-200">{contact.name}</span>
                </div>
                <div>
                    <span className="block text-xs text-slate-500">Relationship</span>
                    <span className="font-medium text-slate-200">{contact.relationship}</span>
                </div>
                <div>
                    <span className="block text-xs text-slate-500">Phone</span>
                    <span className="font-medium text-slate-200 font-mono">{contact.phone}</span>
                </div>
            </div>
        ) : (
            <div className="text-slate-400 text-sm italic">
                No emergency contact saved. Please add one.
            </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
      <h2 className="text-sm uppercase tracking-wider text-slate-400 font-bold mb-4">Edit Emergency Contact</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label className="block text-xs text-slate-400 mb-1">Name</label>
                <input
                    name="name"
                    required
                    value={formState.name}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-slate-200 text-sm focus:border-blue-500 outline-none"
                    placeholder="Jane Doe"
                />
            </div>
            <div>
                <label className="block text-xs text-slate-400 mb-1">Relationship</label>
                <input
                    name="relationship"
                    required
                    value={formState.relationship}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-slate-200 text-sm focus:border-blue-500 outline-none"
                    placeholder="Spouse, Parent, etc."
                />
            </div>
            <div>
                <label className="block text-xs text-slate-400 mb-1">Phone</label>
                <input
                    name="phone"
                    required
                    type="tel"
                    value={formState.phone}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-slate-200 text-sm focus:border-blue-500 outline-none"
                    placeholder="+1 555-0199"
                />
            </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
            <button 
                type="button" 
                onClick={() => {
                    setFormState(contact); 
                    setIsEditing(false);
                }}
                className="px-3 py-1 text-slate-400 hover:text-white text-sm"
            >
                Cancel
            </button>
            <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded text-sm font-medium"
            >
                Save Contact
            </button>
        </div>
      </form>
    </div>
  );
};
