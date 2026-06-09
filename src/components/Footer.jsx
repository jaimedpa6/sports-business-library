export default function Footer() {
  return (
    <footer
      className="mt-24 py-10"
      style={{ borderTop: '1px solid #eeeeeb' }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs" style={{ color: '#9a9a9a' }}>
          © 2026 Ballketing. Curated by{' '}
          <a
            href="https://jaimedominguezperezdeayala.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-150 hover:text-[#025785]"
            style={{ color: '#545454', textDecoration: 'underline', textUnderlineOffset: '3px' }}
          >
            Jaime Domínguez Pérez de Ayala
          </a>
        </p>
        <div className="flex items-center gap-5">
          <a
            href="https://www.ballketing.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs transition-colors duration-150 hover:text-[#025785]"
            style={{ color: '#9a9a9a' }}
          >
            Ballketing
          </a>
          <a
            href="https://www.ballketing.com/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs transition-colors duration-150 hover:text-[#025785]"
            style={{ color: '#9a9a9a' }}
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  )
}
