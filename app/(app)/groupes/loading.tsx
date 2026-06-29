export default function GroupesLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton mt-2 h-11 w-36 rounded-xl" />
      </div>
      {[...Array(2)].map((_, i) => (
        <div key={i} className="skeleton h-28 rounded-[20px]" />
      ))}
      <div className="skeleton h-48 rounded-[20px]" />
    </div>
  );
}
