export const loadYandexMaps = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.src = `https://api-maps.yandex.ru/2.1/?apikey=${import.meta.env.VITE_YANDEX_MAPS_API_KEY}&lang=ru_RU`
        script.async = true

        script.onload = () => {
            if (window.ymaps && window.ymaps.ready) {
                window.ymaps.ready(() => {
                    console.log('✅ Яндекс.Карты 2.1 загружены успешно')
                    resolve(window.ymaps)
                })
            } else {
                resolve(null)
            }
        }

        script.onerror = () => {
            console.error('Ошибка загрузки Яндекс.Карт')
            resolve(null)
        }

        document.head.appendChild(script)
    })
}