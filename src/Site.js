import {makeSoap} from './makeSoap'
import { getListCollection } from './operations/lists'
import { listCollectionToJson } from './helpers/xml'

const Site = siteUrl => {

    const listsFromSite = () => makeSoap(siteUrl, getListCollection)
        .then(listCollectionToJson)

    return {
        listsFromSite
    }
}

export default Site