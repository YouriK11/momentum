export default function HomeLoading() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col gap-7">
        <div>
          <div className="skeleton h-3 w-24 rounded" />
          <div className="skeleton mt-2 h-9 w-48 rounded-xl" />
        </div>
        {/* Progress card */}
        <div className="skeleton h-44 rounded-[24px]" />
        {/* Habits */}
        <div className="flex flex-col gap-2.5">
          <div className="skeleton h-3 w-28 rounded" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-2xl" />
          ))}
        </div>
      </div>
      {/* Activity feed */}
      <div className="skeleton h-48 rounded-[24px]" />
    </div>
  );
}
