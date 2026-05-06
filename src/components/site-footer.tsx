import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col items-start justify-between gap-6 px-6 py-10 md:flex-row md:items-center md:px-10">
        <div className="flex items-center gap-4">
          <Image
            src="/logos/buildvision-logo-vertical.png"
            alt="BuildVision"
            width={64}
            height={64}
            className="h-12 w-auto"
          />
          <div>
            <p className="text-detail font-bold text-neutral-800">
              BuildVision Equipment Data Viewer
            </p>
            <p className="text-micro text-neutral-500">
              Visualizing extracted HVAC/MEP equipment schedules.
            </p>
          </div>
        </div>
        <p className="text-micro text-neutral-400">
          Built with Next.js · Inter typography · BuildVision design system
        </p>
      </div>
    </footer>
  );
}
