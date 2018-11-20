import {connectToList} from './List'
import Site from './Site'
import User from './User'
import CamlBuilder from './camlBuilder/caml'

const spql = {
    connect: siteUrl => ({
        list: connectToList(siteUrl),
        ...Site(siteUrl),
        ...User(siteUrl)
    }),
    CamlBuilder
}

export default spql