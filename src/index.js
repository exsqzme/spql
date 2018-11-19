import {connectToList} from './list'
import {listCollection} from './site'

export default {
    connect: siteUrl => ({
        list: connectToList(siteUrl),
        listCollection
    })
}