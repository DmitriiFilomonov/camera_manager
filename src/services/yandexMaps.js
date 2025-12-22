let ymapsPromise = null

export async function loadYandexMaps() {
    if (window.ymaps) {
        return window.ymaps
    }

    if (!ymapsPromise) {
        ymapsPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script')
            const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY

            script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`
            script.async = true

            script.onload = () => {
                window.ymaps.ready(() => {
                    resolve(window.ymaps)
                })
            }

            script.onerror = () => {
                ymapsPromise = null
                reject(new Error('Failed to load Yandex Maps'))
            }

            document.head.appendChild(script)
        })
    }

    return ymapsPromise
}

export function createPlacemark(coordinates, options = {}) {
    return new window.ymaps.Placemark(coordinates, {
        hintContent: options.hint || '',
        balloonContent: options.balloon || ''
    }, {
        preset: options.preset || 'islands#circleIcon',
        iconColor: options.color || '#1976d2'
    })
}