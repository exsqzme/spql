import {makeOperation, makeOperationWithAction} from './helpers'

const LISTS = 'lists'
const makeListOperation = makeOperation(LISTS)
const makeListOperationWithAction = makeOperationWithAction(LISTS)

export const getListCollection = makeListOperation('GetListCollection')
export const getList = makeListOperation('GetList')
export const getListItems = makeListOperation('GetListItems')
export const getListItemsChanges = makeListOperation('GetListItemChangeSinceToken')
export const updateListItems = makeListOperationWithAction('UpdateListItems')