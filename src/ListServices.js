import { makeSoap } from './makeSoap'
import { updateListItems, getListItems, getListItemsChanges, getList } from './operations/lists'
import { encodeXml, listInfoXmlToJson, updateListItemsXmlToJson, getListItemsXmlToJson } from './helpers/xml'
import CamlBuilder from './camlBuilder/caml'

const { Query, EQ, IS_NOT_NULL, Types } = CamlBuilder

const DEFAULT_QUERY_OPTIONS = `<QueryOptions>
    <ViewAttributes Scope="RecursiveAll" />
    <IncludeMandatoryColumns>FALSE</IncludeMandatoryColumns>
    <ViewFieldsOnly>TRUE</ViewFieldsOnly>
</QueryOptions>`

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
            .then(result => Array.isArray(items) ? result : result[0])
    }

    const soapGet = (select, where, options = {}) => {

        const getOperation = options.withChanges ?
            getListItemsChanges :
            getListItems

        if (typeof select === 'string') select = [select]
        const staticNameToVariable = select.reduce((mapper, field) => {
            const [staticName, variable] = field.split(" AS ")
            mapper[staticName] = variable || staticName

            return mapper
        }, {})

        const requestOptions = {
            listName,
            viewFields: transformSelectedFieldsToViewFields(Object.keys(staticNameToVariable)),
            query: where,
            queryOptions: options.queryOptions || DEFAULT_QUERY_OPTIONS,
            rowLimit: options.rowLimit || 0,
            ...(options.changeToken && {changeToken: options.changeToken})
        }

        return makeSoap(siteUrl, getOperation, requestOptions)
            .then(xml => options.xml ?
                xml :
                getListItemsXmlToJson(staticNameToVariable)(xml)
            )
    }

    const all = select => soapGet(select, Query(IS_NOT_NULL('ID')))

    const find = (select, where) => soapGet(select, where)

    const findWithChanges = ({select, where, changeToken}) => soapGet(select, where, {changeToken, withChanges: true, xml: true})

    const findById = (select, id) =>
        soapGet(select, Query(EQ('ID', id, Types.COUNTER)))
            .then(([result]) => result)

    const findOne = (select, where) =>
        soapGet(select, where, { rowLimit: 1 })
            .then(([result]) => result)

    const create = soapUpdate('New')

    const updateById = (id, updates) => {
        const items = { ID: id, ...updates }
        soapUpdate("Update")(items)
    }

    const deleteById = id => {
        const items = { ID: id }
        soapUpdate("Delete")(items)
    }

    const soapInfo = (options = {}) => makeSoap(siteUrl, getList, { listName })
        .then(xml => options.xml ?
            xml :
            listInfoXmlToJson(xml)
        )

    const count = (query) => query ?
        soapGet(["ID"], query, { xml: true })
            .then(xml => {
                const itemCount = xml.querySelector("data").getAttribute("ItemCount")
                return itemCount ? parseInt(itemCount) : 0
            }) :
        soapInfo({ xml: true })
            .then(xml => {
                const itemCount = xml.querySelector("List").getAttribute("ItemCount")
                return itemCount ? parseInt(itemCount) : 0
            })

    const getSchema = () => soapInfo()

    return {
        getSchema,
        count,
        all,
        find,
        findWithChanges,
        findById,
        findOne,
        create,
        updateById,
        deleteById
    }
}

const transformSelectedFieldsToViewFields = (selectedFields = []) => {
    const mapFields = staticName => `<FieldRef Name="${staticName}" />`

    return `<ViewFields Properties="True">
        <FieldRef Name="MetaInfo" />
        ${selectedFields.map(mapFields).join("")}
    </ViewFields>`
}