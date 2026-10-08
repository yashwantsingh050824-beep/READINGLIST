import { useState, useEffect } from 'react';
import { BookPlus, Library, BookOpen, CheckCircle2, Bookmark, Trash2, AlertCircle } from 'lucide-react';

type ReadingStatus = 'want-to-read' | 'reading' | 'finished';

interface Book {
  id: string;
  title: string;
  status: ReadingStatus;
}

const STATUS_META: Record<ReadingStatus, { label: string; icon: typeof Bookmark; color: string; badge: string }> = {
  'want-to-read': {
    label: 'Want to Read',
    icon: Bookmark,
    color: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  'reading': {
    label: 'Reading',
    icon: BookOpen,
    color: 'text-sky-600',
    badge: 'bg-sky-100 text-sky-700 border-sky-200',
  },
  'finished': {
    label: 'Finished',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
};

const ALL_STATUSES: ReadingStatus[] = ['want-to-read', 'reading', 'finished'];

type FilterOption = 'all' | ReadingStatus;

const STORAGE_KEY = 'reading-list-books';

function loadBooks(): Book[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (b) => b && typeof b.id === 'string' && typeof b.title === 'string' && ALL_STATUSES.includes(b.status)
    );
  } catch {
    return [];
  }
}

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<ReadingStatus>('want-to-read');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    setBooks(loadBooks());
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  }, [books]);

  const addBook = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    if (trimmed.length > 60) {
      setError('Book title must be 60 characters or fewer.');
      return;
    }
    const normalized = trimmed.replace(/\s+/g, ' ').toLowerCase();
    const exists = books.some((b) => b.title.replace(/\s+/g, ' ').toLowerCase() === normalized);
    if (exists) {
      setError('This book is already in your reading list.');
      return;
    }
    setError('');
    setBooks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: trimmed, status },
    ]);
    setTitle('');
    setStatus('want-to-read');
  };

  const changeStatus = (id: string, newStatus: ReadingStatus) => {
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
  };

  const removeBook = (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const counts = {
    all: books.length,
    'want-to-read': books.filter((b) => b.status === 'want-to-read').length,
    'reading': books.filter((b) => b.status === 'reading').length,
    'finished': books.filter((b) => b.status === 'finished').length,
  };

  const filteredBooks = filter === 'all' ? books : books.filter((b) => b.status === filter);

  const filterTabs: { value: FilterOption; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'want-to-read', label: 'Want to Read' },
    { value: 'reading', label: 'Reading' },
    { value: 'finished', label: 'Finished' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="mb-8 text-center sm:mb-10">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-800 text-white shadow-sm">
            <Library className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
            Student Reading List
          </h1>
          <p className="mt-1.5 text-sm text-stone-500 sm:text-base">
            Track your books and reading progress
          </p>
        </header>

        {/* Add Book Form */}
        <form
          onSubmit={addBook}
          className="mb-6 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="book-title" className="mb-1.5 block text-sm font-medium text-stone-700">
                Book Title
              </label>
              <input
                id="book-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter book title..."
                className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
              />
            </div>
            <div className="sm:w-44">
              <label htmlFor="book-status" className="mb-1.5 block text-sm font-medium text-stone-700">
                Status
              </label>
              <select
                id="book-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ReadingStatus)}
                className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s].label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={!title.trim()}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-stone-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-300 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:justify-start"
          >
            <BookPlus className="h-4.5 w-4.5" />
            Add Book
          </button>
          {error && (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
        </form>

        {/* Summary Section */}
        {books.length > 0 && (
          <div className="mb-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-stone-200 bg-white p-3 text-center shadow-sm sm:p-4">
              <p className="text-lg font-bold text-stone-900 sm:text-2xl">{counts.all}</p>
              <p className="mt-0.5 text-xs font-medium text-stone-500 sm:text-sm">Total Books</p>
            </div>
            <div className="rounded-xl border border-stone-200 bg-white p-3 text-center shadow-sm sm:p-4">
              <p className="text-lg font-bold text-sky-600 sm:text-2xl">{counts.reading}</p>
              <p className="mt-0.5 text-xs font-medium text-stone-500 sm:text-sm">Currently Reading</p>
            </div>
            <div className="rounded-xl border border-stone-200 bg-white p-3 text-center shadow-sm sm:p-4">
              <p className="text-lg font-bold text-emerald-600 sm:text-2xl">{counts.finished}</p>
              <p className="mt-0.5 text-xs font-medium text-stone-500 sm:text-sm">Finished</p>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        {books.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {filterTabs.map((tab) => {
              const active = filter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    active
                      ? 'bg-stone-800 text-white shadow-sm'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-1.5 text-xs ${active ? 'text-stone-300' : 'text-stone-400'}`}>
                    {counts[tab.value]}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Book List / Empty State */}
        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
              <Library className="h-8 w-8 text-stone-400" />
            </div>
            <p className="text-base font-medium text-stone-700">
              Your reading list is empty. Add your first book.
            </p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
            <p className="text-sm text-stone-500">
              No books match this filter.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filteredBooks.map((book) => {
              const meta = STATUS_META[book.status];
              const StatusIcon = meta.icon;
              return (
                <li
                  key={book.id}
                  className="group rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="flex-1 text-sm font-semibold leading-snug text-stone-900">
                      {book.title}
                    </h3>
                    <button
                      onClick={() => removeBook(book.id)}
                      aria-label="Remove book"
                      className="shrink-0 rounded-md p-1 text-stone-300 transition hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${meta.badge}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {meta.label}
                    </span>
                    <select
                      value={book.status}
                      onChange={(e) => changeStatus(book.id, e.target.value as ReadingStatus)}
                      className="rounded-md border border-stone-200 bg-white px-2 py-1 text-xs font-medium text-stone-600 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-300"
                    >
                      {ALL_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_META[s].label}
                        </option>
                      ))}
                    </select>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <footer className="mt-10 text-center text-xs text-stone-400">
          Your reading list is saved on this device.
        </footer>
      </div>
    </div>
  );
}
