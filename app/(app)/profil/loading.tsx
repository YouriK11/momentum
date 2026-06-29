export default function ProfilLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton mt-2 h-11 w-36 rounded-xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="skeleton h-72 rounded-[20px]" />
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-5 lg:content-start">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-[20px]" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-[20px]" />
          ))}
        </div>
      </div>
    </div>
  );
}
