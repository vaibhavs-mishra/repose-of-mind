import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

type JournalEntry = {
  _id: string;
  title: string;
  content: string;
  mood: string;
  createdAt: string;
};

export function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('neutral');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/journal', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch entries');
      }

      const data = await response.json();
      setEntries(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          mood,
          createdAt: selectedDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create entry');
      }

      await fetchEntries();
      setTitle('');
      setContent('');
      setMood('neutral');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getEntriesForDate = (date: Date) => {
    return entries.filter((entry) => {
      const entryDate = new Date(entry.createdAt);
      return (
        entryDate.getDate() === date.getDate() &&
        entryDate.getMonth() === date.getMonth() &&
        entryDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const selectedEntries = getEntriesForDate(selectedDate);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Journal Entries</h2>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            className="w-full bg-card p-4 rounded-lg shadow-lg"
            tileContent={({ date }) => {
              const dayEntries = getEntriesForDate(date);
              return dayEntries.length > 0 ? (
                <div className="w-2 h-2 bg-primary rounded-full mx-auto mt-1" />
              ) : null;
            }}
          />

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 rounded-md border bg-background"
                required
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-1">
                Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-2 rounded-md border bg-background h-32"
                required
              />
            </div>

            <div>
              <label htmlFor="mood" className="block text-sm font-medium mb-1">
                Mood
              </label>
              <select
                id="mood"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full p-2 rounded-md border bg-background"
              >
                <option value="happy">Happy</option>
                <option value="sad">Sad</option>
                <option value="neutral">Neutral</option>
                <option value="anxious">Anxious</option>
                <option value="excited">Excited</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Save Entry
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">
            Entries for {selectedDate.toLocaleDateString('en-IN')}
          </h2>
          {error && (
            <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md mb-4">
              {error}
            </div>
          )}
          {loading ? (
            <p>Loading...</p>
          ) : selectedEntries.length > 0 ? (
            <div className="space-y-4">
              {selectedEntries.map((entry) => (
                <div
                  key={entry._id}
                  className="p-4 bg-card rounded-lg shadow-lg space-y-2"
                >
                  <h3 className="text-lg font-semibold">{entry.title}</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {entry.content}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Mood: {entry.mood}</span>
                    <span>
                      {new Date(entry.createdAt).toLocaleTimeString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No entries for this date</p>
          )}
        </div>
      </div>
    </div>
  );
} 