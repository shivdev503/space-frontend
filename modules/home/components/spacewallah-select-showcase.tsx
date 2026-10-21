import Image from "next/image";
import Link from "next/link";

import { cn } from "@/utils/cn";

/** Giggster Select–style palette (exact reference). */
const GOLD = "#D4A056";
const CTA_GREEN = "#28A745";

const AVATARS = {
  consultant: {
    src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    alt: "SpaceWallah Select expert avatar",
  },
  user: {
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    alt: "Customer avatar",
  },
};

type ChatLine = {
  id: string;
  side: "left" | "right";
  name: string;
  time: string;
  body: string;
  images?: { src: string; alt: string; layout?: "single" | "pair" }[];
};

const MESSAGES: ChatLine[] = [
  {
    id: "m1",
    side: "left",
    name: "Aditi",
    time: "2:21 PM",
    body:
      "Hi! I’m on the SpaceWallah Select desk. Tell me your city, team size, and budget. I’ll shortlist verified spaces and in your budget before we book any tours.",
  },
  {
    id: "m2",
    side: "right",
    name: "Vikram",
    time: "2:22 PM",
    body:
      "We need 12 seats in gurgaon, 2 year lease term, and a mix of meeting rooms. Prefer golf course road or cyber city.",
  },
  {
    id: "m3",
    side: "left",
    name: "Aditi",
    time: "2:23 PM",
    body:
      "Here are two premium options that match your requirement. both are premium and recently toured.",
    images: [
      {
        src: "https://img.spacewallah.com/images/latest_images_2024/4800c2456ed218d7deafafb9cfd175be81653008.webp",
        alt: "Premium workspace — bright interiors and natural light",
        layout: "pair",
      },
      {
        src: "https://img.spacewallah.com/images/latest_images_2024/0660c99f666f081ad12f9d56bb1f2c2c6809e36b.webp",
        alt: "Premium workspace — lounge and collaboration area",
        layout: "pair",
      },
    ],
  },
  {
    id: "m4",
    side: "right",
    name: "Vikram",
    time: "2:25 PM",
    body: "The corner suite looks strong. Can we compare all‑in pricing vs. the second option?",
  },
  {
    id: "m5",
    side: "left",
    name: "Aditi",
    time: "2:27 PM",
    body:
      "Yes I’ll send a side‑by‑side with rent, CAM, and fit‑out assumptions. We can also line up a visit to the space this week.",
    images: [
      {
        src: "https://img.spacewallah.com/images/latest_images_2024/7ede6a8950fc2e17e34bb48db5fd5d64ff424c99.webp",
        alt: "Option A — open desk and meeting zone",
        layout: "pair",
      },
      {
        src: "https://img.spacewallah.com/images/latest_images_2024/b86e6db8044e30873b4004da6728207cfcc556a5.webp",
        alt: "Option B — private office floor",
        layout: "pair",
      },
    ],
  },
];

export function SpaceWallahSelectShowcase() {
  return (
    <div className="mx-auto w-full max-w-[48rem]">
      {/* Wordmark */}
      <div className="text-center">
        <p className="font-display text-2xl tracking-tight sm:text-3xl md:text-[1.85rem]">
          <span className="font-bold text-white">SpaceWallah </span>
          <span className="font-normal" style={{ color: GOLD }}>
            select
          </span>
        </p>
        <p className="mx-auto mt-5 max-w-xl text-center text-sm leading-relaxed text-white/88 sm:text-base">
          Our team helps you find off‑market quality inventory, compare operators, and negotiate stronger
          rates whether you need coworking, a private office, or a virtual address across India.
        </p>
      </div>

      {/* Chat */}
      <div className="mt-12 flex flex-col gap-6 sm:mt-14 sm:gap-7">
        {MESSAGES.map((msg) => (
          <ChatRow key={msg.id} message={msg} />
        ))}
      </div>

      {/* Dual CTA */}
      <div className="mt-14 border-t border-white/15 pt-12 sm:mt-16 sm:pt-14">
        <div className="grid gap-10 md:grid-cols-2 md:gap-0 md:divide-x md:divide-white/20">
          <div className="flex flex-col items-center px-2 text-center md:pr-8 lg:pr-10">
            <h3 className="max-w-[14rem] text-base font-bold leading-snug text-white sm:text-lg">
              Check out our most unique locations
            </h3>
            <Link
              href="/coworking"
              className="mt-5 inline-flex items-center justify-center rounded-lg px-6 py-3.5 text-sm font-semibold text-white transition hover:brightness-110 sm:px-8 sm:text-base"
              style={{ backgroundColor: CTA_GREEN }}
            >
              Explore Select Listings
            </Link>
          </div>
          <div className="flex flex-col items-center px-2 text-center md:pl-8 lg:pl-10">
            <h3 className="max-w-[14rem] text-base font-bold leading-snug text-white sm:text-lg">
              Tell us what you&apos;re looking for
            </h3>
            <Link
              href="#lead-form"
              className="mt-5 inline-flex items-center justify-center rounded-lg border-2 px-6 py-3.5 text-sm font-semibold transition hover:bg-white/5 sm:px-8 sm:text-base"
              style={{ borderColor: GOLD, color: GOLD }}
            >
              Connect with an Expert
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatRow({ message }: { message: ChatLine }) {
  const isLeft = message.side === "left";
  const avatar = isLeft ? AVATARS.consultant : AVATARS.user;

  return (
    <div
      className={cn(
        "flex items-end gap-3",
        isLeft ? "flex-row self-start" : "flex-row-reverse self-end",
      )}
    >
      <div
        className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-zinc-700 ring-2 ring-black sm:h-10 sm:w-10"
      >
        <Image
          src={avatar.src}
          alt={avatar.alt}
          fill
          className="object-cover"
          sizes="40px"
        />
      </div>
      <div
        className="max-w-[min(100%,22rem)] rounded-2xl border border-white/[0.12] bg-zinc-900/85 px-4 py-3 shadow-lg backdrop-blur-sm sm:max-w-md sm:px-4 sm:py-3.5"
      >
        <p className="text-[0.7rem] text-white/55 sm:text-xs">
          <span className="font-medium text-white/90">{message.name}</span>
          <span className="mx-1.5">·</span>
          <span>{message.time}</span>
        </p>
        <p className="mt-2 text-sm leading-relaxed text-white/95 sm:text-[0.9375rem]">{message.body}</p>
        {message.images?.length ? (
          <div
            className={cn(
              "mt-3 overflow-hidden rounded-xl",
              message.images.length > 1 ? "grid grid-cols-2 gap-2" : "",
            )}
          >
            {message.images.map((img, imgIndex) => (
              <div
                key={`${message.id}-img-${imgIndex}`}
                className={cn(
                  "relative w-full overflow-hidden rounded-lg bg-zinc-800",
                  img.layout === "single" ? "aspect-[16/10]" : "aspect-[4/3]",
                )}
              >
                <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="400px" />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
