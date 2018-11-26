import {makeSoap} from './makeSoap'
import { getListCollection } from './operations/lists'
import { listCollectionXmlToJson } from './helpers/xml'

const SiteServices = siteUrl => {

    const getListCollectionInfo = () => makeSoap(siteUrl, getListCollection)
        .then(listCollectionXmlToJson)

    return {
        getListCollectionInfo
    }
}

export default SiteServices