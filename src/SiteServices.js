import { makeSoap } from "./soap/makeSoap"
import { getListCollection } from "./soap/web-services/lists"
import { addDocument } from "./soap/web-services/copy"
import { listCollectionXmlToJson, uploadDocumentXmlToJson } from "./utils/xml"

const SiteServices = siteUrl => {
  const getListCollectionInfo = () =>
    makeSoap(siteUrl, getListCollection).then(listCollectionXmlToJson)

  const uploadDocument = ({
    fileStream,
    fileName,
    destination,
    fields = []
  }) => {
    const requestOptions = {
      DestinationUrls: [`${siteUrl}/${destination}/${fileName}`]
        .map(url => `<string>${url}</string>`)
        .join(""),
      Stream: fileStream,
      Fields: fields
        .map(
          f =>
            `<FieldInformation Type="${f.type} DisplayName: "${
              f.displayName
            }" InternalName="${f.staticName}" Value="${f.value}" />`
        )
        .join("")
    }

    return makeSoap(siteUrl, addDocument, requestOptions)
      .then(uploadDocumentXmlToJson)
      .then(result => result[0])
  }

  return {
    getListCollectionInfo,
    uploadDocument
  }
}

export default SiteServices
