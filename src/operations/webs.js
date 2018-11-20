import {makeOperation} from './helpers'

const WEBS = 'Webs'
const makeWebsOperation = makeOperation(WEBS)

export const getSubSiteCollection = makeWebsOperation('GetAllSubWebCollection')