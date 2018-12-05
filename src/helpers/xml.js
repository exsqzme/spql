const specialCharacterToEscapedCharacter = {
	'&': '&amp;',
	'"': '&quot;',
	'<': '&lt;',
	'>': '&gt;'
}

const escapedCharacterToSpecialCharacter = {
	'&amp;': '&',
	'&quot;': '"',
	'&lt;': '<',
	'&gt;': '>'
}

export const encodeXml = string => string.replace(
	/([\&"<>])/g,
	(str, item) => specialCharacterToEscapedCharacter[item]
)

export const decodeXml = string => string.replace(
	/(&quot;|&lt;|&gt;|&amp;)/g,
	(str, item) => escapedCharacterToSpecialCharacter[item]
)

/* Taken from http://dracoblue.net/dev/encodedecode-special-xml-characters-in-javascript/155/ */

export const escapeColumnValue = s => typeof s === 'string' ?
	s.replace(/&(?![a-zA-Z]{1,8};)/g, '&amp;') :
	s

const processXml = (mapFn, selector) => xml => Array.from(xml.querySelectorAll(selector)).map(mapFn)

export const updateListItemsXmlToJson = xml => {

	const selector = 'Result'
	const mapFn = node => {
		const itemNode = node.querySelector('row')
		const errorNode = node.querySelector('ErrorText')

		return {
			id: itemNode && itemNode.getAttribute("ows_ID"),
			error: errorNode && errorNode.textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim()
		}
	}

	return processXml(mapFn, selector)(xml)
}

export const getListItemsXmlToJson = fieldMap => {

	const selector = 'row'
	const mapFn = node => {
		let properties = {}
		for (const [staticName, variable] of Object.entries(fieldMap)) {
			properties[variable] = node.getAttribute(`ows_${staticName}`)
		}

		return properties
	}
	
	return processXml(mapFn, selector)
}

export const listInfoXmlToJson = xml => {

	const selector = 'Fields > Field'
	const mapFn = node => {
		let field = {
			displayName: node.getAttribute('DisplayName'),
			staticName: node.getAttribute('StaticName'),
			description: node.getAttribute('Description'),
			type: node.getAttribute('Type'),
			isHidden: node.getAttribute('Hidden') === 'TRUE',
			isReadOnly: node.getAttribute('ReadOnly') === 'TRUE',
			isFormBaseType: node.getAttribute('FromBaseType') === 'TRUE'
		}

		if (/choice/i.test(field.type)) {
			field.choices = choicesXmlToJson(node)
		}
		else if (/lookup/i.test(field.type)) {
			field.lookup = {
				webId: node.getAttribute('WebId'),
				listId: node.getAttribute('List'),
				fieldName: node.getAttribute('ShowField')
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

	const selector = 'CHOICE'
	const mapFn = node => ({value: node.textContent, displayValue: node.textContent})

	return processXml(mapFn, selector)(xml)
}

export const listCollectionXmlToJson = processXml(
	node => ({
		id: node.getAttribute('ID'),
		name: node.getAttribute('Title'),		
		siteUrl: node.getAttribute('WebFullUrl'),
		description: node.getAttribute('Description'),
		createdBy: node.getAttribute('Author'),
		created: node.getAttribute('Created'),
		modified: node.getAttribute('Modified'),
		itemCount: node.getAttribute('ItemCount'),
		defaultViewUrl: node.getAttribute('DefaultViewUrl'),
		isDocumentList: node.getAttribute('BaseType') === '1',
		isHidden: node.getAttribute('Hidden') === 'True'
	}),
	'List'
)

export const userGroupsXmlToJson = processXml(
	node => ({
		id: node.getAttribute('ID'),
		name: node.getAttribute('Name'),
		description: node.getAttribute('Description')
	}),
	'Group'
)