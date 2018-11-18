import axios from 'axios';
import {escapeColumnValue} from './xml/helpers'

const SCHEMA = 'http://schemas.microsoft.com/sharepoint'

export const makeSoap = (siteUrl, operation, options) => {

    const {name, action, service, additionalHeader} = operation
    const soapUrl = processSiteUrl(siteUrl, service)

    let ajaxOptions = {
		url: soapUrl,
		method: 'post',
		responseType: 'text',
		data: `<soap:Envelope
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xmlns:xsd="http://www.w3.org/2001/XMLSchema"
            xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
            <soap:Body>
                <${name} xmlns="${SCHEMA}/soap/${additionalHeader}">
                    ${generatePayload(options)}
                </${name}>
            </soap:Body>
        </soap:Envelope>`,
		headers: {
			'content-type': 'text/xml;charset="utf-8"'
		}
	}
	
	if (action) {
		ajaxOptions.headers.SOAPAction = `${SCHEMA}/soap/${name}`
	}

	return axios(ajaxOptions).then(({status, statusText, data}) => {
        let xmlData
        
        if (status !== 200) throw new Error(`${status}: ${statusText}`)   
        
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
        return ""
    }
}
