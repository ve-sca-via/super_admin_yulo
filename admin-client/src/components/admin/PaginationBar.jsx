import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PaginationBar({
  page,
  pages,
  total,
  onPageChange,
  itemLabel = "items",
}) {
  if (!pages || pages <= 1) {
    return total ? (
      <p className="px-1 text-xs text-muted-foreground">
        {total} {itemLabel}
      </p>
    ) : null;
  }

  return (
    <div className="flex items-center justify-between px-1">
      <p className="text-xs text-muted-foreground">
        Page {page} of {pages} · {total} {itemLabel}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="grid h-8 w-8 place-items-center rounded-lg border border-brand-cream bg-white text-[#5a453a] disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          className="grid h-8 w-8 place-items-center rounded-lg border border-brand-cream bg-white text-[#5a453a] disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
