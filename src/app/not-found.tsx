import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell" style={{ padding: "64px 0 80px" }}>
      <section
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "32px",
          borderRadius: 24,
          border: "1px solid var(--line)",
          background: "var(--surface)",
          boxShadow: "var(--glow)",
          textAlign: "center",
        }}
      >
        <p className="tag">Ошибка 404</p>
        <h1
          style={{ margin: "14px 0 10px", fontSize: "clamp(2rem, 5vw, 3rem)" }}
        >
          Страница не найдена
        </h1>
        <p style={{ margin: 0, color: "var(--ink-soft)" }}>
          Возможно, ссылка устарела или адрес введен с ошибкой.
        </p>
        <div style={{ marginTop: 24 }}>
          <Link
            href="/"
            style={{
              display: "inline-block",
              padding: "12px 18px",
              borderRadius: 999,
              background: "var(--brand)",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            Перейти на главную
          </Link>
        </div>
      </section>
    </main>
  );
}
