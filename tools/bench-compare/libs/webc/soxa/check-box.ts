import '@soxa-ui/webc/check-box'
import '@soxa-ui/webc/label'
import { so } from '../dom'

export default () => so('label', 'so-label', { text: 'Согласен' }, [so('span', 'so-check-box')])
