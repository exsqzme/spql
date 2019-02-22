import {createWebService} from '../../utils/soap'

const webService = 'Webs'
const createWebServiceOperation = createWebService(webService)

export const getSubSiteCollection = createWebServiceOperation({name: 'GetAllSubWebCollection', action: false})