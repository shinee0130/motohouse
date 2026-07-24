import { sx } from "@/lib/ui/sx";
import { getPhotographers } from "@/lib/db/queries";
import { PhotoGrid } from "./PhotoGrid";
import { T } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function PhotoPage() {
  const photographers = await getPhotographers();
  return (
    <div style={sx("max-width:1280px;margin:0 auto;padding:clamp(32px,5vw,56px) clamp(20px,4vw,40px);")}>
      <div style={{ animation: "mhfade .5s both" }}>
        <h1 style={sx("font:800 clamp(30px,5vw,46px) Montserrat;color:#fff;text-transform:uppercase;")}>
          <T>Зураг авалт</T>
        </h1>
        <p style={sx("font:400 14px Roboto;color:#8A8F98;margin-top:8px;max-width:600px;")}>
          <T>Мотоциклын зураг, reel болон видео бичлэгийн мэргэжлийн багаас сонгож, цаг захиална.</T>
        </p>
        <PhotoGrid photographers={photographers} />
      </div>
    </div>
  );
}
