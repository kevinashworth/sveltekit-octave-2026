export function getModifierKeyPrefix(): string {
	return navigator.platform.includes('Mac') ? '⌘' : 'Ctrl';
}
