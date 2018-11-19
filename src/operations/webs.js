import {WEBS} from './webServices'
import {makeOperation} from './helpers'

const makeWebsOperation = makeOperation(WEBS)

export const getSubSiteCollection = makeWebsOperation('GetAllSubWebCollection')