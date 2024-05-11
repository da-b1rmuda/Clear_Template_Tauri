import { useTranslation } from 'react-i18next'

function App() {
	const { t, i18n } = useTranslation()
	const changeLanguage = (lng: string) => {
		i18n.changeLanguage(lng)
	}
	return (
		<div className='container'>
			<h1 className='text-3xl font-bold underline bg-green-400'>
				{t('Welcome to tauri!')}
			</h1>
			<button onClick={() => changeLanguage('en')}>EN</button>
			<button onClick={() => changeLanguage('ru')}>RU</button>
		</div>
	)
}

export default App
