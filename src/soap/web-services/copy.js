import {createWebService} from '../../lib/soapUtils'

const webService = 'Copy'
const createWebServiceOperation = createWebService(webService)

export const addDocument = createWebServiceOperation({name: 'CopyIntoItems', action: true})