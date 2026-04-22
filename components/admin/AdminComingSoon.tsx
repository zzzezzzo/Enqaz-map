export default function AdminComingSoon({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">
        This section is not implemented yet. Use{" "}
        <span className="font-medium text-slate-800">Workshops Management</span> and{" "}
        <span className="font-medium text-slate-800">Services &amp; Categories</span> from the sidebar for
        admin actions that are available now.
      </p>
    </div>
  );
}
