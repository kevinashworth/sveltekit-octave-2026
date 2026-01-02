<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { DEFAULT_PAGE_SIZE } from '$lib/constants/pagination';
	import { getPaginationState } from '$lib/stores/pagination-state.svelte';
	import { cn } from '$lib/utils';
	import {
		BellIcon,
		BuildingIcon,
		CameraIcon,
		ContactIcon,
		HouseIcon,
		LogInIcon,
		TrendingUpIcon
	} from '@lucide/svelte';
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
		]
		// creation: [
		// 	{ label: 'New Contact', href: '/contacts/new', icon: ContactIcon },
		// 	{ label: 'New Office', href: '/offices/new', icon: BuildingIcon },
		// 	{ label: 'New Project', href: '/projects/new', icon: CameraIcon }
		// ],
		// administration: [
		// 	{ label: 'User Admin', href: '/admin/users', icon: UserIcon },
		// 	{ label: 'Comments Admin', href: '/admin/comments', icon: MessageCircleIcon },
		// 	{ label: 'Back Office', href: '/backoffice', icon: PencilIcon },
		// 	{ label: 'Statistics', href: '/statistics/list', icon: ChartColumnIcon }
		// ],
		// development: [
		// 	{ label: 'Apollo Test', href: '/test', icon: CodeIcon },
		// 	{ label: 'Debug', href: '/debug', icon: CodeIcon },
		// 	{ label: 'Fragments', href: '/fragments', icon: CodeIcon },
		// 	{ label: 'Contacts (M)', href: '/m/contacts', icon: ContactIcon },
		// 	{ label: 'Offices (M)', href: '/m/offices', icon: BuildingIcon },
		// 	{ label: 'Projects (M)', href: '/m/projects', icon: CameraIcon }
		// ]
	};

	let { hasHeader, hasFooter } = $props();

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
				// add pageSize to Contacts, Offices, and Projects
				if (
					(href === '/contacts' || href === '/offices' || href === '/projects') &&
					currentPageSize !== DEFAULT_PAGE_SIZE
				) {
					href = `${href}?pageSize=${currentPageSize}`;
				}
				map.set(link.href, href);
			});

		return map;
	});
</script>

<Sidebar.Root>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton>
							{#snippet child({ props })}
								<a href="/" {...props}>
									<HouseIcon class="size-5" />
									<span>Home</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
		{#each Object.entries(navItems) as [category, links] (category)}
			<Sidebar.Group>
				<Sidebar.GroupLabel class="font-bold uppercase">{category}</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each links as link (link.label)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton>
									{#snippet child({ props })}
										<a href={link.href} {...props}>
											<link.icon />
											<span>{link.label}</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/each}
	</Sidebar.Content>
	<Sidebar.Footer />
</Sidebar.Root>
