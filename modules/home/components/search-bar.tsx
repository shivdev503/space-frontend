"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Building2, MapPin, Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  loadCoworkingWorkspaceSearchHits,
  type CoworkingSearchHit,
} from "@/services/coworking-api";
import { loadManagedOfficeSearchHits, type ManagedOfficeSearchHit } from "@/services/managed-office-api";
import { loadPgSearchHits, type PgSearchHit } from "@/services/pg-api";
import { getCatalogCityIdBySlug } from "@/services/catalog-city-id";
import { SearchOption } from "@/types";
import { cn } from "@/utils/cn";
import { verticalPath } from "@/lib/vertical-path";

type SearchBarProps = {
  locations: SearchOption[];
  teamSizes: SearchOption[];
  budgets: SearchOption[];
  className?: string;
  submitLabel?: string;
  basePath?: string;
  variant?: "default" | "homepage" | "header";
  onExpandedChange?: (expanded: boolean) => void;
};

type SharedSearchState = {
  selectedLocation: string;
  locationInput: string;
  selectedSpaceType: "coworking" | "office-space" | "virtual-office" | "coliving";
  selectedSpaceName: string;
  spaceNameInput: string;
  selectedSpaceSlug: string;
};

const SEARCH_SYNC_EVENT = "spacewallah:search-sync";

type SearchSpaceType = SharedSearchState["selectedSpaceType"];

/** Vertical of the current page, so the search defaults to it (coworking elsewhere). */
function spaceTypeFromPath(pathname: string | null): SearchSpaceType | null {
  const first = (pathname ?? "").split("/").filter(Boolean)[0];
  switch (first) {
    case "coworking":
    case "brand":
      return "coworking";
    case "coliving":
      return "coliving";
    case "virtual-office":
      return "virtual-office";
    case "managed-office":
    case "office-space":
      return "office-space";
    default:
      return null;
  }
}

function resolveLocationSlug(input: string, locations: SearchOption[]) {
  const normalized = input.trim().toLowerCase();
  const match = locations.find(
    (location) =>
      location.value.toLowerCase() === normalized ||
      location.label.toLowerCase() === normalized,
  );

  return match?.value ?? normalized.replace(/\s+/g, "-");
}

