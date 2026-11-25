export default function DeleteModal({
  deleteTarget,
  deleting,
  onCancel,
  onConfirm,
}) {
  if (!deleteTarget) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-[1px] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#E8ECEC] space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Delete Patient Record
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Are you sure you want to permanently remove{" "}
          <span className="font-semibold text-slate-900">
            {deleteTarget.name}
          </span>{" "}
          from the patient database?
        </p>
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50 cursor-pointer"
          >
            {deleting ? "Deleting..." : "Confirm Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
