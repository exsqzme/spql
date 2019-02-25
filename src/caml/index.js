import * as Types from "./types"
import * as Tags from "./tags"
import * as Values from "./values"

const toFieldRef = (properties = {}) => {
  const fieldRefProps = Object.keys(properties).map(
    prop => `${prop}="${properties[prop]}"`
  )

  return `<FieldRef ${fieldRefProps.join(" ")} />`
}

const toNameFieldRef = staticName => {
  const props = { Name: staticName }
  return toFieldRef(props)
}

const toValue = (type = Types.TEXT) => value =>
  `<Value Type="${type}">${value}</Value>`

const TagBuilder = tag => {
  switch (tag) {
    case Tags.AND:
    case Tags.OR:
      return (childTag1, childTag2) =>
        `<${tag}>${childTag1}${childTag2}</${tag}>`
    case Tags.IS_NULL:
    case Tags.IS_NOT_NULL:
      return staticName => `<${tag}>${toNameFieldRef(staticName)}</${tag}>`
    case Tags.IN:
    case Tags.EQ:
    case Tags.NEQ:
    case Tags.GT:
    case Tags.LT:
    case Tags.GEQ:
    case Tags.LEQ:
    case Tags.CONTAINS:
      return ({ staticName, value, type, byId = false }) => {
        let fieldProps = { Name: staticName }
        if (type === "Lookup") {
          fieldProps["LookupId"] = byId ? "TRUE" : "FALSE"
        }
        let camlField = toFieldRef(fieldProps)

        const toValueWithType = toValue(type)
        // TODO: value array only compatible with IN tag
        const camlValue = Array.isArray(value)
          ? `<Values>${value.map(toValueWithType).join("")}</Values`
          : toValueWithType(value)

        return `<${tag}>${camlField + camlValue}</${tag}>`
      }
  }

  throw new Error(`Invalid Tag Provided: ${tag}`)
}

const withOrder = fields => {
  if (!Array.isArray(fields)) {
    fields = [fields]
  }

  const fieldArray = fields.map(f => {
    let fieldProps
    if (typeof f === "string") {
      fieldProps = { Name: f, Ascending: "TRUE" }
    } else {
      fieldProps = {
        Name: f.staticName,
        Ascending:
          typeof f.isAscending === "boolean" && !f.isAscending
            ? "FALSE"
            : "TRUE"
      }
    }
    return toFieldRef(fieldProps)
  })

  return `<OrderBy>${fieldArray.join("")}</OrderBy>`
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

const eqUser = userId => field =>
  TagFns.EQ({ field, value: userId, type: Types.INTEGER })

const Caml = {
  Types,
  Values,
  ...TagFns,
  EQ_USER: (field, userId) => eqUser(userId)(field),
  EQ_CURRENT_USER: field => eqUser(Values.CURRENT_USER)(field)
}

export default Caml
