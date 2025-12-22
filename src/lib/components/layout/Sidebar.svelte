<script lang="ts">
	import { DEFAULT_PAGE_SIZE } from '$lib/constants/pagination';
	import { getPaginationState } from '$lib/stores/pagination-state.svelte';
	import {
		BellIcon,
		BuildingIcon,
		CameraIcon,
		ChartColumnIcon,
		CodeIcon,
		ContactIcon,
		HouseIcon,
		LogInIcon,
		MessageCircleIcon,
		PencilIcon,
		TrendingUpIcon,
		UserIcon
	} from '@lucide/svelte';
	import { Navigation } from '@skeletonlabs/skeleton-svelte';
	import { SvelteMap } from 'svelte/reactivity';

	const navItems = {
		authentication: [{ label: 'Sign In / Sign Up', href: '/login', icon: LogInIcon }],
		main: [
			{ label: 'Latest Updates', href: '/latest', icon: BellIcon },
			{ label: 'Trends', href: '/trends', icon: TrendingUpIcon }
		],
		information: [
			{ label: 'Contacts', href: '/contacts', icon: ContactIcon },
			{ label: 'Offices', href: '/offices', icon: BuildingIcon },
			{ label: 'Projects', href: '/projects', icon: CameraIcon },
			{ label: 'Past Projects', href: '/past-projects', icon: CameraIcon }
		],
		creation: [
			{ label: 'New Contact', href: '/contacts/new', icon: ContactIcon },
			{ label: 'New Office', href: '/offices/new', icon: BuildingIcon },
			{ label: 'New Project', href: '/projects/new', icon: CameraIcon }
		],
		administration: [
			{ label: 'User Admin', href: '/admin/users', icon: UserIcon },
			{ label: 'Comments Admin', href: '/admin/comments', icon: MessageCircleIcon },
			{ label: 'Back Office', href: '/backoffice', icon: PencilIcon },
			{ label: 'Statistics', href: '/statistics/list', icon: ChartColumnIcon }
		],
		development: [
			{ label: 'Apollo Test', href: '/test', icon: CodeIcon },
			{ label: 'Debug', href: '/debug', icon: CodeIcon },
			{ label: 'Fragments', href: '/fragments', icon: CodeIcon },
			{ label: 'Contacts (M)', href: '/m/contacts', icon: ContactIcon },
			{ label: 'Offices (M)', href: '/m/offices', icon: BuildingIcon },
			{ label: 'Projects (M)', href: '/m/projects', icon: CameraIcon }
		]
	};

	let { hasHeader } = $props();

	const paginationState = getPaginationState();

	// derived (reactive) map of hrefs that updates when pageSize changes
	const navHrefs = $derived.by(() => {
		const currentPageSize = paginationState.pageSize;
		const map = new SvelteMap<string, string>();

		// Build href map for all nav items
		Object.values(navItems)
			.flat()
			.forEach((link) => {
				let href = link.href;
				// add pageSize to Contacts and Offices
				if (
					(href === '/contacts' || href === '/offices') &&
					currentPageSize !== DEFAULT_PAGE_SIZE
				) {
					href = `${href}?pageSize=${currentPageSize}`;
				}
				map.set(link.href, href);
			});

		return map;
	});
</script>

<aside
	class={[
		'sticky col-span-1 h-full  w-fit overflow-hidden',
		{ 'top-12  max-h-[calc(100vh-(--spacing(12)))]': hasHeader }
	]}
>
	<Navigation layout="sidebar" class="flex h-full w-fit flex-col gap-4">
		<Navigation.Content class="flex-1 overflow-y-auto">
			<Navigation.Group>
				<Navigation.Menu>
					<Navigation.TriggerAnchor href="/">
						<HouseIcon class="size-5" />
						<Navigation.TriggerText>Home</Navigation.TriggerText>
					</Navigation.TriggerAnchor>
				</Navigation.Menu>
			</Navigation.Group>
			{#each Object.entries(navItems) as [category, links] (category)}
				<Navigation.Group>
					<Navigation.Label class="pl-2 font-bold uppercase">{category}</Navigation.Label>
					<Navigation.Menu>
						{#each links as link (link)}
							<Navigation.TriggerAnchor
								href={navHrefs.get(link.href) ?? link.href}
								title={link.label}
								aria-label={link.label}
							>
								<link.icon class="size-5" />
								<Navigation.TriggerText class="text-sm">{link.label}</Navigation.TriggerText>
							</Navigation.TriggerAnchor>
						{/each}
					</Navigation.Menu>
				</Navigation.Group>
			{/each}
		</Navigation.Content>
	</Navigation>
</aside>
