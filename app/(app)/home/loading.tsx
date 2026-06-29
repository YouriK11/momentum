export default function HomeLoading() {
  return (
    <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
      <div className="flex flex-col gap-6">
        <div>
          <div className="skeleton h-3 w-24 rounded" />
          <div className="skeleton mt-2 h-11 w-52 rounded-xl" />
        </div>
        <div className="skeleton h-52 rounded-[20px]" />
        <div className="flex flex-col gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-[18px]" />
          ))}
        </div>
      </div>
      <div className="hidden lg:flex lg:flex-col lg:gap-8">
        <div className="skeleton h-36 rounded-[20px]" />
        <div className="skeleton h-44 rounded-[20px]" />
        <div className="skeleton h-24 rounded-[20px]" />
      </div>
    </div>
  );
}
