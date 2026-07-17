"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { sx } from "@/lib/sx";
import { useAuth } from "@/lib/auth";
import { useAuthModal } from "@/lib/authModal";
import { useI18n } from "@/lib/i18n";
import { createOrderRequest, uploadRequestImage } from "@/lib/admin";
import { Select } from "@/components/Select";

const CATEGORIES = ["Мотоцикл сэлбэг", "Дагалдах хэрэгсэл (каск, хувцас)", "Мотоцикл", "Бусад"];
const INPUT = "background:#050505;border:1px solid #262626;border-radius:10px;padding:12px 14px;color:#fff;font:400 14px Roboto;outline:none;width:100%;";
const LABEL = "font:600 11px Montserrat;letter-spacing:.03em;color:#A3A3A3;margin-bottom:6px;display:block;";

export default function RequestPage() {
  const { user, ready } = useAuth();
  const { t } = useI18n();
  const authModal = useAuthModal();
  const [category, setCategory] = useState("");
  const [detail, setDetail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [reqId, setReqId] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (user) { setName((n) => n || user.name || ""); setPhone((p) => p || user.phone || ""); }
  }, [user]);

  async function onUpload(file: File) {
    setUploading(true);
    try { setImage(await uploadRequestImage(file)); }
    catch (e) { setErr(t("Зураг оруулахад алдаа гарлаа.") + " " + (e instanceof Error ? e.message : "")); }
    finally { setUploading(false); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { authModal.open("login"); return; }
    if (!category) return setErr(t("Ангиллаа сонгоно уу."));
    if (!detail.trim()) return setErr(t("Юу захиалахаа дэлгэрэнгүй бичнэ үү."));
    if (!name.trim()) return setErr(t("Нэрээ оруулна уу."));
    if (!phone.trim()) return setErr(t("Утасны дугаараа оруулна уу."));
    setErr(""); setBusy(true);
    try {
      const id = await createOrderRequest({
        userPhone: user.phone, name: name.trim(), phone: phone.trim(),
        category, detail: detail.trim(), image: image || undefined,
      });
      setReqId(id); setDone(true);
    } catch (e) {
      setErr(t("Алдаа гарлаа. Дахин оролдоно уу.") + " " + (e instanceof Error ? e.message : ""));
    } finally { setBusy(false); }
  }

  return (
    <div style={sx("max-width:760px;margin:0 auto;padding:clamp(32px,5vw,56px) clamp(20px,4vw,40px);animation:mhfade .5s both;")}>
      <h1 style={sx("font:800 clamp(30px,5vw,46px) Montserrat;color:#fff;margin-top:6px;text-transform:uppercase;")}>
        {t("Захиалгын хүсэлт")}
      </h1>
      <p style={sx("font:400 15px/1.6 Roboto;color:#8A8F98;margin-top:8px;")}>
        {t("Дэлгүүрт байхгүй сэлбэг, каск, хувцас болон бусад зүйлийг захиалж болно. Юу хэрэгтэйгээ дэлгэрэнгүй бичээрэй — бид судалж үнийн санал болон боломжийг эргэж хэлнэ.")}
      </p>

      {done ? (
        <div style={sx("background:#111113;border:1px solid #262626;border-radius:18px;padding:clamp(28px,5vw,48px);margin-top:26px;text-align:center;")}>
          <div style={sx("font:800 22px Montserrat;color:#22c55e;")}>✓ {t("Хүсэлт илгээгдлээ!")}</div>
          <div style={sx("font:400 14px Roboto;color:#A3A3A3;margin-top:10px;")}>
            {t("Бид таны хүсэлтийг судалж, үнийн санал болон боломжийг эргэж мэдэгдэнэ.")} <b style={{ color: "#fff" }}>#{reqId}</b>
          </div>
          <Link href="/account/requests" style={sx("display:inline-block;margin-top:20px;background:#E10613;color:#fff;font:700 13px Montserrat;letter-spacing:.05em;padding:13px 24px;border-radius:10px;text-transform:uppercase;cursor:pointer;")}>
            {t("Миний хүсэлтүүд")}
          </Link>
        </div>
      ) : !ready ? (
        <div style={sx("padding:44px 24px;margin-top:26px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>{t("Ачаалж байна…")}</div>
      ) : !user ? (
        <div style={sx("background:#111113;border:1px solid #262626;border-radius:18px;padding:44px 24px;margin-top:26px;text-align:center;")}>
          <div style={sx("font:600 16px Montserrat;color:#C8C8C8;")}>{t("Хүсэлт илгээхийн тулд нэвтэрнэ үү.")}</div>
          <button onClick={() => authModal.open("login")} style={sx("display:inline-block;margin-top:18px;background:#E10613;color:#fff;font:700 13px Montserrat;padding:12px 24px;border:none;border-radius:10px;cursor:pointer;")}>{t("Нэвтрэх")}</button>
        </div>
      ) : (
        <form onSubmit={submit} style={sx("background:#111113;border:1px solid #262626;border-radius:18px;padding:clamp(20px,3vw,28px);margin-top:26px;display:flex;flex-direction:column;gap:16px;")}>
          <div>
            <label style={sx(LABEL)}>{t("Ангилал")}</label>
            <Select
              value={category}
              onChange={setCategory}
              placeholder={t("Ангилал сонгох…")}
              ariaLabel={t("Ангилал")}
              full
              bg="#050505"
              options={CATEGORIES.map((c) => ({ value: c, label: t(c) }))}
            />
          </div>
          <div>
            <label style={sx(LABEL)}>{t("Юу захиалах вэ? (дэлгэрэнгүй)")}</label>
            <textarea
              value={detail} onChange={(e) => setDetail(e.target.value)} rows={5}
              placeholder={t("Жишээ: Kawasaki ZX-10R-ийн урд тормозны колодка, эсвэл M хэмжээтэй хар өнгийн текстиль хүрэм…")}
              style={sx(INPUT + "resize:vertical;")}
            />
          </div>
          <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;")}>
            <div>
              <label style={sx(LABEL)}>{t("Нэр")}</label>
              <input value={name} onChange={(e) => setName(e.target.value)} style={sx(INPUT)} />
            </div>
            <div>
              <label style={sx(LABEL)}>{t("Утасны дугаар")}</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} style={sx(INPUT)} />
            </div>
          </div>
          <div>
            <label style={sx(LABEL)}>{t("Жишээ зураг (сонгох)")}</label>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
              {image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="" style={sx("width:88px;height:88px;object-fit:cover;border-radius:10px;border:1px solid #262626;")} />
              )}
              <label style={sx("background:#1a1a1d;border:1px solid #333;color:#C8C8C8;font:600 12px Montserrat;padding:11px 16px;border-radius:9px;cursor:pointer;display:inline-block;")}>
                {uploading ? t("Ачаалж байна…") : image ? t("Зураг солих") : t("Зураг хавсаргах")}
                <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
              </label>
              {image && <button type="button" onClick={() => setImage("")} style={sx("background:none;border:none;color:#ef4444;font:600 12px Montserrat;cursor:pointer;")}>{t("Устгах")}</button>}
            </div>
          </div>
          {err && <div style={sx("font:500 13px Roboto;color:#ef4444;")}>{err}</div>}
          <button type="submit" disabled={busy || uploading} style={sx(`background:#E10613;color:#fff;font:700 15px Montserrat;letter-spacing:.04em;padding:16px;border:none;border-radius:12px;text-transform:uppercase;cursor:pointer;${busy || uploading ? "opacity:.6;" : ""}`)}>
            {busy ? t("Илгээж байна…") : t("Хүсэлт илгээх")}
          </button>
          <div style={sx("font:400 12px Roboto;color:#8A8F98;text-align:center;")}>
            {t("Хүсэлт илгээснээр төлбөр үүсэхгүй — бид эхлээд боломж/үнийг судалж хариулна.")}
          </div>
        </form>
      )}
    </div>
  );
}
