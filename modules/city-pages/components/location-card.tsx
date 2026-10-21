import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { verticalPath } from "@/lib/vertical-path";

type LocationCardProps = {
  city: string;
  vertical: string;
  location: {
    name: string;
    slug: string;
    spaceCount: number;
  };
};

export function LocationCard({ city, vertical, location }: LocationCardProps) {
  return (
    <Link
      href={`/${verticalPath(vertical)}/${city}/${location.slug}`}
      className="group rounded-[1.4rem] border border-slate-200/80 bg-white p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(15,23,42,0.12)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-sm text-slate-500">
            <MapPin className="h-4 w-4" />
            Popular location
          </div>
          <h3 className="mt-4 text-xl font-semibold text-ink">{location.name}</h3>
          <p className="mt-2 text-sm text-muted">{location.spaceCount} spaces available</p>
        </div>
        <span className="rounded-full bg-slate-100 p-2 text-slate-700 transition group-hover:bg-slate-950 group-hover:text-white">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
