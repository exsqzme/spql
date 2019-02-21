import { makeSoap } from './soap/makeSoap'
import { updateListItems, getListItems, getListItemsChanges, getList } from './soap/web-services/lists'
import { encodeXml, listInfoXmlToJson, updateListItemsXmlToJson, getListItemsXmlToJson } from './lib/xmlUtils'
import Caml, {toCaml} from './caml'

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

    const soapGet = (select, query, options = {}) => {

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
            query,
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

    const all = ({select, orderBy, maxResults}) => {
        const query = toCaml(Caml.IS_NOT_NULL('ID'), orderBy)

        return soapGet(select, query, {rowLimit: maxResults})
    }

    const find = ({select, where, orderBy, maxResults}) => {
        const query = toCaml(where, orderBy)

        return soapGet(select, query, {rowLimit: maxResults})
    }

    const findWithChanges = ({select, where, changeToken}) => {
        const query = toCaml(where)
        return soapGet(select, query, {changeToken, withChanges: true, xml: true})
    }

    //TODO: EQ
    const findById = ({select, id}) => {
        const query = toCaml(Caml.EQ({fieldName: 'ID', value: id, type: Caml.Types.COUNTER}))
        return soapGet(select, query)
            .then(([result]) => result)
    }

    const findOne = ({select, where}) => {
        const query = toCaml(where)
        return soapGet(select, query, { rowLimit: 1 })
            .then(([result]) => result)
    }

    const create = soapUpdate('New')

    const updateById = (id, updates) => {
        const items = { ID: id, ...updates }
        return soapUpdate("Update")(items)
    }

    const deleteById = id => {
        const items = { ID: id }
        return soapUpdate("Delete")(items)
    }

    const soapInfo = (options = {}) => makeSoap(siteUrl, getList, { listName })
        .then(xml => options.xml ?
            xml :
            listInfoXmlToJson(xml)
        )

    const count = (where) => {
        let resultPromise
        let selector

        if (where) {
            const query = toCaml(where)
            resultPromise = soapGet(["ID"], query, { xml: true })
            selector = "data"
        }
        else {
            resultPromise = soapInfo({ xml: true })
            selector = "List"
        }

        return resultPromise
            .then(xml => {
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
        findWithChanges,
        findById,
        findOne,
        create,
        updateById,
        deleteById
    }
}

// TODO: Use with caml helpers
const transformSelectedFieldsToViewFields = (selectedFields = []) => {
    const mapFields = staticName => `<FieldRef Name="${staticName}" />`

    return `<ViewFields Properties="True">
        <FieldRef Name="MetaInfo" />
        ${selectedFields.map(mapFields).join("")}
    </ViewFields>`
}