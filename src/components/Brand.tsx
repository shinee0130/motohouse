// MOTO HOUSE брэнд лого — бодит хэвтээ лого (MH тэмдэг + улаан accent).
// Эх файл: public/assets/motohouse_logo_long.png (2172×724, ~3:1).
export function Brand({ height = 40 }: { height?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/assets/motohouse_logo_long.png"
      alt="MOTO HOUSE"
      style={{ height, width: "auto", display: "block" }}
    />
  );
}
