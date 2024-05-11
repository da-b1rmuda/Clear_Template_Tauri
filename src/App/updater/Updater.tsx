import * as tauriEvent from '@tauri-apps/api/event'
import { relaunch } from '@tauri-apps/api/process'
import { checkUpdate, installUpdate } from '@tauri-apps/api/updater'
import { appWindow } from '@tauri-apps/api/window'
import { Button, notification } from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const RUNNING_IN_TAURI = window.__TAURI__ !== undefined

const Updater = () => {
	const { t, i18n } = useTranslation()
	const [api, contextHolder] = notification.useNotification()
	// Updater integration
	//TODO: add version types
	function startInstall(newVersion: any) {
		api.open({
			message: t('Installing update v{{ v }}', { v: newVersion }),
			description: t('Will relaunch afterwards'),
			duration: null,
		})
		installUpdate().then(relaunch)
	}

	// Tauri event listeners (run on mount)
	if (RUNNING_IN_TAURI) {
		useEffect(() => {
			const promise = tauriEvent.listen('longRunningThread', () => {})
			return () => {
				promise.then(unlisten => unlisten())
			}
		}, [])

		// update checker
		useEffect(() => {
			checkUpdate().then(({ shouldUpdate, manifest }) => {
				console.log(shouldUpdate)
				console.log(manifest)

				if (shouldUpdate) {
					const { version: newVersion, body: releaseNotes } = manifest ?? {}
					notification.open({
						message: t('Update v{{ v }} available', { v: newVersion }),
						description: (
							<>
								<h1>{releaseNotes}</h1>
								<Button
									style={{ width: '100%' }}
									onClick={() => startInstall(newVersion)}
								>
									{t('Install update and relaunch')}
								</Button>
							</>
						),
						duration: null,
					})
				}
			})
		}, [])

		useEffect(() => {
			const promise = tauriEvent.listen('newInstance', async () => {
				if (!(await appWindow.isVisible())) await appWindow.show()
				if (await appWindow.isMinimized()) {
					await appWindow.unminimize()
				}
			})
			return () => {
				promise.then(unlisten => unlisten())
			}
		}, [])
	}
	return <div>{contextHolder}</div>
}

export default Updater
