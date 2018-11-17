import {connectToList} from './lists'

export default {
    connect: siteUrl => ({
        list: connectToList(siteUrl)
    })
}