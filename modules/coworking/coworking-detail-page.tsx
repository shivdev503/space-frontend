import { Container } from "@/components/ui/container";
import { CoworkingDetailAbout } from "@/modules/coworking/components/coworking-detail/coworking-detail-about";
import { CoworkingDetailAmenities } from "@/modules/coworking/components/coworking-detail/coworking-detail-amenities";
import { CoworkingDetailBreadcrumb } from "@/modules/coworking/components/coworking-detail/coworking-detail-breadcrumb";
import { CoworkingDetailHero } from "@/modules/coworking/components/coworking-detail/coworking-detail-hero";
import { CoworkingDetailHighlights } from "@/modules/coworking/components/coworking-detail/coworking-detail-highlights";
import { CoworkingDetailLocation } from "@/modules/coworking/components/coworking-detail/coworking-detail-location";
import { CoworkingDetailLeadQuiz } from "@/modules/coworking/components/coworking-detail/coworking-detail-lead-quiz";
import { CoworkingLeadQuizProvider } from "@/modules/coworking/components/coworking-detail/coworking-detail-lead-quiz-context";
import { CoworkingDetailMobileBar } from "@/modules/coworking/components/coworking-detail/coworking-detail-mobile-bar";
import { CoworkingDetailPricing } from "@/modules/coworking/components/coworking-detail/coworking-detail-pricing";
import { workspaceCitySlugish } from "@/modules/coworking/components/coworking-detail-header";
import { CoworkingCard } from "@/modules/coworking/components/coworking-card";
import { SpaceDetailGallery } from "@/modules/space-detail/components/space-detail-gallery";
import {
  coworkingPlanCategoryLabel,
  filterCoworkingPlansForStartingPrice,
} from "@/services/workspace-plan-pricing";
import type { CoworkingModel } from "@/types/coworking-workspace.model";
import { toTitleCase } from "@/utils/format";
import { spaceImageUrl, toSpaceImageCdnUrl } from "@/lib/space-image-url";

function workspaceImages(workspace: CoworkingModel.WorkSpace): string[] {
  const imgs = workspace.images?.map((img) => spaceImageUrl(img.image)).filter(Boolean) ?? [];
  const hero = toSpaceImageCdnUrl(workspace.image ?? "");
  if (hero) return [hero, ...imgs].filter(Boolean) as string[];
  return imgs as string[];
}

function leadPriceLabel(workspace: CoworkingModel.WorkSpace): {
  amount: number;
  suffix: string;
  hint: string;
} {
  const starting = workspace.starting_price ?? 0;
  const plans = filterCoworkingPlansForStartingPrice(workspace.plans ?? []);
  const dayPass = plans.find((p) =>
    coworkingPlanCategoryLabel(p).toLowerCase().includes("day pass"),
  );
  if (dayPass) {
    const price = typeof dayPass.price === "number" ? dayPass.price : Number(dayPass.price) || 0;
    return {
      amount: price || starting,
      suffix: "/ day pass",
      hint: "Memberships from ₹7,999/mo · No booking fee",
    };
  }
  return {
    amount: starting,
    suffix: "/ mo",
    hint: "Memberships available · No booking fee",
  };
}

export function CoworkingDetailPage({
  workspace,
  similarWorkspaces,
}: {
  workspace: CoworkingModel.WorkSpace;
  similarWorkspaces: CoworkingModel.WorkSpace[];
}) {
  const images = workspaceImages(workspace);
  const cityName = workspace.location?.city?.name?.trim() || "city";
  const micro = workspace.location?.micro_location?.name?.trim() || "";
  const leadPrice = leadPriceLabel(workspace);
  const leadTarget = {
    city: workspaceCitySlugish(workspace),
    spaceId: workspace.id,
  };

  return (
    <CoworkingLeadQuizProvider>
    <div className="bg-[color:var(--color-page-bg)]">
      <Container className="max-w-[1280px] pt-4 sm:pt-8 max-lg:px-4">
        <CoworkingDetailBreadcrumb workspace={workspace} />
        <CoworkingDetailHero workspace={workspace} />
        <SpaceDetailGallery name={workspace.name} images={images} />
      </Container>

      <Container className="max-w-[1280px]">
        <div className="grid items-start gap-10 pb-14 pt-8 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12 lg:pb-[70px]">
          <main className="min-w-0">
            <CoworkingDetailPricing workspace={workspace} />
            <CoworkingDetailAmenities workspace={workspace} />
            <CoworkingDetailAbout workspace={workspace} />
            <section id="overview" className="pt-2 sm:pt-[30px]">
              <CoworkingDetailHighlights workspace={workspace} />
            </section>
            <CoworkingDetailLocation workspace={workspace} />
          </main>

          <CoworkingDetailLeadQuiz
            workspaceName={workspace.name}
            citySlug={leadTarget.city}
            spaceId={leadTarget.spaceId}
            microlocation={micro}
            startingFrom={leadPrice.amount}
            priceSuffix={leadPrice.suffix}
            membershipHint={leadPrice.hint}
          />
        </div>
      </Container>

      {similarWorkspaces.length > 0 ? (
        <section id="similar" className="border-t border-[#E7E9E6] pt-8 pb-5 sm:pt-11 sm:pb-6">
          <Container className="max-w-[1280px]">
            <p className="text-[12.5px] font-bold uppercase tracking-[0.12em] text-[color:var(--color-brand)]">
              Keep exploring
            </p>
            <h2 className="mt-3 text-[1.65rem] font-extrabold tracking-[-0.03em] text-ink sm:text-[1.7rem]">
              Similar spaces nearby
            </h2>
            <p className="mt-2 max-w-[60ch] text-[15.5px] text-muted">
              More premium, verified coworking options around {toTitleCase(cityName)}.
            </p>

            <div className="no-scrollbar mt-6 flex snap-x gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {similarWorkspaces.map((ws) => (
                <div
                  key={ws.id}
                  className="w-[min(84vw,360px)] shrink-0 snap-start sm:w-[350px]"
                >
                  <CoworkingCard workspace={ws} className="h-full" />
                </div>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <CoworkingDetailMobileBar
        startingFrom={leadPrice.amount}
        priceSuffix={leadPrice.suffix}
      />
    </div>
    </CoworkingLeadQuizProvider>
  );
}
