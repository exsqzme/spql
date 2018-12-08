import * as Types from './types'
import * as Tags from './tags'
import * as Values from './values'

const toFieldRef = name =>
    `<FieldRef Name="${name}" />`

const toValue = (type = Types.TEXT) =>
    value =>
        `<Value Type="${type}">${value}</Value>`

const TagBuilder = tag => { 
    switch (tag) {
        case Tags.IS_NULL:
        case Tags.IS_NOT_NULL:
            return fieldName =>
                `<${tag}>${toFieldRef(fieldName)}</${tag}>`
        case Tags.IN:
            return (fieldName, values, type) =>
                `<${tag}>${toFieldRef(fieldName)}<Values>${values.map(toValue(type)).join('')}</Values></${tag}>`
        case Tags.EQ:
        case Tags.NEQ:
        case Tags.GT:
        case Tags.LT:
            return (fieldName, value, type) =>
                `<${tag}>${toFieldRef(fieldName) + toValue(type)(value)}</${tag}>`      
    }

    throw new Error(`Invalid Tag Provided: ${tag}`)
}

const Query = query =>
    `<Query><Where>${query}</Where></Query>`

const mapObj = (fn, obj) => {
    let newObj = {}

    for (const [key, value] of Object.entries(obj)) {
        newObj[key] = fn(value)
    }

    return newObj
}

const TagFns = mapObj(TagBuilder, Tags)

const eqUser = userId =>
    fieldRef =>
        TagFns.EQ(fieldRef, userId, Types.INTEGER)

const eqCurrentUser = eqUser(Values.CURRENT_USER)

const CamlBuilder = {
    Types,
    Values,
    ...TagFns,
    Query,
    findItemsFromUser: (id, fieldName) => Query(eqUser(id)(fieldName)),
    findItemsFromCurrentUser: fieldName => Query(eqCurrentUser()(fieldName))
}

export default CamlBuilder