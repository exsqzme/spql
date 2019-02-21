import {createWebService} from '../../lib/soapUtils'

const webService = 'Webs'
const createWebServiceOperation = createWebService(webService)

export const getSubSiteCollection = createWebServiceOperation({name: 'GetAllSubWebCollection', action: false})