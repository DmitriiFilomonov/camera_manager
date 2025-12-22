export function formatDate(dateString) {
    if (!dateString) return ''
    return dateString
}
export function filterDevices(devices, groups, query) {
    const lowerQuery = query.toLowerCase()

    if (!lowerQuery) return { filteredGroups: groups, filteredUngrouped: [] }
    const filteredGroups = groups.map(group => ({
        ...group,
        deviceIds: group.deviceIds.filter(deviceId => {
            const device = devices[deviceId]
            return device && (
                device.name.toLowerCase().includes(lowerQuery) ||
                device.id.toString().includes(lowerQuery)
            )
        })
    })).filter(group => group.deviceIds.length > 0)
    const allDeviceIds = Object.keys(devices).map(Number)
    const groupedDeviceIds = new Set(groups.flatMap(g => g.deviceIds))
    const ungroupedDeviceIds = Array.from(allDeviceIds).filter(id => !groupedDeviceIds.has(id))

    const filteredUngrouped = ungroupedDeviceIds.filter(deviceId => {
        const device = devices[deviceId]
        return device && (
            device.name.toLowerCase().includes(lowerQuery) ||
            device.id.toString().includes(lowerQuery)
        )
    })

    return { filteredGroups, filteredUngrouped }
}