export default function GroupDetailLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton mt-2 h-11 w-48 rounded-xl" />
      </div>
      <div className="skeleton h-64 rounded-[20px]" />
      <div className="skeleton h-32 rounded-[20px]" />
    </div>
  );
}
