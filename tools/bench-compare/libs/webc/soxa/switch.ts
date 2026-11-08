import '@soxa-ui/webc/label'
import '@soxa-ui/webc/switch'
import { so } from '../dom'

export default () => so('label', 'so-label', { text: 'Включено' }, [so('span', 'so-switch')])
