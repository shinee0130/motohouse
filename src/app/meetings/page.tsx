import { MeetingsGrid } from "@/components/meetings/MeetingsGrid";
import { getEvents, getEventMediaCounts, getEventPartnersMap } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

// Biker Meeting — events хүснэгтээс type='Meeting' мөрүүд. Шинэ уулзалт нэмэхдээ
// админы Events хэсгээс Төрөл="Meeting" гэж сонгоно, тэр даруй энд гарна.
export const isMeeting = (t: string) => (t || "").toLowerCase().includes("meeting");

export default async function MeetingsPage() {
  const [all, counts, partners] = await Promise.all([getEvents(), getEventMediaCounts(), getEventPartnersMap()]);
  const meetings = all
    .filter((e) => isMeeting(e.type))
    .sort((a, b) => (b.date || "").localeCompare(a.date || "")); // сүүлийнх нь эхэнд

  return <MeetingsGrid meetings={meetings} counts={counts} partners={partners} />;
}
