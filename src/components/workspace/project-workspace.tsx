"use client";

import { useState } from "react";
import type {
  BookingEvent,
  BookingScopeItem,
  BookingInvoice,
  BookingPhoto,
  DailyLog,
  BookingCheckin,
  BookingShareToken,
  BookingStage,
  WaiverTemplate,
  WaiverSignature,
} from "@/types";
import { StagePipeline } from "./stage-pipeline";
import { StageControl } from "./stage-control";
import { Timeline } from "./timeline";
import { ScopeEditor } from "./scope-editor";
import { InvoiceList } from "./invoice-list";
import { PhotoGallery } from "./photo-gallery";
import { DailyLogForm } from "./daily-log-form";
import { CheckInButton } from "./checkin-button";
import { ShareButton } from "./share-button";
import { RecurrenceControl } from "./recurrence-control";
import { WaiversPanel } from "./waivers-panel";
import { WorkspaceTabs, type WorkspaceTab } from "./workspace-tabs";

export function ProjectWorkspace({
  bookingId,
  stage,
  role,
  quotedPrice,
  recurrenceRule,
  events,
  scope,
  invoices,
  photos,
  logs,
  checkins,
  shareToken,
  waiverTemplates,
  waiverSignatures,
}: {
  bookingId: string;
  stage: BookingStage | null;
  role: "client" | "contractor";
  quotedPrice: number | null;
  recurrenceRule: string | null;
  events: BookingEvent[];
  scope: BookingScopeItem[];
  invoices: BookingInvoice[];
  photos: BookingPhoto[];
  logs: DailyLog[];
  checkins: BookingCheckin[];
  shareToken: BookingShareToken | null;
  waiverTemplates: WaiverTemplate[];
  waiverSignatures: (WaiverSignature & { waiver_templates?: { title: string } })[];
}) {
  const isPro = role === "contractor";
  const tabs: WorkspaceTab[] = [
    "timeline",
    "scope",
    "invoices",
    "photos",
    "logs",
    "waivers",
    ...(isPro ? (["checkin", "share"] as WorkspaceTab[]) : []),
  ];
  const [active, setActive] = useState<WorkspaceTab>("timeline");

  return (
    <div className="space-y-6">
      <StagePipeline stage={stage} />
      <StageControl bookingId={bookingId} currentStage={stage} role={role} />
      <RecurrenceControl
        bookingId={bookingId}
        currentRule={recurrenceRule}
        editable={isPro}
      />
      <WorkspaceTabs tabs={tabs} active={active} onChange={setActive} />

      <div>
        {active === "timeline" && <Timeline events={events} />}
        {active === "scope" && (
          <ScopeEditor
            bookingId={bookingId}
            items={scope}
            editable={isPro}
          />
        )}
        {active === "invoices" && (
          <InvoiceList
            bookingId={bookingId}
            invoices={invoices}
            editable={isPro}
            quotedPrice={quotedPrice}
          />
        )}
        {active === "photos" && (
          <PhotoGallery
            bookingId={bookingId}
            photos={photos}
            canUpload={true}
            canDelete={true}
          />
        )}
        {active === "logs" && (
          <DailyLogForm
            bookingId={bookingId}
            logs={logs}
            editable={isPro}
          />
        )}
        {active === "waivers" && (
          <WaiversPanel
            bookingId={bookingId}
            contractorTemplates={waiverTemplates}
            signatures={waiverSignatures}
            role={role}
          />
        )}
        {active === "checkin" && isPro && (
          <CheckInButton
            bookingId={bookingId}
            checkins={checkins}
            editable={isPro}
          />
        )}
        {active === "share" && isPro && (
          <ShareButton bookingId={bookingId} token={shareToken} />
        )}
      </div>
    </div>
  );
}
