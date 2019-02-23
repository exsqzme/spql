import * as Types from './types'
import * as Tags from './tags'
import * as Values from './values'

const toFieldRef = (properties = []) => {
    const fieldRefProps = properties.map(p => `${p.name}="${p.value}"`)

    return `<FieldRef ${fieldRefProps.join(" ")} />`
}

const toNameFieldRef = name => {
    const props = [{ name: 'Name', value: name }]
    return toFieldRef(props)
}

const toValue = (type = Types.TEXT) =>
    value =>
        `<Value Type="${type}">${value}</Value>`

const TagBuilder = tag => {
    switch (tag) {
        case Tags.AND:
        case Tags.OR:
            return (childTag1, childTag2) => `<${tag}>${childTag1}${childTag2}</${tag}>`
        case Tags.IS_NULL:
        case Tags.IS_NOT_NULL:
            return field =>
                `<${tag}>${toNameFieldRef(field)}</${tag}>`
        case Tags.IN:
        case Tags.EQ:
        case Tags.NEQ:
        case Tags.GT:
        case Tags.LT:
        case Tags.GEQ:
        case Tags.LEQ:
        case Tags.CONTAINS:
            return ({ field, value, type, byId = false }) => {
                let fieldProps = [{ name: "Name", value: field }]
                if (type === "Lookup") {
                    fieldProps.push({ name: "LookupId", value: byId ? "TRUE" : "FALSE" })
                }
                let camlField = toFieldRef(fieldProps)

                const toValueWithType = toValue(type)
                const camlValue = Array.isArray(value)
                    ? `<Values>${values.map(toValueWithType).join("")}</Values`
                    : toValueWithType(value)

                return `<${tag}>${camlField + camlValue}</${tag}>`
            }
    }

    throw new Error(`Invalid Tag Provided: ${tag}`)
}

const withOrder = fields => {
    if (!Array.isArray(fields)) [
        fields = [fields]
    ]

    const fieldArray = fields.map(f => {
        if (typeof fields === 'string') {
            return {Name: f, Ascending: "TRUE"}
        }

        return {
            Name: f.name,
            Ascending: (typeof f.isAscending === 'boolean' && !f.isAscending) ? 'FALSE' : 'TRUE'
        }
    })

    return `<OrderBy>${toFieldRef(fieldArray)}</OrderBy>`
}

export const toCaml = (query, orderBy = "") =>
    `<Query><Where>${query}</Where>${orderBy && withOrder(orderBy)}</Query>`

const mapObj = (fn, obj) => {
    let newObj = {}

    for (const key in obj) {
        newObj[key] = fn(obj[key])
    }

    return newObj
}

const TagFns = mapObj(TagBuilder, Tags)

const eqUser = userId =>
    field =>
        TagFns.EQ({ field, value: userId, type: Types.INTEGER })

const Caml = {
    Types,
    Values,
    ...TagFns,
    EQ_USER: (field, userId) => eqUser(userId)(field),
    EQ_CURRENT_USER: (field) => eqUser(Values.CURRENT_USER)(field),
}

export default Caml