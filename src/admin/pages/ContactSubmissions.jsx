import { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../../firebase/config'

const formatDate = (value) => {
  if (!value) return 'Pending'
  const date = value.toDate ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return 'Pending'

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

const truncateText = (value, maxLength = 42) => {
  if (!value) return '-'
  return value.length > maxLength ? `${value.slice(0, maxLength).trim()}...` : value
}

const ContactSubmissions = () => {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkDeleting, setBulkDeleting] = useState(false)

  useEffect(() => {
    setLoading(true)
    const submissionsQuery = query(
      collection(db, 'contact_submissions'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      submissionsQuery,
      (snapshot) => {
        setSubmissions(snapshot.docs.map((submissionDoc) => ({
          id: submissionDoc.id,
          ...submissionDoc.data()
        })))
        setLoading(false)
        setRefreshing(false)
      },
      (snapshotError) => {
        setError(snapshotError.message || 'Failed to load contact submissions.')
        setLoading(false)
        setRefreshing(false)
      }
    )

    return unsubscribe
  }, [reloadKey])

  const handleRefresh = () => {
    setRefreshing(true)
    setReloadKey((value) => value + 1)
  }

  const handleDelete = async (submissionId) => {
    if (!window.confirm('Delete this contact submission?')) return

    setDeletingId(submissionId)
    try {
      await deleteDoc(doc(db, 'contact_submissions', submissionId))
      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission(null)
      }
      setSelectedIds((ids) => ids.filter((id) => id !== submissionId))
    } catch (deleteError) {
      alert('Failed to delete submission.')
    } finally {
      setDeletingId('')
    }
  }

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredSubmissions = normalizedSearch
    ? submissions.filter((submission) => [
        submission.name,
        submission.email,
        submission.phone,
        submission.subject,
        submission.message
      ].some((value) => String(value || '').toLowerCase().includes(normalizedSearch)))
    : submissions

  const filteredIds = filteredSubmissions.map((submission) => submission.id)
  const selectedVisibleCount = filteredIds.filter((id) => selectedIds.includes(id)).length
  const allVisibleSelected = filteredIds.length > 0 && selectedVisibleCount === filteredIds.length

  const handleToggleSelectAll = () => {
    setSelectedIds((ids) => {
      if (allVisibleSelected) {
        return ids.filter((id) => !filteredIds.includes(id))
      }

      return Array.from(new Set([...ids, ...filteredIds]))
    })
  }

  const handleToggleSelect = (submissionId) => {
    setSelectedIds((ids) => (
      ids.includes(submissionId)
        ? ids.filter((id) => id !== submissionId)
        : [...ids, submissionId]
    ))
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (!window.confirm(`Delete ${selectedIds.length} selected contact submission${selectedIds.length === 1 ? '' : 's'}?`)) return

    setBulkDeleting(true)
    try {
      await Promise.all(selectedIds.map((submissionId) => (
        deleteDoc(doc(db, 'contact_submissions', submissionId))
      )))
      if (selectedSubmission && selectedIds.includes(selectedSubmission.id)) {
        setSelectedSubmission(null)
      }
      setSelectedIds([])
    } catch (deleteError) {
      alert('Failed to delete selected submissions.')
    } finally {
      setBulkDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading contact submissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Contact Submissions</h1>
          <p className="text-gray-400">Messages submitted from the portfolio contact form.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6M20 9A8 8 0 006.34 5.34L4 7.68M4 15a8 8 0 0013.66 3.66L20 16.32" />
            </svg>
            {refreshing ? 'Refreshing' : 'Refresh'}
          </button>
          <div className="px-4 py-2 border border-gray-800 bg-gray-950 text-gray-300 text-sm">
            {submissions.length} total
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full sm:max-w-md">
          <svg className="absolute left-4 top-1/2 w-4 h-4 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.1-5.4a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
          </svg>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search messages..."
            className="w-full border border-gray-800 bg-gray-950 py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-gray-600"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {selectedIds.length > 0 && (
            <>
              <span className="text-gray-400 text-sm">{selectedIds.length} selected</span>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="px-4 py-3 border border-red-500/30 text-red-300 text-sm hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {bulkDeleting ? 'Deleting...' : 'Delete Selected'}
              </button>
            </>
          )}
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="px-4 py-3 border border-gray-800 text-gray-300 text-sm hover:bg-gray-900 transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      </div>

      <div className="border border-gray-800 bg-gray-950 overflow-hidden">
        {submissions.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-white font-medium mb-2">No submissions yet</p>
            <p className="text-gray-500 text-sm">New contact form responses will appear here.</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-white font-medium mb-2">No matching submissions</p>
            <p className="text-gray-500 text-sm">Try another name, email, subject, phone, or message keyword.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left">
              <thead className="bg-black border-b border-gray-800">
                <tr>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={handleToggleSelectAll}
                      className="h-4 w-4 accent-white"
                      aria-label="Select all visible submissions"
                    />
                  </th>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Date</th>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Name</th>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Email</th>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Subject</th>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-900/70 transition-colors">
                    <td className="px-4 py-4 align-top">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(submission.id)}
                        onChange={() => handleToggleSelect(submission.id)}
                        className="h-4 w-4 accent-white"
                        aria-label={`Select ${submission.name || 'submission'}`}
                      />
                    </td>
                    <td className="px-4 py-4 align-top text-sm text-gray-400 whitespace-nowrap">
                      {formatDate(submission.createdAt)}
                    </td>
                    <td className="px-4 py-4 align-top text-sm font-medium text-white max-w-[160px]">
                      <p className="truncate" title={submission.name || ''}>{truncateText(submission.name, 26)}</p>
                    </td>
                    <td className="px-4 py-4 align-top text-sm max-w-[220px]">
                      {submission.email ? (
                        <a href={`mailto:${submission.email}`} className="block truncate text-blue-300 hover:text-blue-200" title={submission.email}>
                          {truncateText(submission.email, 34)}
                        </a>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-4 align-top text-sm text-gray-200 max-w-md">
                      <p className="truncate" title={submission.subject || ''}>{truncateText(submission.subject, 72)}</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedSubmission(submission)}
                          className="px-3 py-2 border border-gray-700 text-gray-200 text-sm hover:bg-gray-800 transition-colors"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(submission.id)}
                          disabled={deletingId === submission.id}
                          className="px-3 py-2 border border-red-500/30 text-red-300 text-sm hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {deletingId === submission.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-2xl border border-gray-800 bg-gray-950">
            <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Contact Message</h2>
                <p className="text-gray-500 text-sm">{formatDate(selectedSubmission.createdAt)}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="w-9 h-9 border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
                aria-label="Close"
              >
                X
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Name</p>
                  <p className="text-white break-words">{selectedSubmission.name || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Email</p>
                  {selectedSubmission.email ? (
                    <a href={`mailto:${selectedSubmission.email}`} className="text-blue-300 hover:text-blue-200 break-words">
                      {selectedSubmission.email}
                    </a>
                  ) : (
                    <p className="text-white">-</p>
                  )}
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Phone</p>
                  <p className="text-white break-words">{selectedSubmission.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Subject</p>
                  <p className="text-white break-words">{selectedSubmission.subject || '-'}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Message</p>
                <div className="border border-gray-800 bg-black p-4 text-gray-200 whitespace-pre-wrap break-words">
                  {selectedSubmission.message || '-'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-800 px-6 py-4">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 border border-gray-700 text-gray-200 hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleDelete(selectedSubmission.id)}
                disabled={deletingId === selectedSubmission.id}
                className="px-4 py-2 border border-red-500/30 text-red-300 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deletingId === selectedSubmission.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContactSubmissions
