// SkeletonLoader.jsx - grey placeholder while data is loading from API

const SkeletonLoader = ({ count = 4, type = 'card' }) => {
  if (type === 'table') {
    return (
      <div className="animate-pulse space-y-3" aria-label="Loading content">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse"
      aria-label="Loading content"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card">
          <div className="h-48 bg-gray-200" />
          <div className="p-4 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
