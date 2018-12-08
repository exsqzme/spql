import {escapeColumnValue} from './helpers/xml'

const SCHEMA = 'http://schemas.microsoft.com/sharepoint'

export const makeSoap = (siteUrl, operation, options = {}) => {

    const {name, action, service, additionalHeader} = operation
    const soapUrl = processSiteUrl(siteUrl, service)

    let fetchOptions = {
		method: 'POST',
		body: `<soap:Envelope
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xmlns:xsd="http://www.w3.org/2001/XMLSchema"
            xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
            <soap:Body>
                <${name} xmlns="${SCHEMA}/soap/${additionalHeader}">
                    ${generatePayload(options)}
                </${name}>
            </soap:Body>
        </soap:Envelope>`,
        credentials: 'same-origin',
		headers: {
            'Accept': 'text/plain',
			'Content-Type': 'text/xml;charset="utf-8"'
		}
	}
	
	if (action) {
		fetchOptions.headers.SOAPAction = `${SCHEMA}/soap/${additionalHeader}${name}`
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
    
const processSiteUrl = (siteUrl, service) => `${siteUrl.replace(/\/$/, "")}/_vti_bin/${service}.asmx`

const mapToTags = ([tagName, value]) => `<${tagName}>${value}</${tagName}>`

const generatePayload = ({items, batchCmd, ...params}) => {
    return Object.entries(params).map(mapToTags).join("") + processUpdates(batchCmd, items)
}

const processUpdates = (batchCmd, items) => {  
    const mapToFields = ([fieldName, value]) => `<Field Name="${fieldName}">${escapeColumnValue(value)}</Field>`
    const mapItemsToMethods = (item, i) => {
        return `<Method ID="${i+1}" Cmd="${batchCmd}">
            ${Object.entries(item).map(mapToFields).join("")}        
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
