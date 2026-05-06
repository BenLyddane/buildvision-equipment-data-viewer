import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-detail font-bold uppercase tracking-wide text-bv-blue-400">
        404
      </p>
      <h1 className="mt-2 text-h4 font-bold text-neutral-900">
        Not found
      </h1>
      <p className="mt-2 max-w-md text-body-sm text-neutral-600">
        We couldn’t find that resource. It may have been moved or doesn’t exist
        in this dataset.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-bv-blue-400 px-4 py-2 text-detail font-bold text-white hover:bg-bv-blue-300"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
