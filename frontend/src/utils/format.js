export function formatVND(value) {
    if(typeof value != 'number') {
        const num = Number(value)
        if (Number.isNaN(num)) return ''
        return new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(num)

    }
    return new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(value)
}