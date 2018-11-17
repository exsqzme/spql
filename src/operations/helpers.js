const operationMaker = action =>
    service =>
        (name, additionalHeader = '') => ({
            name,
            service,
            action,
            additionalHeader
        })

export const makeOperation = operationMaker(false)
export const makeOperationWithAction = operationMaker(true)