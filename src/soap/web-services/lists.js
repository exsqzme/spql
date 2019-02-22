import {createWebService} from '../../utils/soap'

const webService = 'lists'
const createWebServiceOperation = createWebService(webService)

export const getListCollection = createWebServiceOperation({name: 'GetListCollection', action: false})
export const getList = createWebServiceOperation({name: 'GetList', action: false})
export const getListItems = createWebServiceOperation({name: 'GetListItems', action: false})
export const getListItemsChanges = createWebServiceOperation({name: 'GetListItemChangesSinceToken', action: false})
export const updateListItems = createWebServiceOperation({name: 'UpdateListItems', action: true})