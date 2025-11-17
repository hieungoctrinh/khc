import { StyleSheet } from 'react-native'

const styleGlobal = StyleSheet.create({
  flex1: {
    flex: 1
  },
  row: {
    flexDirection: 'row'
  },
  rowCenter: {
    flexDirection: 'row',
    alignSelf: 'center'
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  rowCenterBetween: {
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'space-between'
  }
})
export default styleGlobal
