import React, { useState } from 'react';
import { LockClosedIcon, ExclamationTriangleIcon, ShieldCheckIcon, EyeIcon, EyeSlashIcon, DocumentTextIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import ToolPageLayout from '../layout/ToolPageLayout';

interface SecureNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface EncryptedNote {
  id: string;
  encryptedData: string;
  iv: string;
  salt: string;
  createdAt: string;
  updatedAt: string;
}

const SecureNotes: React.FC = () => {
  const [notes, setNotes] = useState<SecureNote[]>([]);
  const [currentNote, setCurrentNote] = useState<SecureNote | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Generate a key from password using PBKDF2
  const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  };

  // Encrypt text
  const encryptText = async (text: string, password: string): Promise<{ encryptedData: string; iv: string; salt: string }> => {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const key = await deriveKey(password, salt);
    const encoder = new TextEncoder();
    const textBuffer = encoder.encode(text);
    
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      textBuffer
    );

    return {
      encryptedData: btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer))),
      iv: btoa(String.fromCharCode(...iv)),
      salt: btoa(String.fromCharCode(...salt))
    };
  };

  // Decrypt text
  const decryptText = async (encryptedData: string, iv: string, salt: string, password: string): Promise<string> => {
    const saltArray = new Uint8Array(atob(salt).split('').map(char => char.charCodeAt(0)));
    const ivArray = new Uint8Array(atob(iv).split('').map(char => char.charCodeAt(0)));
    const encryptedArray = new Uint8Array(atob(encryptedData).split('').map(char => char.charCodeAt(0)));
    
    const key = await deriveKey(password, saltArray);
    
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivArray },
      key,
      encryptedArray
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  };

  const handleCreateNote = () => {
    const newNote: SecureNote = {
      id: Date.now().toString(),
      title: '',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCurrentNote(newNote);
  };

  const handleSaveNote = async () => {
    if (!currentNote || !password) {
      setError('Please enter a password and note content');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!currentNote.title.trim() || !currentNote.content.trim()) {
      setError('Please enter both title and content');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const noteData = JSON.stringify(currentNote);
      const encrypted = await encryptText(noteData, password);
      
      const encryptedNote: EncryptedNote = {
        id: currentNote.id,
        encryptedData: encrypted.encryptedData,
        iv: encrypted.iv,
        salt: encrypted.salt,
        createdAt: currentNote.createdAt,
        updatedAt: new Date().toISOString()
      };

      // Save to localStorage
      const savedNotes = JSON.parse(localStorage.getItem('secureNotes') || '[]');
      const existingIndex = savedNotes.findIndex((n: EncryptedNote) => n.id === encryptedNote.id);
      
      if (existingIndex >= 0) {
        savedNotes[existingIndex] = encryptedNote;
      } else {
        savedNotes.push(encryptedNote);
      }
      
      localStorage.setItem('secureNotes', JSON.stringify(savedNotes));
      
      setNotes([...notes.filter(n => n.id !== currentNote.id), currentNote]);
      setCurrentNote(null);
      setSuccess('Note saved successfully!');
    } catch (err) {
      setError('Failed to save note. Please try again.');
      console.error('Save error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnlockNotes = async () => {
    if (!password) {
      setError('Please enter a password');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const savedNotes = JSON.parse(localStorage.getItem('secureNotes') || '[]');
      const decryptedNotes: SecureNote[] = [];

      for (const encryptedNote of savedNotes) {
        try {
          const decryptedData = await decryptText(
            encryptedNote.encryptedData,
            encryptedNote.iv,
            encryptedNote.salt,
            password
          );
          const note: SecureNote = JSON.parse(decryptedData);
          decryptedNotes.push(note);
        } catch (err) {
          console.error('Failed to decrypt note:', encryptedNote.id);
        }
      }

      setNotes(decryptedNotes);
      setIsUnlocked(true);
      setSuccess(`Successfully unlocked ${decryptedNotes.length} notes`);
    } catch (err) {
      setError('Failed to unlock notes. Please check your password.');
      console.error('Unlock error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    const savedNotes = JSON.parse(localStorage.getItem('secureNotes') || '[]');
    const filteredNotes = savedNotes.filter((n: EncryptedNote) => n.id !== noteId);
    localStorage.setItem('secureNotes', JSON.stringify(filteredNotes));
    
    setNotes(notes.filter(n => n.id !== noteId));
    if (currentNote?.id === noteId) {
      setCurrentNote(null);
    }
    setSuccess('Note deleted successfully');
  };

  return (
    <ToolPageLayout
      toolId="secure-notes"
      title="Secure Notes"
      icon={DocumentTextIcon}
      group="privacy"
    >
      <div className="max-w-4xl mx-auto">
        {/* Security Notice */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <ShieldCheckIcon className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                🔒 Client-Side Encryption
              </h3>
              <p className="text-green-700 dark:text-green-300 text-sm">
                Your notes are encrypted entirely in your browser using AES-256-GCM. 
                The password and notes never leave your device.
              </p>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-white dark:bg-primary-light rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Master Password</h3>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your master password"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
            <button
              onClick={handleUnlockNotes}
              disabled={!password || isProcessing}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
            >
              {isProcessing ? 'Unlocking...' : 'Unlock Notes'}
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <p>• Use a strong, unique password</p>
            <p>• Store this password securely - it cannot be recovered</p>
            <p>• The password is never stored or transmitted</p>
          </div>
        </div>

        {/* Notes List */}
        {isUnlocked && (
          <div className="bg-white dark:bg-primary-light rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Your Notes</h3>
              <button
                onClick={handleCreateNote}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                New Note
              </button>
            </div>
            
            {notes.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No notes found. Create your first secure note!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.map(note => (
                  <div
                    key={note.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => setCurrentNote(note)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                        {note.title || 'Untitled'}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {note.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Note Editor */}
        {currentNote && (
          <div className="bg-white dark:bg-primary-light rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">
              {currentNote.id && notes.find(n => n.id === currentNote.id) ? 'Edit Note' : 'New Note'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={currentNote.title}
                  onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                  placeholder="Enter note title"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  value={currentNote.content}
                  onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                  placeholder="Enter your note content..."
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-vertical"
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handleSaveNote}
                  disabled={!password || isProcessing}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <LockClosedIcon className="w-5 h-5" />
                      Save Note
                    </>
                  )}
                </button>
                <button
                  onClick={() => setCurrentNote(null)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Security Warning */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                ⚠️ Important Security Notice
              </h3>
              <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1">
                <li>• Keep your master password safe - there's no way to recover notes without it</li>
                <li>• Clear browser cache after use for additional security</li>
                <li>• Notes are stored locally in your browser</li>
                <li>• Consider backing up important notes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <p className="text-green-700 dark:text-green-300">{success}</p>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
};

export default SecureNotes; 