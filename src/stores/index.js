import {createPinia} from "pinia"


const pinia = createPinia()
pinia.use(({store}) => {
    const stored = localStorage.getItem(`camera_manager_${store.$id}`)
    if (stored) {
        try {
            const parse = JSON.parse(stored)
            store.$patch(parse)
        }catch (e){
            console.error("Error: ", e)
        }
    }
    store.$subscribe((mutation, state) =>{
        localStorage.setItem(`camera_manager_${store.$id}`, JSON.stringify(state))
    })
})

export default pinia