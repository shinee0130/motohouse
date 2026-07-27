import { ComingSoon } from "@/components/ui/ComingSoon";

// Аяллын хэсэг түр ХААЛТТАЙ (coming soon) — фичер бүрэн ажиллагаанд ороогүй.
// Сэргээх: доорхыг устгаад → import TravelContent from "./TravelContent"; return <TravelContent />;
export default function TravelPage() {
  return (
    <ComingSoon
      icon={
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
          <path d="M8 2v16M16 6v16" />
        </svg>
      }
      titleMn="Мото аялал"
      titleEn="Moto tours"
      descMn="Монгол даяарх мото аяллын маршрут, захиалгын систем бэлтгэгдэж байна. Тун удахгүй нээгдэнэ."
      descEn="Guided motorcycle tours and route booking across Mongolia are on the way. Opening very soon."
    />
  );
}
