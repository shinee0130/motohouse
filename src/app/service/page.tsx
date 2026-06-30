"use client";

import { useState } from "react";
import { sx } from "@/lib/sx";
import { SERVICES } from "@/lib/data";

const inputStyle =
  "background:#050505;border:1px solid #262626;border-radius:9px;padding:13px 15px;color:#fff;font:400 14px Roboto;outline:none;";

export default function ServicePage() {
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div style={sx("max-width:1280px;margin:0 auto;padding:clamp(32px,5vw,56px) clamp(20px,4vw,40px);")}>
      <div style={{ animation: "mhfade .5s both" }}>
        <div style={sx("font:500 12px 'JetBrains Mono';letter-spacing:.24em;color:#E10613;")}>EXPERT SERVICE</div>
        <h1 style={sx("font:800 clamp(30px,5vw,46px) Montserrat;color:#fff;margin-top:6px;text-transform:uppercase;")}>
          Засвар үйлчилгээ
        </h1>

        <div
          style={sx(
            "display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:32px;margin-top:28px;align-items:start;",
          )}
        >
          <div>
            <div style={sx("font:600 12px 'JetBrains Mono';letter-spacing:.22em;color:#8A8F98;margin-bottom:14px;")}>
              ҮЙЛЧИЛГЭЭНИЙ ТӨРӨЛ
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {SERVICES.map((s) => (
                <div
                  key={s}
                  style={sx(
                    "background:#111113;border:1px solid #262626;border-radius:10px;padding:14px 16px;font:600 14px Roboto;color:#fff;",
                  )}
                >
                  {s}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "stretch", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
              {[
                { n: "1", t: "Төрөл сонгох", active: false },
                { n: "2", t: "Form бөглөх", active: false },
                { n: "3", t: "Admin холбогдоно", active: true },
              ].map((step) => (
                <div
                  key={step.n}
                  style={sx(
                    step.active
                      ? "flex:1;min-width:120px;background:rgba(225,6,19,.1);border:1px solid #E10613;border-radius:12px;padding:16px;"
                      : "flex:1;min-width:120px;background:#0B0B0D;border:1px solid #262626;border-radius:12px;padding:16px;",
                  )}
                >
                  <div
                    style={sx(
                      step.active
                        ? "width:30px;height:30px;background:#E10613;border-radius:50%;display:flex;align-items:center;justify-content:center;font:800 12px 'JetBrains Mono';color:#fff;"
                        : "width:30px;height:30px;border:1.5px solid #E10613;border-radius:50%;display:flex;align-items:center;justify-content:center;font:800 12px 'JetBrains Mono';color:#E10613;",
                    )}
                  >
                    {step.n}
                  </div>
                  <div style={sx("font:500 13px Roboto;color:#fff;margin-top:10px;")}>{step.t}</div>
                </div>
              ))}
            </div>
          </div>

          {/* form */}
          <div style={sx("background:#111113;border:1px solid #262626;border-radius:18px;padding:28px;")}>
            <div style={sx("font:700 20px Montserrat;color:#fff;")}>Засварын хүсэлт</div>
            <div style={sx("font:400 13px Roboto;color:#8A8F98;margin-top:4px;")}>
              Мэдээллээ үлдээгээрэй, бид холбогдоно.
            </div>
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
              <input className="mh-input" placeholder="Нэр" style={sx(inputStyle)} />
              <input className="mh-input" placeholder="Утас" style={sx(inputStyle)} />
              <input className="mh-input" placeholder="Мотоциклын модель" style={sx(inputStyle)} />
              <textarea
                className="mh-input"
                placeholder="Асуудал / message"
                rows={3}
                style={sx(inputStyle + "resize:vertical;")}
              />
              <button
                type="submit"
                style={sx(
                  "background:#E10613;color:#fff;font:700 14px Montserrat;letter-spacing:.06em;padding:14px;border:none;border-radius:10px;text-transform:uppercase;cursor:pointer;",
                )}
              >
                Хүсэлт илгээх
              </button>
              {sent && (
                <div style={sx("font:500 13px Roboto;color:#22c55e;text-align:center;")}>
                  ✓ Хүсэлт илгээгдлээ. Бид удахгүй холбогдоно.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
