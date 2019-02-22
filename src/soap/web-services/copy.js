import {createWebService} from '../../utils/soap'

const webService = 'Copy'
const createWebServiceOperation = createWebService(webService)

export const addDocument = createWebServiceOperation({name: 'CopyIntoItems', action: true})