import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { getPokemonCatalog } from '../api/pokemon'
import { createPokemonList, importPokemonList } from '../api/pokemonLists'
import { RuleStatus } from '../components/RuleStatus'
import type { PokemonCatalogItem } from '../types/pokemon'

type SelectionMap = Record<number, PokemonCatalogItem>

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase()
}

export function CreatePokemonListPage() {
  const navigate = useNavigate()
  const [listName, setListName] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loadingCatalog, setLoadingCatalog] = useState(true)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [catalogItems, setCatalogItems] = useState<PokemonCatalogItem[]>([])
  const [totalCatalogItems, setTotalCatalogItems] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [selection, setSelection] = useState<SelectionMap>({})
  const [submitting, setSubmitting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedItems = useMemo(() => Object.values(selection), [selection])
  const uniqueSpeciesCount = useMemo(
    () => new Set(selectedItems.map((item) => item.speciesName)).size,
    [selectedItems],
  )
  const totalWeight = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.weight, 0),
    [selectedItems],
  )

  useEffect(() => {
    let cancelled = false

    async function loadCatalog() {
      setLoadingCatalog(true)
      setCatalogError(null)

      try {
        const response = await getPokemonCatalog({
          page,
          limit: 20,
          search: normalizeQuery(search),
        })

        if (cancelled) {
          return
        }

        setCatalogItems(response.items)
        setTotalCatalogItems(response.total)
        setHasNextPage(response.hasNextPage)
      } catch (error) {
        if (cancelled) {
          return
        }

        const message = error instanceof Error ? error.message : 'Unable to fetch pokemon catalog'
        setCatalogError(message)
      } finally {
        if (!cancelled) {
          setLoadingCatalog(false)
        }
      }
    }

    void loadCatalog()

    return () => {
      cancelled = true
    }
  }, [page, search])

  function togglePokemon(item: PokemonCatalogItem) {
    setSelection((prev) => {
      if (prev[item.id]) {
        const next = { ...prev }
        delete next[item.id]
        return next
      }

      return {
        ...prev,
        [item.id]: item,
      }
    })
    setSubmitError(null)
  }

  function clearSelection() {
    setSelection({})
  }

  async function handleCreateList() {
    setSubmitting(true)
    setSubmitError(null)

    try {
      const created = await createPokemonList({
        name: listName.trim() || undefined,
        items: selectedItems.map((item) => ({
          pokemonId: item.id,
          name: item.name,
          speciesName: item.speciesName,
          weight: item.weight,
          spriteUrl: item.spriteUrl,
        })),
      })

      navigate(`/pokemon-lists/${created.id}`)
    } catch (error) {
      if (error instanceof ApiError && error.messages.length > 0) {
        setSubmitError(error.messages.join('. '))
      } else {
        const message = error instanceof Error ? error.message : 'Unable to create list'
        setSubmitError(message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setImporting(true)
    setSubmitError(null)

    try {
      const imported = await importPokemonList(file)
      navigate(`/pokemon-lists/${imported.id}`)
    } catch (error) {
      if (error instanceof ApiError && error.messages.length > 0) {
        setSubmitError(error.messages.join('. '))
      } else {
        const message = error instanceof Error ? error.message : 'Unable to import list'
        setSubmitError(message)
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
          <h2>Create Pokemon List</h2>
          <p className="subtle">Select Pokemon from the catalog and submit a rules-compliant team.</p>
        </div>
        <div className="row-actions">
          <button className="btn btn-ghost" onClick={() => fileInputRef.current?.click()} disabled={importing}>
            {importing ? 'Importing...' : 'Import Saved File'}
          </button>
          <input
            ref={fileInputRef}
            className="visually-hidden"
            type="file"
            accept="application/json"
            onChange={handleImport}
          />
        </div>
      </div>

      <div className="panel">
        <label className="field-label" htmlFor="listName">
          List Name
        </label>
        <input
          id="listName"
          className="text-input"
          value={listName}
          onChange={(event) => setListName(event.target.value)}
          placeholder="My electric team"
          maxLength={100}
        />
      </div>

      <div className="two-column-grid">
        <section className="panel">
          <div className="panel-heading-row compact">
            <h3>Pokemon Catalog</h3>
            <p className="subtle">{totalCatalogItems} matching pokemon</p>
          </div>

          <div className="catalog-toolbar">
            <input
              className="text-input"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Search by name"
            />

            <div className="row-actions">
              <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage((old) => old - 1)}>
                Prev
              </button>
              <span className="badge">Page {page}</span>
              <button className="btn btn-ghost" disabled={!hasNextPage} onClick={() => setPage((old) => old + 1)}>
                Next
              </button>
            </div>
          </div>

          {catalogError ? <div className="alert alert-error">{catalogError}</div> : null}
          {loadingCatalog ? <p>Loading catalog...</p> : null}

          {!loadingCatalog ? (
            <ul className="catalog-list" aria-label="Pokemon catalog">
              {catalogItems.map((item) => {
                const selected = Boolean(selection[item.id])

                return (
                  <li key={item.id} className={`catalog-item${selected ? ' selected' : ''}`}>
                    <button className="catalog-item-button" onClick={() => togglePokemon(item)}>
                      <div className="pokemon-main">
                        {item.spriteUrl ? <img src={item.spriteUrl} alt={item.name} width={48} height={48} /> : null}
                        <div>
                          <p className="pokemon-name">{item.name}</p>
                          <p className="pokemon-meta">
                            species: {item.speciesName} · weight: {item.weight}
                          </p>
                        </div>
                      </div>
                      <span className={`badge${selected ? ' badge-selected' : ''}`}>{selected ? 'Selected' : 'Add'}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : null}
        </section>

        <section className="page-stack">
          <RuleStatus uniqueSpeciesCount={uniqueSpeciesCount} totalWeight={totalWeight} />

          <div className="panel">
            <div className="panel-heading-row compact">
              <h3>Selected Pokemon</h3>
              <button className="btn btn-ghost" onClick={clearSelection} disabled={selectedItems.length === 0}>
                Clear
              </button>
            </div>

            {selectedItems.length === 0 ? (
              <p className="subtle">No pokemon selected yet.</p>
            ) : (
              <ul className="selected-list">
                {selectedItems.map((item) => (
                  <li key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <p className="subtle">{item.speciesName}</p>
                    </div>
                    <span className="badge">{item.weight}</span>
                  </li>
                ))}
              </ul>
            )}

            {submitError ? <div className="alert alert-error alert-inline-gap">{submitError}</div> : null}

            <button className="btn btn-primary full btn-create-list" onClick={handleCreateList} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create List'}
            </button>
          </div>
        </section>
      </div>
    </section>
  )
}