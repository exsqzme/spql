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
		fetchOptions.headers.SOAPAction = `${SCHEMA}/soap/${name}`
	}

    return fetch(soapUrl, fetchOptions)
        .then(response => {
            if (response.status !== 200) throw new Error(`${response.status}: ${response.statusText}`)

            return response.text()
        })
        .then(data => {
            let xmlData
            
            try {
                let oParser = new DOMParser()
                xmlData = oParser.parseFromString(data, "application/xml")            
            } catch (err) {
                throw new Error('Unable to parse xml')
            }        
            
            return xmlData
        })
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
