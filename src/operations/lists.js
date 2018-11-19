import {LISTS} from './webServices'
import {makeOperation, makeOperationWithAction} from './helpers'

const makeListOperation = makeOperation(LISTS)
const makeListOperationWithAction = makeOperationWithAction(LISTS)

export const getListCollection = makeListOperation('GetListCollection')
export const getList = makeListOperation('GetList')
export const getListItems = makeListOperation('GetListItems')
export const updateListItems = makeListOperationWithAction('UpdateListItems')