import {makeSoap} from './makeSoap'
import { getListCollection } from './operations/lists'
import { listCollectionToJson } from './xml/helpers'

export const listCollection = siteUrl => {
    return makeSoap(siteUrl, getListCollection)
        .then(listCollectionToJson)
}