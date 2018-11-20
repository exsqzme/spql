import {makeSoap} from './makeSoap'
import { getListCollection } from './operations/lists'
import { listCollectionXmlToJson } from './helpers/xml'

const SiteServices = siteUrl => {

    const listsFromSite = () => makeSoap(siteUrl, getListCollection)
        .then(listCollectionXmlToJson)

    return {
        listsFromSite
    }
}

export default SiteServices