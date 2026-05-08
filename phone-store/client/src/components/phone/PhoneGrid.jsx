import PhoneCard from './PhoneCard';

export default function PhoneGrid({ phones, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-t-xl" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!phones?.length) {
    return <p className="text-center text-gray-400 py-16">Không tìm thấy sản phẩm nào.</p>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {phones.map((phone) => (
        <PhoneCard key={phone._id} phone={phone} />
      ))}
    </div>
  );
}
