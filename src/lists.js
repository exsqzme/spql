import {makeSoap} from './makeSoap'
import { updateListItems, getListItems, getList } from './operations/lists'
import { encodeXml, listInfoXmlToJson, updateListItemsXmlToJson, getListItemsXmlToJson } from './xml/helpers'

const DEFAULT_QUERY_OPTIONS = `<QueryOptions>
    <ViewAttributes Scope='RecursiveAll' />
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
        const staticNameToVariable = select.reduce((mapper, field) => {
            const [staticName, variable] = field.split(" AS ")
            mapper[staticName] = variable || staticName

            return mapper
        }, {})

        const requestOptions = {
            listName,
            viewFields: transformSelectedFieldsToViewFields(Object.keys(staticNameToVariable)),
            query: query,
            queryOptions: options.queryOptions || DEFAULT_QUERY_OPTIONS,
            rowLimit: options.rowLimit || 0,
        }

        return makeSoap(siteUrl, getListItems, requestOptions)
            .then(xml => options.xml ?
                xml :
                getListItemsXmlToJson(staticNameToVariable)(xml)
            )
    }

    const all = fields => soapGet(fields,
        `<Query>
            <Where>
                <IsNotNull>
                    <FieldRef Name="ID" />
                </IsNotNull>
            </Where>
        </Query>`
    )    

    const find = (query, fields) => soapGet(fields, query)

    const findById = (id, fields) => soapGet(fields,
        `<Query>
                <Where>
                    <Eq>
                        <FieldRef Name="ID" />
                        <Value Type="Text">${id}</Value>
                    </Eq>
                </Where>
            </Query>`
    )
        .then(([result]) => result)

    const findOne = (query, fields) => soapGet(fields, query, { rowLimit: 1 })
        .then(([result]) => result)

    const create = soapUpdate('New')

    const updateById = (id, fields) => {
        const items = { ID: id, ...fields }
        soapUpdate("Update")(items)
    }

    const deleteById = id => {
        const items = { ID: id }
        soapUpdate("Delete")(items)
    }

    const soapInfo = (options = {}) => makeSoap(siteUrl, getList, {listName})
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
        soapInfo({xml: true})
            .then(xml => {
                const itemCount = xml.querySelector("List").getAttribute("ItemCount")
                return itemCount ? parseInt(itemCount) : 0
            })

    const schema = () => soapInfo()

    return {
        schema,
        count,
        all,
        find,
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