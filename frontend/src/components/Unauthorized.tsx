export const Unauthorized = ({ pageName }: { pageName: string }) => {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="rounded-full bg-rose-100 text-rose-700 p-5 mb-6">
        <span className="text-3xl">🚫</span>
      </div>
      <h1 className="text-2xl font-extrabold text-slate-900 mb-3">Access Restricted</h1>
      <p className="max-w-xl text-sm text-slate-500">
        You don’t have permission to access the {pageName} page. If you believe this is incorrect,
        please contact your school administrator.
      </p>
    </div>
  );
};
