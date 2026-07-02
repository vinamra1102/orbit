function Header() {
  return (
    <header
      data-cursor-hide
      className="pointer-events-none fixed left-6 top-6 z-10 select-none"
    >
      <h1 className="text-sm font-semibold tracking-wide text-slate-200">Vinamra Bhonsle</h1>
      <p className="mt-0.5 text-xs text-slate-500">
        My tech stack as a constellation — drag to explore, click a node to inspect.
      </p>
    </header>
  )
}

export default Header
