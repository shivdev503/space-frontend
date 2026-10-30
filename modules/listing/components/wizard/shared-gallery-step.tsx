"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/utils/cn";
import type { ListingModel } from "@/types/listing.model";

import { MAX_IMAGES, MIN_IMAGES } from "./constants";

type Props = {
  images: ListingModel.ListingImage[];
  onChange: (next: ListingModel.ListingImage[]) => void;
  disabled?: boolean;
};

/**
 * Shared gallery step. Uploads each selected file to `/api/admin/upload` and
 * stores the returned `{ id, s3_link }` pair as an in-memory image slot. No
 * listing is saved at this point — the full `images[]` array is attached to
 * the single POST that happens on the review step.
 */
export function SharedGalleryStep({ images, onChange, disabled }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFiles(fileList: FileList) {
    if (!fileList.length) return;
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setUploadError(`You can upload at most ${MAX_IMAGES} images.`);
      return;
    }

    const selected = Array.from(fileList).slice(0, remaining);
    setUploadError(null);
    setUploading(true);

    const startOrder = images.length + 1;
    const next = [...images];

    for (let i = 0; i < selected.length; i++) {
      const file = selected[i];
      if (!file) continue;

      try {
        const fd = new FormData();
        fd.append("file", file, file.name);

        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const json = (await res.json().catch(() => null)) as
          | ListingModel.ApiEnvelope<ListingModel.UploadedImage[]>
          | { message?: string; session_expired?: boolean }
          | null;

        if (!res.ok) {
          const message =
            (json as { message?: string } | null)?.message ||
            (res.status === 401
              ? "Please login again before uploading images."
              : `Upload failed (HTTP ${res.status}).`);
          setUploadError(message);
          // Backend flagged the session as stale — bounce the user to the
          // login screen so they can mint a fresh token.
          if (
            res.status === 401 &&
            (json as { session_expired?: boolean } | null)?.session_expired
          ) {
            router.replace("/list-your-space?reason=session-expired");
          }
          break;
        }

        const uploaded = (json as ListingModel.ApiEnvelope<ListingModel.UploadedImage[]>)?.data?.[0];
        if (!uploaded) {
          setUploadError("Upload succeeded but upstream did not return an image id.");
          break;
        }

        next.push({
          image: uploaded.id,
          url: uploaded.s3_link,
          order: startOrder + i,
        });
      } catch (e) {
        setUploadError(e instanceof Error ? e.message : "Upload failed.");
        break;
      }
    }

    onChange(next);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeAt(index: number) {
    const next = images
      .filter((_, i) => i !== index)
      .map((img, i) => ({ ...img, order: i + 1 }));
    onChange(next);
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    const [moved] = next.splice(index, 1);
    if (!moved) return;
    next.splice(target, 0, moved);
    onChange(next.map((img, i) => ({ ...img, order: i + 1 })));
  }

  const disableAdd = disabled || uploading || images.length >= MAX_IMAGES;
  const countClassName =
    images.length < MIN_IMAGES
      ? "text-amber-700"
      : images.length > MAX_IMAGES
        ? "text-red-700"
        : "text-emerald-700";

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink/70">
          Upload <span className="font-semibold">{MIN_IMAGES}–{MAX_IMAGES}</span> photos of the
          space. The first image is the cover.
        </p>
        <p className={cn("text-sm font-semibold", countClassName)}>
          {images.length} / {MAX_IMAGES} uploaded
        </p>
      </div>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disableAdd}
        className={cn(
          "flex h-32 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/20 bg-cream/60 px-4 text-sm font-medium text-ink/80 transition hover:border-ink/40 hover:bg-cream",
          "disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        <span className="text-lg font-semibold text-ink">
          {uploading ? (
            <span className="inline-flex items-center gap-2">
              <Spinner /> Uploading…
            </span>
          ) : (
            "+ Add photos"
          )}
        </span>
        <span className="text-xs text-ink/60">
          JPG, PNG or WebP · up to {MAX_IMAGES - images.length} more
        </span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) void handleFiles(e.target.files);
        }}
      />

      {uploadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {uploadError}
        </div>
      ) : null}

      {images.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {images.map((img, index) => (
            <div
              key={`${img.image}-${index}`}
              className="group relative overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={`Upload ${index + 1}`}
                className="aspect-[4/3] w-full object-cover"
              />
              <span className="absolute left-2 top-2 rounded-full bg-ink px-2 py-0.5 text-xs font-semibold text-white">
                {index + 1}
              </span>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 opacity-0 transition group-hover:opacity-100">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === images.length - 1}
                    className="rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ↓
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white transition hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {images.length > 0 && images.length < MIN_IMAGES ? (
        <p className="text-sm text-amber-700">
          Upload at least {MIN_IMAGES - images.length} more photo
          {MIN_IMAGES - images.length === 1 ? "" : "s"} to continue.
        </p>
      ) : null}
    </div>
  );
}

export function validateGallery(images: ListingModel.ListingImage[]): string | null {
  if (images.length < MIN_IMAGES) {
    return `Please upload at least ${MIN_IMAGES} photos before saving.`;
  }
  if (images.length > MAX_IMAGES) {
    return `Please remove some photos — max ${MAX_IMAGES} allowed.`;
  }
  return null;
}
