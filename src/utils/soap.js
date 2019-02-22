export const createWebService = (webService, additionalHeader = '') => operation => ({
  operationName: operation.name,
  action: operation.action,
  webService,  
  additionalHeader
})