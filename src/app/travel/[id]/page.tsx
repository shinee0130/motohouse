import { redirect } from "next/navigation";

// Аяллын хэсэг түр харагдахгүй тул шууд нэвтрэх URL-ийг ч home руу буцаана.
export default function TourPage() {
  redirect("/");
}
