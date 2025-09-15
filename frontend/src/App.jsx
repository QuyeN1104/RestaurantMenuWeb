import { useEffect, useState } from 'react'
import { formatVND } from './utils/format.js'
import {
  getCategories, addCategory, renameCategory, deleteCategory as apiDeleteCategory,
  addFood as apiAddFood, updateFood as apiUpdateFood, deleteFood as apiDeleteFood
} from './api/menu.js'

function App() {
  const [categories, setCategories] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // UI states
  const [addingCatName, setAddingCatName] = useState('')
  const [saving, setSaving] = useState(false)
  const [catEditMode, setCatEditMode] = useState(false)
  const [catEditName, setCatEditName] = useState('')

  const [newFoodName, setNewFoodName] = useState('')
  const [newFoodCost, setNewFoodCost] = useState('')
  const [foodEditingId, setFoodEditingId] = useState(null)
  const [foodEditName, setFoodEditName] = useState('')
  const [foodEditCost, setFoodEditCost] = useState('')

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        setLoading(true)
        const data = await getCategories()
        if (!ignore) {
          setCategories(Array.isArray(data) ? data : [])
          setCurrentIndex(0)
        }
      } catch (e) {
        if (!ignore) setError(e.message || 'Lỗi tải dữ liệu')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  const current = categories[currentIndex]
  const canPrev = currentIndex > 0
  const canNext = currentIndex < Math.max(0, categories.length - 1)

  async function onAddCategory(e) {
    e.preventDefault()
    if (!addingCatName.trim()) return
    try {
      setSaving(true)
      const cat = await addCategory(addingCatName.trim())
      setCategories((prev) => [...prev, cat])
      setAddingCatName('')
      setCurrentIndex(categories.length) // nhảy tới danh mục vừa thêm
    } catch (e) {
      alert(e.message || 'Không thể thêm danh mục')
    } finally {
      setSaving(false)
    }
  }

  function startEditCategory() {
    setCatEditMode(true)
    setCatEditName(current?.name || '')
  }

  function cancelEditCategory() {
    setCatEditMode(false)
    setCatEditName('')
  }

  async function saveEditCategory() {
    if (!current) return
    if (!catEditName.trim()) return
    try {
      setSaving(true)
      const updated = await renameCategory(current.id, catEditName.trim())
      setCategories((prev) =>
        prev.map((c, idx) => (idx === currentIndex ? updated : c))
      )
      setCatEditMode(false)
    } catch (e) {
      alert(e.message || 'Không thể cập nhật danh mục')
    } finally {
      setSaving(false)
    }
  }

  async function onDeleteCategory() {
    if (!current) return
    if (!confirm('Xóa danh mục này? Các món thuộc danh mục cũng sẽ bị xóa.')) return
    try {
      setSaving(true)
      await apiDeleteCategory(current.id)
      setCategories((prev) => {
        const next = prev.filter((_, idx) => idx !== currentIndex)
        return next
      })
      setCurrentIndex((i) => Math.max(0, Math.min(i, categories.length - 2)))
    } catch (e) {
      alert(e.message || 'Không thể xóa danh mục')
    } finally {
      setSaving(false)
    }
  }

  async function onAddFood(e) {
    e.preventDefault()
    if (!current) return
    const name = newFoodName.trim()
    const cost = parseFloat(newFoodCost)
    if (!name || Number.isNaN(cost)) {
      alert('Tên và giá món không hợp lệ')
      return
    }
    try {
      setSaving(true)
      const item = await apiAddFood(current.id, { name, cost })
      setCategories((prev) =>
        prev.map((c, idx) =>
          idx === currentIndex ? { ...c, foods: [...c.foods, item] } : c
        )
      )
      setNewFoodName(''); setNewFoodCost('')
    } catch (e) {
      alert(e.message || 'Không thể thêm món')
    } finally {
      setSaving(false)
    }
  }

  function startEditFood(item) {
    setFoodEditingId(item.id)
    setFoodEditName(item.name)
    setFoodEditCost(String(item.cost))
  }

  function cancelEditFood() {
    setFoodEditingId(null)
    setFoodEditName('')
    setFoodEditCost('')
  }

  async function saveEditFood(id) {
    const name = foodEditName.trim()
    const cost = foodEditCost === '' ? undefined : parseFloat(foodEditCost)
    if (name === '' && cost === undefined) {
      cancelEditFood()
      return
    }
    if (cost !== undefined && Number.isNaN(cost)) {
      alert('Giá món không hợp lệ'); return
    }
    try {
      setSaving(true)
      const updated = await apiUpdateFood(id, { name: name || undefined, cost })
      setCategories((prev) =>
        prev.map((c, idx) =>
          idx === currentIndex
            ? { ...c, foods: c.foods.map((f) => (f.id === id ? updated : f)) }
            : c
        )
      )
      cancelEditFood()
    } catch (e) {
      alert(e.message || 'Không thể cập nhật món')
    } finally {
      setSaving(false)
    }
  }

  async function onDeleteFood(id) {
    if (!confirm('Xóa món này?')) return
    try {
      setSaving(true)
      await apiDeleteFood(id)
      setCategories((prev) =>
        prev.map((c, idx) =>
          idx === currentIndex
            ? { ...c, foods: c.foods.filter((f) => f.id !== id) }
            : c
        )
      )
    } catch (e) {
      alert(e.message || 'Không thể xóa món')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Đang tải menu…</div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Lỗi: {error}</div>
      </main>
    )
  }

  if (!categories.length) {
    return (
      <main className="min-h-screen px-4 py-10">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Form thêm danh mục */}
          <section className="bg-white rounded-xl shadow ring-1 ring-black/5 p-6">
            <h2 className="text-lg font-semibold mb-3">Thêm danh mục</h2>
            <form onSubmit={onAddCategory} className="flex gap-3">
              <input
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Tên danh mục..."
                value={addingCatName}
                onChange={(e) => setAddingCatName(e.target.value)}
              />
              <button
                disabled={saving || !addingCatName.trim()}
                className="px-4 py-2 rounded-md bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40"
              >
                Thêm
              </button>
            </form>
          </section>

          <div className="text-gray-600">Chưa có danh mục nào</div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Form thêm danh mục */}
        <section className="bg-white rounded-xl shadow ring-1 ring-black/5 p-6">
          <h2 className="text-lg font-semibold mb-3">Thêm danh mục</h2>
          <form onSubmit={onAddCategory} className="flex gap-3">
            <input
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Tên danh mục..."
              value={addingCatName}
              onChange={(e) => setAddingCatName(e.target.value)}
            />
            <button
              disabled={saving || !addingCatName.trim()}
              className="px-4 py-2 rounded-md bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40"
            >
              Thêm
            </button>
          </form>
        </section>

        {/* Trang danh mục */}
        <section
          aria-label="menu-page"
          className="relative overflow-hidden rounded-2xl bg-paper-50 ring-1 ring-black/5 shadow"
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/5 to-transparent" />

          {/* Header trang + Sửa/Xóa danh mục */}
          <div className="border-b border-amber-200/60 px-6 py-5 bg-gradient-to-r from-amber-50 to-amber-100">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-200/60 text-amber-900 ring-1 ring-amber-300/60">
                  Danh mục
                </span>
                {!catEditMode ? (
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-amber-900">
                    {current?.name || 'Danh mục'}
                  </h2>
                ) : (
                  <input
                    className="rounded-md border border-amber-300 bg-white/80 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    value={catEditName}
                    onChange={(e) => setCatEditName(e.target.value)}
                  />
                )}
              </div>

              <div className="flex items-center gap-2">
                {!catEditMode ? (
                  <>
                    <button
                      onClick={startEditCategory}
                      className="px-3 py-1.5 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    >
                      Sửa tên
                    </button>
                    <button
                      onClick={onDeleteCategory}
                      className="px-3 py-1.5 rounded-md border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    >
                      Xóa
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      disabled={saving || !catEditName.trim()}
                      onClick={saveEditCategory}
                      className="px-3 py-1.5 rounded-md bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={cancelEditCategory}
                      className="px-3 py-1.5 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Danh sách món */}
          <div className="p-6 md:p-8">
            {current?.foods?.length ? (
              <ul className="divide-y divide-amber-100">
                {current.foods.map((item) => (
                  <li key={item.id} className="py-3">
                    {foodEditingId === item.id ? (
                      <div className="flex items-center gap-3">
                        <input
                          className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                          placeholder="Tên món"
                          value={foodEditName}
                          onChange={(e) => setFoodEditName(e.target.value)}
                        />
                        <input
                          className="w-40 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                          placeholder="Giá"
                          inputMode="decimal"
                          value={foodEditCost}
                          onChange={(e) => setFoodEditCost(e.target.value)}
                        />
                        <button
                          disabled={saving}
                          onClick={() => saveEditFood(item.id)}
                          className="px-3 py-2 rounded-md bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40"
                        >
                          Lưu
                        </button>
                        <button
                          onClick={cancelEditFood}
                          className="px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-4">
                        <span className="text-gray-900 font-medium tracking-tight">
                          {item.name}
                        </span>
                        <span className="ml-auto text-amber-700 font-semibold tabular-nums">
                          {formatVND(item.cost)}
                        </span>
                        <div className="ml-3 flex items-center gap-2">
                          <button
                            onClick={() => startEditFood(item)}
                            className="px-3 py-1.5 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => onDeleteFood(item.id)}
                            className="px-3 py-1.5 rounded-md border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500">Danh mục này chưa có món</div>
            )}

            {/* Form thêm món */}
            <form onSubmit={onAddFood} className="mt-6 flex flex-wrap items-center gap-3">
              <input
                className="flex-1 min-w-[200px] rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Tên món..."
                value={newFoodName}
                onChange={(e) => setNewFoodName(e.target.value)}
              />
              <input
                className="w-48 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Giá"
                inputMode="decimal"
                value={newFoodCost}
                onChange={(e) => setNewFoodCost(e.target.value)}
              />
              <button
                disabled={saving || !newFoodName.trim() || newFoodCost.trim() === ''}
                className="px-4 py-2 rounded-md bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40"
              >
                Thêm món
              </button>
            </form>
          </div>

          {/* Trang số */}
          <div className="px-6 py-3 border-t border-amber-100 bg-white/70 backdrop-blur">
            <div className="text-center text-sm text-gray-500">
              Trang <span className="font-semibold text-gray-700">{currentIndex + 1}</span> / {categories.length}
            </div>
          </div>
        </section>

        {/* Điều hướng */}
        <footer className="flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={!canPrev}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            <span className="text-lg">←</span>
            <span>Trang trước</span>
          </button>
          <button
            onClick={() => setCurrentIndex((i) => Math.min(categories.length - 1, i + 1))}
            disabled={!canNext}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-amber-300 bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40"
          >
            <span>Trang sau</span>
            <span className="text-lg">→</span>
          </button>
        </footer>
      </div>
    </main>
  )
}

export default App
