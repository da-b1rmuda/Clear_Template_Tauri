import { I18nextProvider } from 'react-i18next'
import { App } from '../../Pages'
import '../styles/index.css'
import i18n from '../translations/i18n.ts'
import Updater from '../updater/Updater'

const Wrapper = () => {
	return (
		<I18nextProvider i18n={i18n}>
			<Updater />
			<App />
		</I18nextProvider>
	)
}

export default Wrapper
