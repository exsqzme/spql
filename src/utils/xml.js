import * as Types from "../caml/types"

const specialCharacterToEscapedCharacter = {
  "&": "&amp;",
  '"': "&quot;",
  "<": "&lt;",
  ">": "&gt;"
}

const escapedCharacterToSpecialCharacter = {
  "&amp;": "&",
  "&quot;": '"',
  "&lt;": "<",
  "&gt;": ">"
}

export const encodeXml = string =>
  string.replace(
    /([&"<>])/g,
    (str, item) => specialCharacterToEscapedCharacter[item]
  )

export const decodeXml = string =>
  string.replace(
    /(&quot;|&lt;|&gt;|&amp;)/g,
    (str, item) => escapedCharacterToSpecialCharacter[item]
  )

/* Taken from http://dracoblue.net/dev/encodedecode-special-xml-characters-in-javascript/155/ */

export const escapeColumnValue = s =>
  typeof s === "string" ? s.replace(/&(?![a-zA-Z]{1,8};)/g, "&amp;") : s

const processXml = (mapFn, selector) => xml =>
  Array.prototype.slice.call(xml.querySelectorAll(selector)).map(mapFn)

export const updateListItemsXmlToJson = xml => {
  const selector = "Result"
  const mapFn = node => {
    const itemNode = node.querySelector("row")
    const errorCodeNode = node.querySelector("ErrorCode")
    const errorTextNode = node.querySelector("ErrorText")

    return {
      id: itemNode && itemNode.getAttribute("ows_ID"),
      success: errorCodeNode.textContent === "0x00000000" || !errorTextNode,
      error:
        errorTextNode &&
        errorTextNode.textContent.replace(/[\n\r]+|[\s]{2,}/g, " ").trim()
    }
  }

  return processXml(mapFn, selector)(xml)
}

export const getListItemsXmlToJson = fieldMap => {
  const selector = "row"
  const mapFn = node => {
    return fieldMap.reduce((props, { staticName, alias, type }) => {
      const stringValue = node.getAttribute(`ows_${staticName}`)
      props[alias || staticName] = processStringValueByType(stringValue, type)
      return props
    }, {})
  }

  return processXml(mapFn, selector)
}

const processStringValueByType = (stringValue, type) => {
  switch (type) {
    case Types.BOOLEAN:
      return stringValue === "1" || (stringValue === "0" ? false : null)
    case Types.MULTICHOICE:
      return stringValue
        ? stringValue.slice(2, stringValue.length - 2).split(";#")
        : []
    case Types.USER:
    case Types.LOOKUP:
      return stringValue
        ? stringValue.split(";#").reduce((id, value) => ({ id, value }))
        : null
    case Types.USERMULTI:
    case Types.LOOKUPMULTI:
      return stringValue
        ? stringValue.split(";#").reduce((acc, val, i) => {
            if (i % 2) {
              acc[acc.length - 1].value = val
            } else {
              acc.push({ id: val })
            }
            return acc
          }, [])
        : []
    default:
      return stringValue
  }
}

export const listInfoXmlToJson = xml => {
  const selector = "Fields > Field"
  const mapFn = node => {
    let field = {
      displayName: node.getAttribute("DisplayName"),
      staticName: node.getAttribute("StaticName"),
      description: node.getAttribute("Description"),
      type: node.getAttribute("Type"),
      isHidden: node.getAttribute("Hidden") === "TRUE",
      isReadOnly: node.getAttribute("ReadOnly") === "TRUE",
      isFormBaseType: node.getAttribute("FromBaseType") === "TRUE"
    }

    if (/choice/i.test(field.type)) {
      field.choices = choicesXmlToJson(node)
    } else if (/lookup/i.test(field.type)) {
      field.lookup = {
        webId: node.getAttribute("WebId"),
        listId: node.getAttribute("List"),
        fieldName: node.getAttribute("ShowField")
      }
    }
    return field
  }
  return {
    ...listCollectionXmlToJson(xml)[0],
    fields: processXml(mapFn, selector)(xml)
  }
}

const choicesXmlToJson = xml => {
  const selector = "CHOICE"
  const mapFn = node => ({
    value: node.textContent,
    displayValue: node.textContent
  })

  return processXml(mapFn, selector)(xml)
}

export const listCollectionXmlToJson = processXml(
  node => ({
    id: node.getAttribute("ID"),
    name: node.getAttribute("Title"),
    siteUrl: node.getAttribute("WebFullUrl"),
    description: node.getAttribute("Description"),
    createdBy: node.getAttribute("Author"),
    created: node.getAttribute("Created"),
    modified: node.getAttribute("Modified"),
    itemCount: node.getAttribute("ItemCount"),
    defaultViewUrl: node.getAttribute("DefaultViewUrl"),
    isDocumentList: node.getAttribute("BaseType") === "1",
    isHidden: node.getAttribute("Hidden") === "True"
  }),
  "List"
)

export const groupsXmlToJson = processXml(
  node => ({
    id: node.getAttribute("ID"),
    name: node.getAttribute("Name"),
    description: node.getAttribute("Description")
  }),
  "Group"
)

export const usersXmlToJson = processXml(
  node => ({
    id: node.getAttribute("ID"),
    name: node.getAttribute("Name"),
    account: node.getAttribute("LoginName"),
    email: node.getAttribute("Email")
  }),
  "User"
)

export const uploadDocumentXmlToJson = processXml(node => {
  const errorCode = node.getAttribute("ErrorCode")
  const success = errorCode === "Success"

  return {
    success,
    error: !success ? errorCode : null
  }
}, "CopyResult")
