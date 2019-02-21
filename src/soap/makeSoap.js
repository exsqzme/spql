import {escapeColumnValue} from '../lib/xmlUtils'

const SCHEMA = 'http://schemas.microsoft.com/sharepoint'

export const makeSoap = (siteUrl, operation, options = {}) => {

    const {operationName, action, webService, additionalHeader} = operation
    const soapUrl = processSiteUrl(siteUrl, webService)

    let fetchOptions = {
		method: 'POST',
		body: `<soap:Envelope
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xmlns:xsd="http://www.w3.org/2001/XMLSchema"
            xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
            <soap:Body>
                <${operationName} xmlns="${SCHEMA}/soap/${additionalHeader}">
                    ${generatePayload(options)}
                </${operationName}>
            </soap:Body>
        </soap:Envelope>`,
        credentials: 'same-origin',
		headers: {
            'Accept': 'text/plain',
			'Content-Type': 'text/xml;charset="utf-8"'
		}
	}
	
	if (action) {
		fetchOptions.headers.SOAPAction = `${SCHEMA}/soap/${additionalHeader}${operationName}`
	}

    return fetchSoap(soapUrl, fetchOptions)        
}

const fetchSoap = async (url, options) => {
    const response = await fetch(url, options)
    const {status} = response
    const xml = await parseXmlFromResponse(response)

    if (status !== 200) {
        const errorDetails = xml.querySelector('errorstring').textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim()
        // Throw FETCH Type Error
        throw new Error(`${errorDetails || 'Error making SOAP Request'} (${status})`)
    }

    return xml
}

const parseXmlFromResponse = async response => {
    const text = await response.text()

    try {
        const oParser = new DOMParser()
        const xmlData = oParser.parseFromString(text, "application/xml")
        
        return xmlData
    } catch (err) {
        // Throw XML Type Error
        throw new Error('Unable to parse xml')
    }
    
}
    
const processSiteUrl = (siteUrl, webService) => `${siteUrl.replace(/\/$/, "")}/_vti_bin/${webService}.asmx`

const mapToTags = params => {
    return Object.keys(params)
        .map(tagName => `<${tagName}>${params[tagName]}</${tagName}>`)
        .join("")
}

const generatePayload = ({items, batchCmd, ...params}) => {
    return mapToTags(params) + processUpdates(batchCmd, items)
}

const processUpdates = (batchCmd, items) => {  

    const mapToFields = item => {
        return Object.keys(item)
            .map(fieldName => `<Field Name="${fieldName}">${escapeColumnValue(item[fieldName])}</Field>`)
            .join("")
    }
    const mapItemsToMethods = (item, i) => {
        return `<Method ID="${item.ID ? item.ID : (i+1)}" Cmd="${batchCmd}">
            ${mapToFields(item)}        
        </Method>`
    }

    if (batchCmd && items) {
        return `<updates>
            <Batch onError="Continue">
                ${items.map(mapItemsToMethods).join("")}
            </Batch>
        </updates>`
    } else {
        return ''
    }
}
