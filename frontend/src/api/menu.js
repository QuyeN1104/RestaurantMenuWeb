async function handle(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export async function getCategories() {
  return handle(await fetch('/api/categories/show'))
}

export async function addCategory(name) {
  return handle(await fetch('/api/categories/add', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ name }),
  }))
}

export async function renameCategory(id, name) {
  return handle(await fetch(`/api/categories/${id}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ name }),
  }))
}

export async function deleteCategory(id) {
  await handle(await fetch(`/api/categories/${id}`, { method: 'DELETE' }))
}

export async function addFood(categoryId, payload) {
  return handle(await fetch(`/api/categories/${categoryId}/foods`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  }))
}

export async function updateFood(foodId, payload) {
  return handle(await fetch(`/api/foods/${foodId}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  }))
}

export async function deleteFood(foodId) {
  await handle(await fetch(`/api/foods/${foodId}`, { method: 'DELETE' }))
}
