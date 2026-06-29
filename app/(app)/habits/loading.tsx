export default function HabitsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton mt-2 h-11 w-44 rounded-xl" />
      </div>
      <div className="skeleton h-14 rounded-[14px]" />
      <div className="flex flex-col gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-[18px]" />
        ))}
      </div>
    </div>
  );
}
