import startsWith from 'lodash/startsWith'

export function isStartPartOrEnd(searchString: string, string: string) {
  return startsWith(string, searchString) || string.includes(searchString) || string === searchString
}

export function parsedSearchTextToList(searchText: string) {
  return searchText
    .toLowerCase()
    .split(searchText.indexOf(',') !== -1 ? ',' : ' ')
    .filter((st) => st !== '')
    .map((st) => st.trim())
}

export const cellWidths = {
  wInPool: { $w20: true },
  wRewardsAll: { $w240: true },
  wRewardsBase: { $w130: true },
  wTvl: { $w130: true },
  wVolume: { $w130: true },
}
