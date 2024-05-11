import { App } from '../../Pages'
import '../styles/index.css'
import Updater from '../updater/Updater'

const Wrapper = () => {
	return (
		<div>
			<Updater />
			<App />
		</div>
	)
}

export default Wrapper
