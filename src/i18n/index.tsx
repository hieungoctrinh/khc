import I18n from 'react-native-i18n'
import vi from './languages/vi'
import en from './languages/en'

I18n.fallbacks = false

I18n.translations = {
  vi,
  en
}
I18n.locale = 'vi'

export default I18n
