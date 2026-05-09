import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { downloadExportedPokemonList, getPokemonListById } from '../api/pokemonLists'
import { RuleStatus } from '../components/RuleStatus'
import type { PokemonListDetails } from '../types/pokemon'

function formatDate(dateIso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateIso))
}

export function PokemonListDetailsPage() {
  const { id } = useParams()
  const [list, setList] = useState<PokemonListDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!id) {
      setError('List id is missing')
      setLoading(false)
      return
    }

    void loadList(id)
  }, [id])

  async function loadList(listId: string) {
    setLoading(true)
    setError(null)

    try {
      const response = await getPokemonListById(listId)
      setList(response)
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Unable to load list details'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDownload() {
    if (!id || !list) {
      return
    }

    setDownloading(true)
    setError(null)

    try {
      const file = await downloadExportedPokemonList(id)
      const url = window.URL.createObjectURL(file)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${list.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'pokemon-list'}.json`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(url)
    } catch (downloadError) {
      const message = downloadError instanceof Error ? downloadError.message : 'Unable to download export file'
      setError(message)
    } finally {
      setDownloading(false)
    }
  }

  const sortedItems = useMemo(() => {
    if (!list) {
      return []
    }

    return [...list.items].sort((a, b) => b.weight - a.weight)
  }, [list])

  return (
    <section className="page-stack">
      <div className="panel panel-heading-row">
        <div>
          <h2>{list?.name || 'List Details'}</h2>
          {list ? <p className="subtle">Updated {formatDate(list.updatedAt)}</p> : null}
        </div>

        <div className="row-actions">
          <button className="btn btn-ghost" onClick={handleDownload} disabled={downloading || !list}>
            {downloading ? 'Exporting...' : 'Export JSON'}
          </button>
          <Link className="btn btn-secondary" to="/pokemon-lists">
            Back to Lists
          </Link>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <div className="panel">Loading list details...</div> : null}

      {!loading && list ? (
        <>
          <RuleStatus uniqueSpeciesCount={list.uniqueSpeciesCount} totalWeight={list.totalWeight} />

          <div className="panel">
            <h3>Pokemon in this list</h3>
            <ul className="selected-list detailed">
              {sortedItems.map((item) => (
                <li key={`${item.pokemonId}-${item.name}`}>
                  <div className="pokemon-main">
                    {item.spriteUrl ? <img src={item.spriteUrl} alt={item.name} width={56} height={56} /> : null}
                    <div>
                      <strong>{item.name}</strong>
                      <p className="subtle">species: {item.speciesName}</p>
                    </div>
                  </div>
                  <span className="badge">weight {item.weight}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
    </section>
  )
}