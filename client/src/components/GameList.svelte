<script lang="ts">
    import { onMount } from "svelte";

    interface Game {
        id: number;
        title: string;
        description: string;
        publisher?: {
            id: number;
            name: string;
        } | null;
        category?: {
            id: number;
            name: string;
        } | null;
        starRating?: number | null;
    }

    interface Category {
        id: number;
        name: string;
    }

    interface Publisher {
        id: number;
        name: string;
    }

    export let games: Game[] = [];
    let loading = true;
    let error: string | null = null;
    let categories: Category[] = [];
    let publishers: Publisher[] = [];
    
    // Filter state
    let selectedCategoryId: number | null = null;
    let selectedPublisherId: number | null = null;

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            if (response.ok) {
                categories = await response.json();
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const fetchPublishers = async () => {
        try {
            const response = await fetch('/api/publishers');
            if (response.ok) {
                publishers = await response.json();
            }
        } catch (err) {
            console.error('Error fetching publishers:', err);
        }
    };

    const fetchGames = async () => {
        loading = true;
        try {
            // Build query parameters
            const params = new URLSearchParams();
            if (selectedCategoryId) {
                params.append('category_id', selectedCategoryId.toString());
            }
            if (selectedPublisherId) {
                params.append('publisher_id', selectedPublisherId.toString());
            }

            const url = `/api/games${params.toString() ? '?' + params.toString() : ''}`;
            const response = await fetch(url);
            if(response.ok) {
                games = await response.json();
            } else {
                error = `Failed to fetch data: ${response.status} ${response.statusText}`;
            }
        } catch (err) {
            error = `Error: ${err instanceof Error ? err.message : String(err)}`;
        } finally {
            loading = false;
        }
    };

    const updateURL = () => {
        const url = new URL(window.location.href);
        const params = url.searchParams;
        
        // Clear existing filter params
        params.delete('category_id');
        params.delete('publisher_id');
        
        // Add current filter params
        if (selectedCategoryId) {
            params.set('category_id', selectedCategoryId.toString());
        }
        if (selectedPublisherId) {
            params.set('publisher_id', selectedPublisherId.toString());
        }
        
        // Update URL without page refresh
        window.history.replaceState({}, '', url.toString());
    };

    const loadFiltersFromURL = () => {
        const params = new URLSearchParams(window.location.search);
        const categoryParam = params.get('category_id');
        const publisherParam = params.get('publisher_id');
        
        selectedCategoryId = categoryParam ? parseInt(categoryParam) : null;
        selectedPublisherId = publisherParam ? parseInt(publisherParam) : null;
    };

    const handleCategoryChange = (event: Event) => {
        const target = event.target as HTMLSelectElement;
        selectedCategoryId = target.value ? parseInt(target.value) : null;
        updateURL();
        fetchGames();
    };

    const handlePublisherChange = (event: Event) => {
        const target = event.target as HTMLSelectElement;
        selectedPublisherId = target.value ? parseInt(target.value) : null;
        updateURL();
        fetchGames();
    };

    const clearFilters = () => {
        selectedCategoryId = null;
        selectedPublisherId = null;
        updateURL();
        fetchGames();
    };

    onMount(async () => {
        loadFiltersFromURL();
        await Promise.all([fetchCategories(), fetchPublishers()]);
        fetchGames();
    });
</script>

<div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 class="text-2xl font-medium text-slate-100">Featured Games</h2>
        
        <!-- Filter Controls -->
        <div class="flex flex-col sm:flex-row gap-3">
            <!-- Category Filter -->
            <div class="relative">
                <select 
                    class="bg-slate-800/60 border border-slate-700/50 text-slate-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 min-w-[150px]"
                    value={selectedCategoryId || ''}
                    on:change={handleCategoryChange}
                    data-testid="category-filter"
                >
                    <option value="">All Categories</option>
                    {#each categories as category}
                        <option value={category.id}>{category.name}</option>
                    {/each}
                </select>
            </div>
            
            <!-- Publisher Filter -->
            <div class="relative">
                <select 
                    class="bg-slate-800/60 border border-slate-700/50 text-slate-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 min-w-[150px]"
                    value={selectedPublisherId || ''}
                    on:change={handlePublisherChange}
                    data-testid="publisher-filter"
                >
                    <option value="">All Publishers</option>
                    {#each publishers as publisher}
                        <option value={publisher.id}>{publisher.name}</option>
                    {/each}
                </select>
            </div>
            
            <!-- Clear Filters Button -->
            {#if selectedCategoryId || selectedPublisherId}
                <button 
                    class="bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-slate-100 text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200 whitespace-nowrap"
                    on:click={clearFilters}
                    data-testid="clear-filters-btn"
                >
                    Clear Filters
                </button>
            {/if}
        </div>
    </div>
    
    <!-- Active Filters Indicator -->
    {#if selectedCategoryId || selectedPublisherId}
        <div class="mb-4 flex flex-wrap gap-2" data-testid="active-filters">
            <span class="text-sm text-slate-400">Active filters:</span>
            {#if selectedCategoryId}
                {#each categories as category}
                    {#if category.id === selectedCategoryId}
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/60 text-blue-300">
                            Category: {category.name}
                        </span>
                    {/if}
                {/each}
            {/if}
            {#if selectedPublisherId}
                {#each publishers as publisher}
                    {#if publisher.id === selectedPublisherId}
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/60 text-purple-300">
                            Publisher: {publisher.name}
                        </span>
                    {/if}
                {/each}
            {/if}
        </div>
    {/if}
    
    {#if loading}
        <!-- loading animation -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each Array(6) as _, i}
                <div class="bg-slate-800/60 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-slate-700/50">
                    <div class="p-6">
                        <div class="animate-pulse">
                            <div class="h-6 bg-slate-700 rounded w-3/4 mb-3"></div>
                            <div class="h-4 bg-slate-700 rounded w-1/2 mb-4"></div>
                            <div class="h-3 bg-slate-700 rounded w-full mb-3"></div>
                            <div class="h-3 bg-slate-700 rounded w-5/6 mb-4"></div>
                            <div class="h-2 bg-slate-700 rounded-full w-full mb-2"></div>
                            <div class="h-4 bg-slate-700 rounded w-1/4 mt-4"></div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {:else if error}
        <!-- error display -->
        <div class="text-center py-12 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700">
            <p class="text-red-400">{error}</p>
        </div>
    {:else if games.length === 0}
        <!-- no games found -->
        <div class="text-center py-12 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700">
            <p class="text-slate-300">No games available at the moment.</p>
        </div>
    {:else}
        <!-- game list -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="games-grid">
            {#each games as game (game.id)}
                <a 
                    href={`/game/${game.id}`} 
                    class="group block bg-slate-800/60 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-slate-700/50 hover:border-blue-500/50 hover:shadow-blue-500/10 hover:shadow-xl transition-all duration-300 hover:translate-y-[-6px]"
                    data-testid="game-card"
                    data-game-id={game.id}
                    data-game-title={game.title}
                >
                    <div class="p-6 relative">
                        <div class="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div class="relative z-10">
                            <h3 class="text-xl font-semibold text-slate-100 mb-2 group-hover:text-blue-400 transition-colors" data-testid="game-title">{game.title}</h3>
                            
                            {#if game.category?.name || game.publisher?.name}
                                <div class="flex gap-2 mb-3">
                                    {#if game.category?.name}
                                        <span class="text-xs font-medium px-2.5 py-0.5 rounded bg-blue-900/60 text-blue-300" data-testid="game-category">
                                            {game.category.name}
                                        </span>
                                    {/if}
                                    {#if game.publisher?.name}
                                        <span class="text-xs font-medium px-2.5 py-0.5 rounded bg-purple-900/60 text-purple-300" data-testid="game-publisher">
                                            {game.publisher.name}
                                        </span>
                                    {/if}
                                </div>
                            {/if}
                            
                            <p class="text-slate-400 mb-4 text-sm line-clamp-2" data-testid="game-description">{game.description}</p>
                            
                            <div class="mt-4 text-sm text-blue-400 font-medium flex items-center">
                                <span>View details</span>
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1 transform transition-transform duration-300 group-hover:translate-x-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </a>
            {/each}
        </div>
    {/if}
</div>