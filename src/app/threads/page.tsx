import ThreadList from '@/components/threads/ThreadList';

export default function ThreadsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Conversation Threads</h1>
        <p className="text-gray-600 mt-1">
          Manage your conversation threads and switch agent models while preserving context
        </p>
      </div>

      <ThreadList />
    </div>
  );
}
