// MOTO HOUSE брэнд лого — хэвтээ лого, transparent дэвсгэртэй (хар хүрээгүй).
// _t.png = motohouse_logo_long.png-ийн хар дэвсгэрийг alpha-аар арилгасан хувилбар.
export function Brand({ height = 40 }: { height?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/assets/motohouse_logo_long_t.png"
      alt="MOTO HOUSE"
      style={{ height, width: "auto", display: "block" }}
    />
  );
}
