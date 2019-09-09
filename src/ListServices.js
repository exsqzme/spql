import { makeSoap } from "./soap/makeSoap"
import {
  updateListItems,
  getListItems,
  getListItemsChanges,
  getList
} from "./soap/web-services/lists"
import {
  encodeXml,
  listInfoXmlToJson,
  updateListItemsXmlToJson,
  getListItemsXmlToJson,
  getListItemsXmlTransformInPlace
} from "./utils/xml"
import Caml, { toCaml } from "./caml"

const generateQueryOptions = options => {
  const DEFAULT_QUERY_OPTIONS = `<ViewAttributes Scope="RecursiveAll" />
    <IncludeMandatoryColumns>FALSE</IncludeMandatoryColumns>
    <ViewFieldsOnly>TRUE</ViewFieldsOnly>`

  return `<QueryOptions>
      ${options || DEFAULT_QUERY_OPTIONS}
    </QueryOptions>`
}

export const connectToList = siteUrl => listName => {
  listName = encodeXml(listName)

  const soapUpdate = batchCmd => items => {
    const requestOptions = {
      listName,
      batchCmd,
      items: Array.isArray(items) ? items : [items]
    }

    return makeSoap(siteUrl, updateListItems, requestOptions)
      .then(updateListItemsXmlToJson)
      .then(result => (Array.isArray(items) ? result : result[0]))
  }

  const soapGet = (select, query, options = {}) => {
    const getOperation = options.withChanges
      ? getListItemsChanges
      : getListItems

    if (!Array.isArray(select)) {
      select = [select]
    }

    const fieldMap = select.map(selected => {
      if (typeof selected === "string") {
        return { staticName: selected }
      } else {
        return selected
      }
    })

    const requestOptions = {
      listName,
      viewFields: transformSelectedFieldsToViewFields(fieldMap),
      query,
      queryOptions: generateQueryOptions(options.queryOptions),
      rowLimit: options.rowLimit || 0,
      ...(options.changeToken && { changeToken: options.changeToken })
    }

    return makeSoap(siteUrl, getOperation, requestOptions).then(xml => {
      if (options.xml) {
        const transformXml = select.some(s => typeof s === "object")
        return transformXml
          ? getListItemsXmlTransformInPlace(fieldMap)(xml)
          : xml
      }
      return getListItemsXmlToJson(fieldMap, options.calcFields)(xml)
    })
  }

  const all = ({ select, orderBy, maxResults, calcFields, queryOptions }) => {
    const query = toCaml(Caml.IS_NOT_NULL("ID"), orderBy)

    return soapGet(select, query, {
      rowLimit: maxResults,
      calcFields,
      queryOptions
    })
  }

  const find = ({
    select,
    where,
    orderBy,
    maxResults,
    calcFields,
    queryOptions
  }) => {
    const query = toCaml(where, orderBy)

    return soapGet(select, query, {
      rowLimit: maxResults,
      calcFields,
      queryOptions
    })
  }

  const xmlFind = ({ select, where, orderBy, maxResults, queryOptions }) => {
    const query = toCaml(where, orderBy)

    return soapGet(select, query, {
      rowLimit: maxResults,
      xml: true,
      queryOptions
    })
  }

  const findById = ({ select, id, calcFields, queryOptions }) => {
    const query = toCaml(
      Caml.EQ({ staticName: "ID", value: id, type: Caml.Types.COUNTER })
    )
    return soapGet(select, query, { calcFields, queryOptions }).then(
      ([result]) => result
    )
  }

  const findOne = ({ select, where, calcFields, queryOptions }) => {
    const query = toCaml(where)
    return soapGet(select, query, {
      rowLimit: 1,
      calcFields,
      queryOptions
    }).then(([result]) => result)
  }

  const create = soapUpdate("New")

  const updateById = (id, updates) => {
    const items = { ID: id, ...updates }
    return soapUpdate("Update")(items)
  }

  const deleteById = id => {
    const items = { ID: id }
    return soapUpdate("Delete")(items)
  }

  const soapInfo = (options = {}) =>
    makeSoap(siteUrl, getList, { listName }).then(xml =>
      options.xml ? xml : listInfoXmlToJson(xml)
    )

  const count = where => {
    let resultPromise
    let selector

    if (where) {
      const query = toCaml(where)
      resultPromise = soapGet(["ID"], query, { xml: true })
      selector = "data"
    } else {
      resultPromise = soapInfo({ xml: true })
      selector = "List"
    }

    return resultPromise.then(xml => {
      const itemCount = xml.querySelector(selector).getAttribute("ItemCount")
      return itemCount ? parseInt(itemCount) : 0
    })
  }

  const getSchema = () => soapInfo()

  return {
    getSchema,
    count,
    all,
    find,
    xmlFind,
    findById,
    findOne,
    create,
    updateById,
    deleteById
  }
}

const transformSelectedFieldsToViewFields = (selectedFields = []) => {
  const mapFields = ({ staticName }) => `<FieldRef Name="${staticName}" />`

  return `<ViewFields Properties="True">
        <FieldRef Name="MetaInfo" />
        ${selectedFields.map(mapFields).join("")}
    </ViewFields>`
}
