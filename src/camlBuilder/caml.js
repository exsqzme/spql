import * as Types from './types'
import * as Tags from './tags'
import * as Values from './values'

const toFieldRef = name =>
    `<FieldRef Name="${name}" />`
const toValue = (type = Types.TEXT) =>
    value =>
        `<Value Type="${type}">${value}</Value>`

const toQuery = query =>
    `<Query><Where>${query}</Where></Query>`

const tagBuilder = tag => { 
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

const eqUser = userId =>
    fieldRef =>
        tagBuilder(Tags.EQ)(fieldRef, userId, Types.INTEGER)

const eqCurrentUser = eqUser(Values.CURRENT_USER)

const CamlBuilder = {
    Types,
    Values,
    Tags,
    tagBuilder,
    toQuery,
    findItemsFromUser: (id, fieldName) => toQuery(eqUser(id)(fieldName)),
    findItemsFromCurrentUser: fieldName => toQuery(eqCurrentUser()(fieldName))
}

export default CamlBuilder