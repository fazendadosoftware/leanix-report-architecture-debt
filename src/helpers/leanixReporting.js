// https://leanix.github.io/leanix-reporting/interfaces/lxr.reportconfiguration.html
export const getReportConfiguration = ({setup, facetFiltersChangedCallback} = {}) => {
  const config = {
    allowTableView: false,
    facets: [
      {
        key: 'businessCapabilities',
        label: 'Business Capabilities',
        fixedFactSheetType: 'BusinessCapability',
        attributes: ['id', 'displayName'],
        facetFiltersChangedCallback
      }
    ]
  }
  return config
}
