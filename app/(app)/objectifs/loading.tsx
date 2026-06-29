export default function ObjectifsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton mt-2 h-11 w-40 rounded-xl" />
      </div>
      <div className="skeleton h-12 rounded-[14px]" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="skeleton h-28 rounded-[20px]" />
      ))}
    </div>
  );
}
