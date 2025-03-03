import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Calendar, Tag, Save, ArrowLeft, Loader2, Search, Filter, SortDesc } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { api } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface JournalEntry {
  id: string;
  content: string;
  topics: string[];
  created_at: string;
  sentiment?: string;
}

const Journal = () => {
  const [entry, setEntry] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showEntryList, setShowEntryList] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const data = await api.getJournalEntries();
      setEntries(data);
    } catch (error) {
      console.error('Failed to load journal entries:', error);
      toast.error('Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!entry.trim()) {
      toast.error('Please write something before saving');
      return;
    }

    try {
      setSaving(true);
      const newEntry = await api.createJournalEntry({
        content: entry,
        topics: tags,
      });

      setEntries([newEntry, ...entries]);
      setEntry('');
      setTags([]);
      toast.success('Journal entry saved successfully');
      setShowEntryList(true);
    } catch (error) {
      console.error('Failed to save journal entry:', error);
      toast.error('Failed to save journal entry');
    } finally {
      setSaving(false);
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tag => entry.topics.includes(tag));

    return matchesSearch && matchesTags;
  });

  const allTags = Array.from(new Set(entries.flatMap(entry => entry.topics)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="relative max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/activities"
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Journal</h1>
              <p className="text-gray-300">Record and reflect on your journey</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowEntryList(!showEntryList)}
            className={cn(
              "px-4 py-2 rounded-lg",
              "bg-gradient-to-r from-emerald-500 to-teal-500",
              "text-white font-medium",
              "flex items-center space-x-2"
            )}
          >
            <Book className="w-5 h-5" />
            <span>{showEntryList ? 'New Entry' : 'View Entries'}</span>
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {showEntryList ? (
            <motion.div
              key="entries"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Search and filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search entries..."
                    className={cn(
                      "w-full pl-10 pr-4 py-2 rounded-lg",
                      "bg-white/5 border border-white/10",
                      "text-white placeholder-gray-400",
                      "focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    )}
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTags(prev => 
                        prev.includes(tag) 
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      )}
                      className={cn(
                        "px-3 py-1 rounded-full whitespace-nowrap",
                        "transition-colors duration-200",
                        selectedTags.includes(tag)
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-white/5 text-gray-400 hover:text-white"
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Entries list */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
              ) : filteredEntries.length > 0 ? (
                <div className="grid gap-6">
                  {filteredEntries.map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "p-6 rounded-xl",
                        "bg-white/5 backdrop-blur-sm",
                        "border border-white/10"
                      )}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                        </div>
                        {entry.sentiment && (
                          <div className="text-sm text-gray-400">
                            Mood: {entry.sentiment}
                          </div>
                        )}
                      </div>
                      <p className="text-white mb-4 whitespace-pre-wrap">
                        {entry.content}
                      </p>
                      {entry.topics.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {entry.topics.map((topic) => (
                            <span
                              key={topic}
                              className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-sm"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Book className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No entries found</h3>
                  <p className="text-gray-400">
                    {searchTerm || selectedTags.length > 0
                      ? "Try adjusting your search or filters"
                      : "Start writing your first journal entry"}
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Date */}
              <div className="flex items-center space-x-4 text-gray-300">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>

              {/* Journal entry */}
              <div className="space-y-2">
                <textarea
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  placeholder="Write your thoughts here..."
                  className={cn(
                    "w-full h-64 p-4 rounded-xl",
                    "bg-white/5 backdrop-blur-sm",
                    "border border-white/10",
                    "text-white placeholder-gray-400",
                    "focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                    "resize-none"
                  )}
                />
              </div>

              {/* Tags */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Tag className="w-5 h-5" />
                  <span>Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <div
                      key={tag}
                      className={cn(
                        "px-3 py-1 rounded-full",
                        "bg-emerald-500/20 text-emerald-300",
                        "flex items-center space-x-2"
                      )}
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Add a tag..."
                    className={cn(
                      "px-3 py-1 rounded-full",
                      "bg-white/5 border border-white/10",
                      "text-white placeholder-gray-400",
                      "focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    )}
                  />
                </div>
              </div>

              {/* Save button */}
              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={saving}
                  className={cn(
                    "px-6 py-2 rounded-lg",
                    "bg-gradient-to-r from-emerald-500 to-teal-500",
                    "text-white font-medium",
                    "flex items-center space-x-2",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Entry</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Journal;