export function SearchBar({
  locations,
  teamSizes,
  budgets,
  className,
  submitLabel = "Search Spaces",
  basePath = "/coworking",
  variant = "default",
  onExpandedChange,
}: SearchBarProps) {
  const router = useRouter();
  const pageSpaceType = spaceTypeFromPath(usePathname());
  const normalizedTeamSizes = teamSizes[0]?.value
    ? [{ label: "Any team size", value: "" }, ...teamSizes]
    : teamSizes;
  const normalizedBudgets = budgets[0]?.value
    ? [{ label: "Any budget", value: "" }, ...budgets]
    : budgets;
  const [location, setLocation] = useState("");
  const [teamSize, setTeamSize] = useState(normalizedTeamSizes[0]?.value ?? "");
  const [budget, setBudget] = useState(normalizedBudgets[0]?.value ?? "");
  const [activeField, setActiveField] = useState<
    "location" | "spaceType" | "spaceName" | null
  >(null);
  const [selectedLocation, setSelectedLocation] = useState(locations[0]?.label ?? "");
  const [locationInput, setLocationInput] = useState(locations[0]?.label ?? "");
  const [selectedSpaceType, setSelectedSpaceType] = useState<SearchSpaceType>(pageSpaceType ?? "coworking");
  const [selectedSpaceName, setSelectedSpaceName] = useState("");
  const [spaceNameInput, setSpaceNameInput] = useState("");
  /** Coworking detail slug when user picks a row from API (or mock) list. */
  const [selectedSpaceSlug, setSelectedSpaceSlug] = useState("");
  const [coworkingHits, setCoworkingHits] = useState<CoworkingSearchHit[]>([]);
  const [coworkingHitsLoading, setCoworkingHitsLoading] = useState(false);
  const [officeHits, setOfficeHits] = useState<ManagedOfficeSearchHit[]>([]);
  const [officeHitsLoading, setOfficeHitsLoading] = useState(false);
  const [pgHits, setPgHits] = useState<PgSearchHit[]>([]);
  const [pgHitsLoading, setPgHitsLoading] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const pillShellRef = useRef<HTMLDivElement>(null);
  const locationFieldRef = useRef<HTMLDivElement>(null);
  const spaceTypeFieldRef = useRef<HTMLButtonElement>(null);
  const spaceNameFieldRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [homeSearchPortalReady, setHomeSearchPortalReady] = useState(false);
  const isExpanded = activeField !== null;
  const showHomeMobileSheet = variant === "homepage";

  useEffect(() => {
    setHomeSearchPortalReady(true);
  }, []);

  const quickOptions = useMemo(() => locations.slice(0, 5), [locations]);
  const workspaceTypes = [
    { id: "coworking", label: "Coworking Space" },
    { id: "office-space", label: "Managed Office" },
    { id: "virtual-office", label: "Virtual Office" },
    { id: "coliving", label: "Coliving Space" },
  ] as const;
  const spaceNamesByType: Record<
    "coworking" | "office-space" | "virtual-office" | "coliving",
    string[]
  > = {
    coworking: [
      "Altura One BKC",
      "Capital Works Connaught Place",
      "Skyline Desk HITEC City",
      "Harbor Desk Anna Salai",
    ],
    "office-space": [
      "Northlight Business Centre",
      "Orbital Suites Noida One",
      "The Quarter 5th Avenue",
      "Harbor Suites Nariman Point",
    ],
    "virtual-office": [
      "Addressly Koramangala",
      "Registry Lane Connaught Place",
      "Deskline Business Address Pune",
      "Signature Address Madhapur",
    ],
    coliving: [
      "UrbanNest DLF Phase 3 Coliving",
      "Koramangala Commons Coliving",
      "Bandra Living Coliving",
      "Gachibowli Nest Coliving",
    ],
  };
  const selectedTypeLabel =
    workspaceTypes.find((item) => item.id === selectedSpaceType)?.label ??
    "Coworking Space";

  const resolvedLocationSlug = useMemo(() => {
    const input = (locationInput.trim() || selectedLocation || "").trim();
    if (!input) return "";
    return resolveLocationSlug(input, locations);
  }, [locationInput, selectedLocation, locations]);

  const catalogCityId = useMemo(
    () => (resolvedLocationSlug ? getCatalogCityIdBySlug(resolvedLocationSlug) : null),
    [resolvedLocationSlug],
  );

  /** API `city` param uses display name (e.g. Gurugram), not URL slug. */
  const resolvedCityLabel = useMemo(() => {
    const input = (locationInput.trim() || selectedLocation || "").trim();
    if (!input) return "";
    const normalized = input.toLowerCase();
    const match = locations.find(
      (loc) =>
        loc.label.toLowerCase() === normalized || loc.value.toLowerCase() === normalized,
    );
    return match?.label ?? input;
  }, [locationInput, selectedLocation, locations]);

  const filteredLocations = useMemo(() => {
    const query = locationInput.trim().toLowerCase();
    if (!query || query === selectedLocation.toLowerCase()) return locations;

    return locations.filter((option) =>
      option.label.toLowerCase().includes(query),
    );
  }, [locationInput, locations, selectedLocation]);
  const filteredStaticSpaceNames = useMemo(() => {
    const suggestions = spaceNamesByType[selectedSpaceType];
    const query = spaceNameInput.trim().toLowerCase();
    if (!query || query === selectedSpaceName.toLowerCase()) return suggestions;

    return suggestions.filter((name) => name.toLowerCase().includes(query));
  }, [spaceNameInput, selectedSpaceName, selectedSpaceType]);

  useEffect(() => {
    if (activeField !== "spaceName" || selectedSpaceType !== "coworking") {
      return;
    }
    if (!catalogCityId) {
      setCoworkingHits([]);
      setCoworkingHitsLoading(false);
      return;
    }

    let cancelled = false;
    const name = spaceNameInput.trim();
    const delay = name.length > 0 ? 320 : 0;

    setCoworkingHitsLoading(true);
    const timer = window.setTimeout(() => {
      loadCoworkingWorkspaceSearchHits(catalogCityId, {
        name: name || undefined,
        limit: 50,
      })
        .then((hits) => {
          if (!cancelled) setCoworkingHits(hits);
        })
        .catch(() => {
          if (!cancelled) setCoworkingHits([]);
        })
        .finally(() => {
          if (!cancelled) setCoworkingHitsLoading(false);
        });
    }, delay);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [activeField, selectedSpaceType, catalogCityId, spaceNameInput]);

  useEffect(() => {
    if (activeField !== "spaceName" || selectedSpaceType !== "office-space") {
      return;
    }
    if (!resolvedLocationSlug.trim()) {
      setOfficeHits([]);
      setOfficeHitsLoading(false);
      return;
    }

    let cancelled = false;
    const name = spaceNameInput.trim();
    const delay = name.length > 0 ? 320 : 0;

    setOfficeHitsLoading(true);
    const timer = window.setTimeout(() => {
      loadManagedOfficeSearchHits(catalogCityId, {
        name: name || undefined,
        limit: 50,
      })
        .then((hits) => {
          if (!cancelled) setOfficeHits(hits);
        })
        .catch(() => {
          if (!cancelled) setOfficeHits([]);
        })
        .finally(() => {
          if (!cancelled) setOfficeHitsLoading(false);
        });
    }, delay);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [activeField, selectedSpaceType, catalogCityId, resolvedLocationSlug, spaceNameInput]);

  useEffect(() => {
    if (activeField !== "spaceName" || selectedSpaceType !== "coliving") {
      return;
    }
    if (!resolvedLocationSlug.trim()) {
      setPgHits([]);
      setPgHitsLoading(false);
      return;
    }

    let cancelled = false;
    const name = spaceNameInput.trim();
    const delay = name.length > 0 ? 320 : 0;

    setPgHitsLoading(true);
    const timer = window.setTimeout(() => {
      loadPgSearchHits(resolvedLocationSlug, resolvedCityLabel, {
        name: name || undefined,
        limit: 50,
      })
        .then((hits) => {
          if (!cancelled) setPgHits(hits);
        })
        .catch(() => {
          if (!cancelled) setPgHits([]);
        })
        .finally(() => {
          if (!cancelled) setPgHitsLoading(false);
        });
    }, delay);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    activeField,
    selectedSpaceType,
    resolvedLocationSlug,
    resolvedCityLabel,
    spaceNameInput,
  ]);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated || (variant !== "homepage" && variant !== "header")) return;

    function applySharedState(state: SharedSearchState) {
      setSelectedLocation(state.selectedLocation);
      setLocationInput(state.locationInput);
      setSelectedSpaceType(state.selectedSpaceType);
      setSelectedSpaceName(state.selectedSpaceName);
      setSpaceNameInput(state.spaceNameInput);
      setSelectedSpaceSlug(state.selectedSpaceSlug ?? "");
    }

    const storedState = window.sessionStorage.getItem(SEARCH_SYNC_EVENT);
    if (storedState) {
      try {
        const stored = JSON.parse(storedState) as SharedSearchState;
        // On a vertical page, that vertical wins over the type saved from another page.
        applySharedState(pageSpaceType ? { ...stored, selectedSpaceType: pageSpaceType } : stored);
      } catch {
        window.sessionStorage.removeItem(SEARCH_SYNC_EVENT);
      }
    }

    function handleSync(event: Event) {
      const customEvent = event as CustomEvent<SharedSearchState>;
      if (customEvent.detail) {
        applySharedState(customEvent.detail);
      }
    }

    window.addEventListener(SEARCH_SYNC_EVENT, handleSync as EventListener);
    return () => window.removeEventListener(SEARCH_SYNC_EVENT, handleSync as EventListener);
  }, [hasHydrated, variant]);

  // Follow the vertical when navigating between sections (the header search stays mounted).
  useEffect(() => {
    if (pageSpaceType) setSelectedSpaceType(pageSpaceType);
  }, [pageSpaceType]);

  useEffect(() => {
    if (!hasHydrated || (variant !== "homepage" && variant !== "header")) return;

    const sharedState: SharedSearchState = {
      selectedLocation,
      locationInput,
      selectedSpaceType,
      selectedSpaceName,
      spaceNameInput,
      selectedSpaceSlug,
    };

    window.sessionStorage.setItem(SEARCH_SYNC_EVENT, JSON.stringify(sharedState));
    window.dispatchEvent(new CustomEvent<SharedSearchState>(SEARCH_SYNC_EVENT, { detail: sharedState }));
  }, [
    locationInput,
    selectedLocation,
    selectedSpaceName,
    selectedSpaceSlug,
    selectedSpaceType,
    spaceNameInput,
    hasHydrated,
    variant,
  ]);

  useEffect(() => {
    onExpandedChange?.(activeField !== null);
  }, [activeField, onExpandedChange]);

  useEffect(() => {
    if (!showHomeMobileSheet || !isMobileSearchOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [showHomeMobileSheet, isMobileSearchOpen]);

  useEffect(() => {
    if (!showHomeMobileSheet || !isMobileSearchOpen) return undefined;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveField(null);
        setIsMobileSearchOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showHomeMobileSheet, isMobileSearchOpen]);

  useEffect(() => {
    function onResize() {
      if (typeof window === "undefined") return;
      if (window.matchMedia("(min-width: 768px)").matches) {
        setIsMobileSearchOpen(false);
      }
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setActiveField(null);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useLayoutEffect(() => {
    function syncDropdownToActiveField() {
      if (showHomeMobileSheet && isMobileSearchOpen) return;
      if (!activeField) return;

      const anchor = pillShellRef.current ?? formRef.current ?? containerRef.current;
      if (!anchor) return;

      const fieldMap = {
        location: locationFieldRef,
        spaceType: spaceTypeFieldRef,
        spaceName: spaceNameFieldRef,
      } as const;

      const fieldNode = fieldMap[activeField].current;
      if (!fieldNode) return;

      const anchorRect = anchor.getBoundingClientRect();
      const fieldRect = fieldNode.getBoundingClientRect();

      if (variant === "header") {
        const minWidths = {
          location: 18 * 16,
          spaceType: 16 * 16,
          spaceName: 22 * 16,
        } as const;
        const width = Math.min(
          Math.max(fieldRect.width, minWidths[activeField]),
          anchorRect.width,
        );
        const unclampedLeft = fieldRect.left - anchorRect.left;
        const maxLeft = Math.max(0, anchorRect.width - width);

        setDropdownStyle({
          left: Math.min(Math.max(0, unclampedLeft), maxLeft),
          width,
        });
        return;
      }

      if (variant === "homepage") {
        const minWidths = {
          location: 18 * 16,
          spaceType: 17 * 16,
          spaceName: 22 * 16,
        } as const;
        const width = Math.min(
          Math.max(fieldRect.width, minWidths[activeField]),
          anchorRect.width,
        );
        const unclampedLeft = fieldRect.left - anchorRect.left;
        const maxLeft = Math.max(0, anchorRect.width - width);
        setDropdownStyle({
          left: Math.min(Math.max(0, unclampedLeft), maxLeft),
          width,
        });
        return;
      }

      setDropdownStyle({
        left: fieldRect.left - anchorRect.left,
        width: fieldRect.width,
      });
    }

    function runSync() {
      syncDropdownToActiveField();
      requestAnimationFrame(syncDropdownToActiveField);
    }

    runSync();
    window.addEventListener("resize", syncDropdownToActiveField);
    return () => window.removeEventListener("resize", syncDropdownToActiveField);
  }, [activeField, showHomeMobileSheet, isMobileSearchOpen, variant]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (variant === "homepage" || variant === "header") {
      if (selectedSpaceType === "coworking" && selectedSpaceSlug.trim()) {
        router.push(`/coworking/${selectedSpaceSlug.trim()}`);
        if (variant === "homepage") {
          setIsMobileSearchOpen(false);
          setActiveField(null);
        }
        return;
      }

      if (selectedSpaceType === "office-space" && selectedSpaceSlug.trim()) {
        router.push(`/managed-office/${selectedSpaceSlug.trim()}`);
        if (variant === "homepage") {
          setIsMobileSearchOpen(false);
          setActiveField(null);
        }
        return;
      }

      if (selectedSpaceType === "coliving" && selectedSpaceSlug.trim()) {
        router.push(`/coliving/${selectedSpaceSlug.trim()}`);
        if (variant === "homepage") {
          setIsMobileSearchOpen(false);
          setActiveField(null);
        }
        return;
      }

      const query = new URLSearchParams();
      const resolvedSpaceName = spaceNameInput.trim() || selectedSpaceName;
      if (resolvedSpaceName) query.set("spaceName", resolvedSpaceName);
      const resolvedLocationInput = locationInput.trim() || selectedLocation || location;
      const locationSlug = resolvedLocationInput
        ? resolveLocationSlug(resolvedLocationInput, locations)
        : "";
      const destination = locationSlug ? `/${verticalPath(selectedSpaceType)}/${locationSlug}` : `/${verticalPath(selectedSpaceType)}`;
      router.push(`${destination}${query.toString() ? `?${query.toString()}` : ""}`);
      if (variant === "homepage") {
        setIsMobileSearchOpen(false);
        setActiveField(null);
      }
      return;
    }

    const query = new URLSearchParams();
    if (teamSize) query.set("teamSize", teamSize);
    if (budget) query.set("budget", budget);

    const locationSlug = location ? resolveLocationSlug(location, locations) : "";
    const destination = locationSlug ? `${basePath}/${locationSlug}` : basePath;
    router.push(`${destination}${query.toString() ? `?${query.toString()}` : ""}`);
  }

  if (variant === "homepage" || variant === "header") {
    const isHeaderVariant = variant === "header";
    const mobileSheetActive = showHomeMobileSheet && isMobileSearchOpen;
    const useHomeSearchPortal = showHomeMobileSheet && isMobileSearchOpen;

    function renderHomeHeaderSearchInner() {
      return (
        <>
          {showHomeMobileSheet && isMobileSearchOpen ? (
            <div className="flex w-full shrink-0 items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 py-3.5 shadow-sm backdrop-blur-md md:hidden">
              <h2 id="home-search-sheet-title" className="text-lg font-semibold tracking-tight text-slate-900">
                Find workspace
              </h2>
              <button
                type="button"
                onClick={() => {
                  setActiveField(null);
                  setIsMobileSearchOpen(false);
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 transition hover:bg-slate-50"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : null}

          <div
            className={cn(
              showHomeMobileSheet &&
                isMobileSearchOpen &&
                "min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-10 pt-4 md:min-h-0 md:flex-none md:overflow-visible md:p-0",
            )}
          >
            <motion.form
              ref={formRef}
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "relative mx-auto border border-[#ebe5d8]/85 bg-[#fefdfb] transition-[width,border-radius,padding,box-shadow] duration-300 ease-out",
                isHeaderVariant
                  ? cn(
                      "max-w-none p-1 shadow-[0_6px_18px_rgba(15,23,42,0.12)]",
                      isExpanded ? "w-[48rem] rounded-[1.35rem]" : "w-[30rem] rounded-[999px]",
                    )
                  : cn(
                      "max-w-full overflow-visible rounded-[1.35rem] p-2 shadow-[0_24px_70px_rgba(2,6,23,0.28)] md:max-w-[min(56rem,calc(100vw-2rem))] md:rounded-[999px] md:p-1.5 lg:max-w-[60rem]",
                      mobileSheetActive && "shadow-xl md:shadow-[0_24px_70px_rgba(2,6,23,0.28)]",
                    ),
              )}
            >
              <div ref={pillShellRef} className="relative">
              <div
                className={cn(
                  "grid min-w-0 grid-cols-1 gap-1.5",
                  isHeaderVariant
                    ? "md:grid-cols-[1fr_1fr_1.2fr_auto]"
                    : "md:grid-cols-[1.12fr_1.14fr_1.2fr_auto]",
                )}
              >
                <div
                  ref={locationFieldRef}
                  onClick={() => setActiveField("location")}
                  className={cn(
                    "relative rounded-[1.2rem] px-4 py-2.5 text-left transition",
                    isHeaderVariant &&
                      cn(
                        "px-2.5 transition-all duration-300",
                        isExpanded ? "rounded-[1rem] py-2" : "rounded-[999px] py-1",
                      ),
                    !isHeaderVariant &&
                      "min-w-0 px-5 py-2.5 md:rounded-l-[999px] md:rounded-r-[1.2rem]",
                    activeField === "location"
                      ? "z-[1] bg-white shadow-[0_10px_35px_rgba(15,23,42,0.1)] md:z-auto md:shadow-none md:ring-1 md:ring-slate-200/90"
                      : "hover:bg-slate-100/80",
                  )}
                >
              <span
                className={cn(
                  "block text-xs font-semibold text-slate-500",
                  isHeaderVariant && "text-[9px]",
                )}
              >
                Location
              </span>
              <input
                suppressHydrationWarning
                value={locationInput}
                onFocus={() => setActiveField("location")}
                onChange={(event) => setLocationInput(event.target.value)}
                placeholder="Search city"
                className={cn(
                  "mt-0.5 block w-full truncate border-0 bg-transparent p-0 text-lg font-semibold text-ink outline-none placeholder:font-semibold placeholder:text-slate-400",
                  isHeaderVariant ? "text-[0.9rem]" : "text-[1.05rem]",
                )}
              />
            </div>

            <button
              ref={spaceTypeFieldRef}
              type="button"
              onClick={() => setActiveField("spaceType")}
              className={cn(
                "relative rounded-[1.2rem] px-4 py-2.5 text-left transition",
                !isHeaderVariant && "border-t border-slate-200 pt-2.5 md:border-t-0 md:pt-2.5 md:border-l md:border-slate-200",
                isHeaderVariant && "md:border-l md:border-slate-200",
                isHeaderVariant &&
                  cn(
                    "px-2.5 transition-all duration-300",
                    isExpanded ? "rounded-[1rem] py-2" : "rounded-[999px] py-1",
                  ),
                !isHeaderVariant && "min-w-0 px-5 py-2.5",
                activeField === "spaceType"
                  ? "z-[1] bg-white shadow-[0_10px_35px_rgba(15,23,42,0.1)] md:z-auto md:shadow-none md:ring-1 md:ring-slate-200/90"
                  : "hover:bg-slate-100/80",
              )}
            >
              <span
                className={cn(
                  "block text-xs font-semibold text-slate-500",
                  isHeaderVariant && "text-[9px]",
                )}
              >
                Space type
              </span>
              <span
                className={cn(
                  "mt-0.5 block truncate text-lg font-semibold text-ink",
                  isHeaderVariant ? "text-[0.9rem]" : "text-[1.05rem]",
                )}
              >
                {selectedTypeLabel}
              </span>
            </button>

            <div
              ref={spaceNameFieldRef}
              onClick={() => setActiveField("spaceName")}
              className={cn(
                "relative rounded-[1.2rem] px-4 py-2.5 text-left transition",
                !isHeaderVariant &&
                  "border-t border-slate-200 pt-2.5 md:border-t-0 md:pt-2.5 md:border-l md:border-slate-200",
                isHeaderVariant && "md:border-l md:border-slate-200",
                isHeaderVariant &&
                  cn(
                    "px-2.5 transition-all duration-300",
                    isExpanded ? "rounded-[1rem] py-2" : "rounded-[999px] py-1",
                  ),
                !isHeaderVariant &&
                  "min-w-0 rounded-[1.2rem] px-5 py-2.5 md:rounded-l-[1.2rem] md:rounded-r-[999px]",
                activeField === "spaceName"
                  ? "z-[1] bg-white shadow-[0_10px_35px_rgba(15,23,42,0.1)] md:z-auto md:shadow-none md:ring-1 md:ring-slate-200/90"
                  : "hover:bg-slate-100/80",
              )}
            >
              <span
                className={cn(
                  "block text-xs font-semibold text-slate-500",
                  isHeaderVariant && "text-[9px]",
                )}
              >
                Space name
              </span>
              <input
                suppressHydrationWarning
                value={spaceNameInput}
                onFocus={() => setActiveField("spaceName")}
                onChange={(event) => {
                  setSpaceNameInput(event.target.value);
                  setSelectedSpaceName("");
                  setSelectedSpaceSlug("");
                }}
                placeholder="Select a space"
                className={cn(
                  "mt-0.5 block w-full truncate border-0 bg-transparent p-0 text-lg font-semibold text-ink outline-none placeholder:font-semibold placeholder:text-slate-400",
                  isHeaderVariant ? "text-[0.9rem]" : "text-[1.05rem]",
                )}
              />
            </div>

            <div
              className={cn(
                "flex items-stretch justify-stretch",
                !isHeaderVariant &&
                  "border-t border-slate-200 pt-2 md:border-t-0 md:pt-0 md:items-center md:justify-end",
                isHeaderVariant && "items-center justify-end",
              )}
            >
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.985 }}
                className={cn(
                  "inline-flex items-center justify-center gap-2 bg-[color:var(--color-brand)] text-base font-semibold text-white transition-colors hover:bg-[color:var(--color-accent)] active:bg-[#0a2d27]",
                  isHeaderVariant
                    ? cn(
                        "rounded-full transition-all duration-300",
                        isExpanded ? "h-10 px-4 text-[0.85rem]" : "h-8 px-3 text-[0.72rem]",
                      )
                    : "h-12 w-full rounded-2xl px-5 text-[0.98rem] md:h-11 md:w-auto md:rounded-full",
                )}
              >
                <Search
                  className={cn(
                    isHeaderVariant
                      ? isExpanded
                        ? "h-3.5 w-3.5"
                        : "h-3 w-3"
                      : "h-4.5 w-4.5",
                  )}
                />
                Search
              </motion.button>
            </div>
          </div>

            <AnimatePresence>
              {activeField ? (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  style={
                    mobileSheetActive
                      ? undefined
                      : dropdownStyle.width > 0
                        ? {
                            left: dropdownStyle.left,
                            width: dropdownStyle.width,
                          }
                        : undefined
                  }
                  className={cn(
                    "z-30 border bg-white p-3 shadow-[0_24px_70px_rgba(15,23,42,0.24)]",
                    mobileSheetActive
                      ? "relative left-auto top-auto mt-3 w-full max-h-[min(52vh,22rem)] overflow-y-auto overscroll-y-contain rounded-[1.4rem] border-slate-200/90 shadow-md md:max-h-none md:overflow-visible md:shadow-[0_24px_70px_rgba(15,23,42,0.24)]"
                      : "absolute left-0 top-[calc(100%+0.45rem)] rounded-2xl border-white/85 md:rounded-[1.25rem]",
                  )}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeField}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                      className={cn(
                        activeField === "spaceType" ? "min-h-0" : "min-h-0 md:min-h-[16.5rem]",
                      )}
                    >
                  {activeField === "location" ? (
                    <div
                      className={cn(
                        "grid gap-2 overflow-y-auto pr-1",
                        mobileSheetActive ? "max-h-[min(42vh,18rem)]" : "max-h-[15.5rem]",
                      )}
                    >
                      {filteredLocations.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setSelectedLocation(option.label);
                            setLocationInput(option.label);
                            setSelectedSpaceSlug("");
                            setActiveField("spaceType");
                          }}
                          className="flex items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-100"
                        >
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                            <MapPin className="h-5 w-5 text-slate-600" />
                          </span>
                          <span className="text-lg text-slate-800">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {activeField === "spaceType" ? (
                    <div className="grid gap-2">
                      {workspaceTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => {
                            setSelectedSpaceType(type.id);
                            setSelectedSpaceName("");
                            setSpaceNameInput("");
                            setSelectedSpaceSlug("");
                            setActiveField("spaceName");
                          }}
                          className={cn(
                            "rounded-xl border px-4 py-3 text-left transition",
                            selectedSpaceType === type.id
                              ? "border-[color:var(--color-brand)] bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand)]"
                              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                          )}
                        >
                          <p className="text-lg font-semibold">{type.label}</p>
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {activeField === "spaceName" ? (
                    <div className="grid gap-2">
                      {selectedSpaceType === "coworking" ? (
                        <>
                          {coworkingHitsLoading ? (
                            <div className="rounded-xl px-3 py-5 text-sm text-slate-500">
                              Loading spaces…
                            </div>
                          ) : null}
                          {!coworkingHitsLoading && !catalogCityId ? (
                            <div className="rounded-xl border border-dashed border-slate-300 px-3 py-5 text-sm text-slate-500">
                              Choose a city first to load coworking spaces.
                            </div>
                          ) : null}
                          {!coworkingHitsLoading && catalogCityId && coworkingHits.length > 0 ? (
                            <div className="grid max-h-[20rem] gap-2 overflow-y-auto overscroll-y-contain pr-1 [scrollbar-gutter:stable]">
                              {coworkingHits.map((hit) => (
                                <button
                                  key={hit.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedSpaceName(hit.name);
                                    setSpaceNameInput(hit.name);
                                    setSelectedSpaceSlug(hit.slug);
                                    setActiveField(null);
                                  }}
                                  className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-100"
                                >
                                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                                    <Building2 className="h-5 w-5 text-slate-600" />
                                  </span>
                                  <span className="text-lg text-slate-800">{hit.name}</span>
                                </button>
                              ))}
                            </div>
                          ) : null}
                          {!coworkingHitsLoading && catalogCityId && coworkingHits.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 px-3 py-5 text-sm text-slate-500">
                              No matching spaces found.
                            </div>
                          ) : null}
                        </>
                      ) : selectedSpaceType === "office-space" ? (
                        <>
                          {officeHitsLoading ? (
                            <div className="rounded-xl px-3 py-5 text-sm text-slate-500">
                              Loading spaces…
                            </div>
                          ) : null}
                          {!officeHitsLoading && !resolvedLocationSlug.trim() ? (
                            <div className="rounded-xl border border-dashed border-slate-300 px-3 py-5 text-sm text-slate-500">
                              Choose a city first to load managed offices.
                            </div>
                          ) : null}
                          {!officeHitsLoading && resolvedLocationSlug.trim() && officeHits.length > 0 ? (
                            <div className="grid max-h-[20rem] gap-2 overflow-y-auto overscroll-y-contain pr-1 [scrollbar-gutter:stable]">
                              {officeHits.map((hit) => (
                                <button
                                  key={hit.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedSpaceName(hit.name);
                                    setSpaceNameInput(hit.name);
                                    setSelectedSpaceSlug(hit.slug);
                                    setActiveField(null);
                                  }}
                                  className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-100"
                                >
                                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                                    <Building2 className="h-5 w-5 text-slate-600" />
                                  </span>
                                  <span className="text-lg text-slate-800">{hit.name}</span>
                                </button>
                              ))}
                            </div>
                          ) : null}
                          {!officeHitsLoading &&
                          resolvedLocationSlug.trim() &&
                          officeHits.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 px-3 py-5 text-sm text-slate-500">
                              No matching spaces found.
                            </div>
                          ) : null}
                        </>
                      ) : selectedSpaceType === "coliving" ? (
                        <>
                          {pgHitsLoading ? (
                            <div className="rounded-xl px-3 py-5 text-sm text-slate-500">
                              Loading coliving space…
                            </div>
                          ) : null}
                          {!pgHitsLoading && !resolvedLocationSlug.trim() ? (
                            <div className="rounded-xl border border-dashed border-slate-300 px-3 py-5 text-sm text-slate-500">
                              Choose a city first to load coliving space listings.
                            </div>
                          ) : null}
                          {!pgHitsLoading && resolvedLocationSlug.trim() && pgHits.length > 0 ? (
                            <div className="grid max-h-[20rem] gap-2 overflow-y-auto overscroll-y-contain pr-1 [scrollbar-gutter:stable]">
                              {pgHits.map((hit) => (
                                <button
                                  key={hit.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedSpaceName(hit.name);
                                    setSpaceNameInput(hit.name);
                                    setSelectedSpaceSlug(hit.slug);
                                    setActiveField(null);
                                  }}
                                  className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-100"
                                >
                                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                                    <Building2 className="h-5 w-5 text-slate-600" />
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block text-lg text-slate-800">{hit.name}</span>
                                    {hit.locality ? (
                                      <span className="block text-sm text-slate-500">{hit.locality}</span>
                                    ) : null}
                                  </span>
                                </button>
                              ))}
                            </div>
                          ) : null}
                          {!pgHitsLoading && resolvedLocationSlug.trim() && pgHits.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 px-3 py-5 text-sm text-slate-500">
                              No matching listings found.
                            </div>
                          ) : null}
                        </>
                      ) : (
                        <>
                          {filteredStaticSpaceNames.length > 0 ? (
                            <div className="grid max-h-[20rem] gap-2 overflow-y-auto overscroll-y-contain pr-1 [scrollbar-gutter:stable]">
                              {filteredStaticSpaceNames.map((name) => (
                                <button
                                  key={name}
                                  type="button"
                                  onClick={() => {
                                    setSelectedSpaceName(name);
                                    setSpaceNameInput(name);
                                    setSelectedSpaceSlug("");
                                    setActiveField(null);
                                  }}
                                  className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-100"
                                >
                                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                                    <Building2 className="h-5 w-5 text-slate-600" />
                                  </span>
                                  <span className="text-lg text-slate-800">{name}</span>
                                </button>
                              ))}
                            </div>
                          ) : null}
                          {filteredStaticSpaceNames.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 px-3 py-5 text-sm text-slate-500">
                              No matching spaces found.
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>
                  ) : null}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              ) : null}
            </AnimatePresence>
              </div>
        </motion.form>
          </div>
        </>
      );
    }

    return (
      <div className={cn("w-full", className)}>
        {showHomeMobileSheet ? (
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(true)}
            className={cn(
              "mb-4 flex w-full items-center gap-3 rounded-[1.35rem] border border-[#ebe5d8]/85 bg-[#fefdfb] px-4 py-3.5 text-left shadow-[0_18px_50px_rgba(2,6,23,0.22)] transition hover:bg-white md:mb-0 md:hidden",
              isMobileSearchOpen && "hidden",
            )}
            aria-expanded={isMobileSearchOpen}
            aria-haspopup="dialog"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-brand)] text-white shadow-[0_10px_28px_rgba(18,184,134,0.35)]">
              <Search className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Search workspaces
              </span>
              <span className="mt-0.5 block truncate text-[0.95rem] font-semibold text-slate-900">
                {[locationInput || selectedLocation, selectedTypeLabel].filter(Boolean).join(" · ")}
              </span>
            </span>
          </button>
        ) : null}

        {useHomeSearchPortal && homeSearchPortalReady
          ? createPortal(
              <div
                ref={containerRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="home-search-sheet-title"
                className="fixed inset-0 z-[110] flex h-[100dvh] max-h-[100dvh] w-screen max-w-[100vw] flex-col overflow-hidden bg-[#f3f1ec] pt-[env(safe-area-inset-top)]"
              >
                {renderHomeHeaderSearchInner()}
              </div>,
              document.body,
            )
          : null}

        {!useHomeSearchPortal ? (
          <div
            ref={containerRef}
            className={cn(
              "relative w-full",
              showHomeMobileSheet && !isMobileSearchOpen && "hidden md:block",
            )}
          >
            {renderHomeHeaderSearchInner()}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={className}>
      <form
        onSubmit={handleSubmit}
        className={cn(
          "rounded-[1.5rem] border border-slate-200/80 bg-white/90 p-3 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl",
        )}
      >
        <div className="grid gap-3 lg:grid-cols-[1.4fr_0.85fr_0.95fr_auto]">
          <label className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 transition focus-within:border-[color:var(--color-brand)]">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Location
            </span>
            <input
              list="spacewallah-locations"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Search Delhi, Bangalore, Gurgaon..."
              className="mt-2 w-full border-0 bg-transparent p-0 text-sm text-ink outline-none placeholder:text-slate-400"
            />
          </label>
          <label className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 transition focus-within:border-[color:var(--color-brand)]">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Team size
            </span>
            <select
              value={teamSize}
              onChange={(event) => setTeamSize(event.target.value)}
              className="mt-2 w-full border-0 bg-transparent p-0 text-sm text-ink outline-none"
            >
              {normalizedTeamSizes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 transition focus-within:border-[color:var(--color-brand)]">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Budget
            </span>
            <select
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              className="mt-2 w-full border-0 bg-transparent p-0 text-sm text-ink outline-none"
            >
              {normalizedBudgets.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" className="h-full min-h-14 rounded-[1.2rem] px-6">
            <Search className="mr-2 h-4 w-4" />
            {submitLabel}
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Popular:
          </span>
          {quickOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setLocation(option.label)}
              className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-200"
            >
              {option.label}
            </button>
          ))}
        </div>
      </form>
      <datalist id="spacewallah-locations">
        {locations.map((option) => (
          <option key={option.value} value={option.label} />
        ))}
      </datalist>
    </div>
  );
}
