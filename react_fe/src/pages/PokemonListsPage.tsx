import { type ChangeEvent, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { deletePokemonList, getPokemonLists, importPokemonList } from '../api/pokemonLists'
import type { PokemonListSummary } from '../types/pokemon'

function formatDate(dateIso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateIso))
}

export function PokemonListsPage() {
  const [lists, setLists] = useState<PokemonListSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function loadLists() {
    setLoading(true)
    setError(null)

    try {
      const response = await getPokemonLists()
      setLists(response)
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Unable to fetch pokemon lists'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(list: PokemonListSummary) {
    const accepted = window.confirm(`Delete "${list.name}"? This action cannot be undone.`)

    if (!accepted) {
      return
    }

    setDeletingId(list.id)
    setError(null)

    try {
      await deletePokemonList(list.id)
      setLists((prev) => prev.filter((item) => item.id !== list.id))
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : 'Failed to delete list'
      setError(message)
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    void loadLists()
  }, [])

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setImporting(true)
    setError(null)

    try {
      await importPokemonList(file)
      await loadLists()
    } catch (importError) {
      if (importError instanceof ApiError && importError.messages.length > 0) {
        setError(importError.messages.join('. '))
      } else {
        const message = importError instanceof Error ? importError.message : 'Failed to import list'
        setError(message)
      }
    } finally {
      setImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <section className="page-stack">
      <div className="panel panel-heading-row">
        <div>
          <h2>Saved Pokemon Lists</h2>
          <p className="subtle">Create teams, import JSON files, and inspect each list in detail.</p>
        </div>

        <div className="row-actions">
          <button className="btn btn-ghost" onClick={() => fileInputRef.current?.click()} disabled={importing}>
            {importing ? 'Importing...' : 'Import JSON'}
          </button>
          <Link className="btn btn-primary" to="/pokemon-lists/new">
            Create New List
          </Link>
          <input
            ref={fileInputRef}
            className="visually-hidden"
            type="file"
            accept="application/json"
            onChange={handleImport}
          />
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      {loading ? <div className="panel">Loading lists...</div> : null}

      {!loading && lists.length === 0 ? (
        <div className="panel">
          <p>No lists yet. Start by creating one from the Pokemon catalog.</p>
        </div>
      ) : null}

      {!loading && lists.length > 0 ? (
        <div className="cards-grid">
          {lists.map((list) => (
            <article className="panel list-card" key={list.id}>
              <h3>{list.name}</h3>
              <dl className="stat-grid">
                <div>
                  <dt>Pokemon</dt>
                  <dd>{list.itemsCount}</dd>
                </div>
                <div>
                  <dt>Unique Species</dt>
                  <dd>{list.uniqueSpeciesCount}</dd>
                </div>
                <div>
                  <dt>Total Weight</dt>
                  <dd>{list.totalWeight}</dd>
                </div>
              </dl>
              <p className="subtle">Updated {formatDate(list.updatedAt)}</p>
              <div className="row-actions">
                <Link className="btn btn-secondary" to={`/pokemon-lists/${list.id}`}>
                  Open List
                </Link>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(list)}
                  disabled={deletingId === list.id}
                >
                  {deletingId === list.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}