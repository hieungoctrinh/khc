import R from '@assets/index'
import { StyleSheet } from 'react-native'
import { moderateScale } from './scale'

const fontSize = StyleSheet.create({
  regular10: {
    fontFamily: R.fonts.fontRegular,
    fontSize: moderateScale(10)
  },
  regular12: {
    fontFamily: R.fonts.fontRegular,
    fontSize: moderateScale(12)
  },
  regular14: {
    fontFamily: R.fonts.fontRegular,
    fontSize: moderateScale(14)
  },
  regular16: {
    fontFamily: R.fonts.fontRegular,
    fontSize: moderateScale(16)
  },
  regular18: {
    fontFamily: R.fonts.fontRegular,
    fontSize: moderateScale(18)
  },
  regular20: {
    fontFamily: R.fonts.fontRegular,
    fontSize: moderateScale(20)
  }
})

export default fontSize
