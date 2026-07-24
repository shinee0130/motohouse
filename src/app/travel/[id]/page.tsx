import { redirect } from "next/navigation";

// Аялал coming soon үед detail хуудсыг /travel руу шилжүүлнэ.
// Сэргээх: git түүхээс өмнөх getTour + TourDetail хувилбарыг буцаа.
export default function TourPage() {
  redirect("/travel");
}
