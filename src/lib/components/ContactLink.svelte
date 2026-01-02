<script lang="ts">
	import {
		DatabaseIcon,
		FacebookIcon,
		GlobeIcon,
		InstagramIcon,
		LinkedinIcon,
		OctagonAlertIcon,
		TvMinimalPlayIcon,
		TwitterIcon,
		UnlinkIcon,
		YoutubeIcon
	} from '@lucide/svelte';

	interface ContactLink {
		profile_link: string;
		platform_name?: string | null;
		// profile_name?: string | null;
	}

	interface Props {
		link: ContactLink;
		showText?: boolean;
	}

	let { link, showText = true }: Props = $props();

	const uid = crypto.randomUUID();
	const buttonId = `link-button-${uid}`;

	function getIconComponent(platformName: string | null | undefined) {
		if (!platformName) return OctagonAlertIcon;
		return (
			LINK_ICON_ENUM.find((icon) => icon.platform_name === platformName)?.icon ?? OctagonAlertIcon
		);
	}

	const LINK_ICON_ENUM = [
		{ platform_name: 'CSA', icon: UnlinkIcon },
		{ platform_name: 'Facebook', icon: FacebookIcon },
		{ platform_name: 'IMDb', icon: DatabaseIcon },
		{ platform_name: 'IMDbPro', icon: DatabaseIcon },
		{ platform_name: 'IMDb Pro', icon: DatabaseIcon },
		{ platform_name: 'Instagram', icon: InstagramIcon },
		{ platform_name: 'LinkedIn', icon: LinkedinIcon },
		{ platform_name: 'Twitter', icon: TwitterIcon },
		{ platform_name: 'Vimeo', icon: TvMinimalPlayIcon },
		{ platform_name: 'Website', icon: GlobeIcon },
		{ platform_name: 'YouTube', icon: YoutubeIcon }
	];

	const IconComponent = $derived(getIconComponent(link.platform_name));
</script>

<div>
	<button appearance="filled" href={link.profile_link} id={buttonId} size="small" variant="brand">
		<div class="flex items-center gap-1">
			<IconComponent />
			{#if showText}
				<span class="text-xs">{link.platform_name}</span>
			{/if}
		</div>
	</button>
	<tooltip for={buttonId} placement="bottom-start" style="--max-width: 920px;">
		<div class="text-sm text-nowrap">
			{link.platform_name}<br />{link.profile_link}
		</div>
	</tooltip>
</div>
