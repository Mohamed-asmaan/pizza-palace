const Footer = () => (
  <footer className="bg-neutral-dark text-white mt-auto">
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-hidden="true">
            🍕
          </span>
          <span className="text-lg font-bold">Pizza Palace</span>
        </div>
        <p className="text-gray-400 text-sm text-center">
          © 2026 Pizza Palace. MERN Stack Online Food Ordering Platform.
        </p>
        <p className="text-gray-500 text-xs font-mono">Student Developer Edition</p>
      </div>
    </div>
  </footer>
);

export default Footer;
