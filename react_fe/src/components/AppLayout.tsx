import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'

type AppLayoutProps = {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Pokemon Team Builder</p>
          <h1 className="brand-title">
            <Link className="brand-link" to="/">
              Pokedex Lab
            </Link>
          </h1>
        </div>

        <nav className="topbar-nav" aria-label="Main navigation">
          <NavLink to="/pokemon-lists" className={({ isActive }) => `nav-pill${isActive ? ' active' : ''}`}>
            My Lists
          </NavLink>
          <NavLink
            to="/pokemon-lists/new"
            className={({ isActive }) => `nav-pill${isActive ? ' active' : ''}`}
          >
            Create List
          </NavLink>
        </nav>
      </header>

      <main className="main-content">{children}</main>
    </div>
  )
}