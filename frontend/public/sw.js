const CACHE = 'resqbridge-v3'
const ASSETS = ['/', '/offline']
const DB_NAME = 'resqbridge-offline'
const DB_VERSION = 1

self.addEventListener('install', (e) => {
  self.skipWaiting()
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    Promise.all([
      caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
      initDB(),
    ])
  )
  self.clients.claim()
})

function initDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('queue')) {
        db.createObjectStore('queue', { keyPath: 'id', autoIncrement: true })
      }
    }
    req.onsuccess = () => { req.result.close(); resolve() }
    req.onerror = () => reject(req.error)
  })
}

self.addEventListener('fetch', (e) => {
  const { method, url } = e.request

  if (method !== 'GET') {
    if (navigator.onLine === false) {
      e.respondWith(
        (async () => {
          const clone = e.request.clone()
          const body = await clone.json().catch(() => ({}))
          await addToQueue({ url, method, body, headers: Object.fromEntries(e.request.headers) })
          return new Response(JSON.stringify({ queued: true }), {
            status: 202,
            headers: { 'Content-Type': 'application/json' },
          })
        })()
      )
    }
    return
  }

  if (url.includes('/api/')) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({ offline: true }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    )
    return
  }

  if (url.includes('/assets/')) {
    e.respondWith(
      caches.match(e.request).then((cached) => cached || fetch(e.request).then((res) => {
        const copy = res.clone()
        caches.open(CACHE).then((c) => c.put(e.request, copy))
        return res
      }))
    )
    return
  }

  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)))
})

self.addEventListener('push', (e) => {
  if (!e.data) return
  try {
    const { title, body, url } = e.data.json()
    e.waitUntil(
      self.registration.showNotification(title || 'ResQBridge', {
        body: body || '',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        data: { url },
        vibrate: [200, 100, 200],
      })
    )
  } catch {}
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const url = e.notification.data?.url || '/'
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsList) => {
      const existing = clientsList.find((c) => c.url.includes(url) && 'focus' in c)
      if (existing) return existing.focus()
      return clients.openWindow(url)
    })
  )
})

self.addEventListener('sync', (e) => {
  if (e.tag === 'sync-queue') {
    e.waitUntil(processQueue())
  }
})

async function addToQueue(item) {
  const db = await openDB()
  const tx = db.transaction('queue', 'readwrite')
  tx.objectStore('queue').add({ ...item, createdAt: Date.now() })
  await tx.done
  db.close()
  if ('sync' in self.registration) {
    await self.registration.sync.register('sync-queue').catch(() => {})
  }
}

async function processQueue() {
  const db = await openDB()
  const tx = db.transaction('queue', 'readwrite')
  const store = tx.objectStore('queue')
  const all = await store.getAll()
  for (const item of all) {
    try {
      await fetch(item.url, {
        method: item.method || 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.body),
      })
      await store.delete(item.id)
    } catch {}
  }
  await tx.done
  db.close()
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}
